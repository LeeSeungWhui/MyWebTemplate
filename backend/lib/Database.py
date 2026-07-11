"""
파일명: backend/lib/Database.py
작성자: LSH
갱신일: 2026-01-18
설명: DB 매니저/쿼리 로더/디렉터리 감시. 파라미터 바인딩 강제·PII 마스킹 로깅
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
from typing import Any
import contextvars
from urllib.parse import urlsplit, urlunsplit

from databases import Database
from lib.Logger import logger
from lib.ServiceError import ServiceError
from lib.SqlLoader import parseSqlFile, scanSqlQueries
from sqlalchemy import MetaData

try:
    from watchdog.events import FileSystemEvent, FileSystemEventHandler
    from watchdog.observers import Observer

    watchdogAvailable: bool = True
except Exception:
    FileSystemEvent = Any  # type: ignore[assignment]

    class FileSystemEventHandler:  # type: ignore[no-redef]
        pass

    Observer = None  # type: ignore[assignment]
    watchdogAvailable = False

# =========================
# 모듈 전역 상태
# =========================

dbManagers: dict[str, "DatabaseManager"] = {}

# 기본 DB 이름(템플릿 기본값은 main_db)
primaryDbName: str | None = None

# 일부 서드파티 패키지는 PEP 561 타입 스텁이 없어 Pylance가 Unknown으로 인식한다.
sqlObserver: Any | None = None

baseDir = os.path.dirname(__file__)

# 기본 쿼리 디렉터리: backend/query
queryDir: str = os.path.normpath(os.path.join(baseDir, "..", "query"))
queryWatch: bool = True
debounceMs: int = 150
debounceTimer: threading.Timer | None = None
lastChangedFile: str | None = None
pendingChangedFiles: set[str] = set()
debounceStateLock = threading.Lock()
reloadPublicationLock = threading.Lock()

# 요청 단위 SQL 카운터(ContextVar)
sqlCountVar: contextvars.ContextVar[list[int] | None] = contextvars.ContextVar("sql_count", default=None)

SENSITIVE_SQL_PARAM_NAME_PATTERN = re.compile(
    r"(pass(word)?|pwd|secret|token|refresh|access|auth|cookie|session|csrf|email|eml|phone|mobile|tel|ssn|rrn|card|account|acct|bank)",
    re.IGNORECASE,
)
EMAIL_LITERAL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
JWT_LITERAL_PATTERN = re.compile(r"^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$")
INLINE_SQL_STRING_LITERAL_PATTERN = r"'(?:''|[^'])*'"
INLINE_SQL_NUMERIC_LITERAL_PATTERN = r"-?\d+(?:\.\d+)?"
SQL_STRING_LITERAL_MARKER = "__SQL_STRING_LITERAL__"
SQL_NUMERIC_LITERAL_MARKER = "__SQL_NUMERIC_LITERAL__"
SQL_NUMERIC_LITERAL_PATTERN = re.compile(
    r"""
    (?<![\w$.])
    (?:
        0[xX][0-9a-fA-F](?:_?[0-9a-fA-F])*
        |0[bB][01](?:_?[01])*
        |0[oO][0-7](?:_?[0-7])*
        |(?:\d(?:_?\d)*(?:\.(?:\d(?:_?\d)*)?)?|\.\d(?:_?\d)*)(?:[eE][+-]?\d(?:_?\d)*)?
    )
    (?![\w$])
    """,
    re.VERBOSE,
)
SQL_ANALYSIS_STRING_LITERAL_PATTERN = rf"""
(?:
    (?:(?:date|time|timestamp)(?:\s*\(\s*(?:\d+|{SQL_NUMERIC_LITERAL_MARKER})\s*\))?(?:\s+(?:with|without)\s+time\s+zone)?|interval)\s+
)?
{SQL_STRING_LITERAL_MARKER}
"""
SQL_ANALYSIS_LITERAL_PATTERN = rf"(?:[-+]?{SQL_NUMERIC_LITERAL_MARKER}|{SQL_ANALYSIS_STRING_LITERAL_PATTERN})"
SQL_ANALYSIS_LITERAL_OPERAND_PATTERN = rf"""
(?:\(\s*)*
{SQL_ANALYSIS_LITERAL_PATTERN}
(?:\s*\))*
"""
SQL_ANALYSIS_CAST_LITERAL_PREFIX_PATTERN = re.compile(
    rf"""
    \bcast\s*\(\s*
    {SQL_ANALYSIS_LITERAL_OPERAND_PATTERN}
    \s+as\b
    """,
    re.IGNORECASE | re.VERBOSE,
)
UNSAFE_INLINE_LITERAL_PREDICATE_PATTERN = re.compile(
    rf"""
    (?:
        (?:=|<>|!=|<=|>=|<|>|\b(?:not\s+)?like\b)\s*{SQL_ANALYSIS_LITERAL_OPERAND_PATTERN}
        |
        {SQL_ANALYSIS_LITERAL_OPERAND_PATTERN}\s*(?:=|<>|!=|<=|>=|<|>|\b(?:not\s+)?like\b)
        |
        \b(?:not\s+)?in\s*\([^)]*{SQL_ANALYSIS_LITERAL_OPERAND_PATTERN}
        |
        \b(?:not\s+)?between\s+(?:(?:symmetric|asymmetric)\s+)?{SQL_ANALYSIS_LITERAL_OPERAND_PATTERN}
        |
        \b(?:not\s+)?between\s+(?:(?:symmetric|asymmetric)\s+)?(?:(?!\band\b)[\s\S])*?\band\s+{SQL_ANALYSIS_LITERAL_OPERAND_PATTERN}
    )
    """,
    re.IGNORECASE | re.VERBOSE,
)
SQL_PREDICATE_CLAUSE_PATTERN = re.compile(
    r"(?<!:)\b(?:group\s+by|order\s+by|where|having|join|on|limit|offset|fetch|returning|union|intersect|except)\b",
    re.IGNORECASE,
)


def maskDatabaseUrl(url: str) -> str:
    """
 설명: DB 접속 URL에서 자격증명(password) 마스킹해 로그에 노출되지 않게
    처리 규칙: URL 파싱이 실패하면 정규식 대체 마스킹을 시도하고, 최종 실패 시 <redacted>를 반환
    갱신일: 2026-02-06
    """
    if not url or not isinstance(url, str):
        return ""
    try:
        urlParts = urlsplit(url)
        if not urlParts.netloc or "@" not in urlParts.netloc:
            return url
        userInfo, hostInfo = urlParts.netloc.rsplit("@", 1)
        if ":" in userInfo:
            user, ignoredPassword = userInfo.split(":", 1)
            if ignoredPassword:
                safeUserInfo = f"{user}:***"
            else:
                safeUserInfo = userInfo
        else:
            safeUserInfo = userInfo
        safeNetloc = f"{safeUserInfo}@{hostInfo}"
        return urlunsplit(
            (urlParts.scheme, safeNetloc, urlParts.path, urlParts.query, urlParts.fragment)
        )
    except Exception:
        try:
            return re.sub(r"(^[a-zA-Z][a-zA-Z0-9+.-]*://[^:@/]+):[^@/]*@", r"\\1:***@", url)
        except Exception:
            return "<redacted>"


def getSqlCount() -> int:
    """설명: 현재 요청 컨텍스트의 SQL 실행 누계 반환 반환값: 정수 카운트(예외 시 0). 갱신일: 2025-11-12"""
    try:
        counter = sqlCountVar.get()
        if counter is None:
            counter = [0]
            sqlCountVar.set(counter)
        return int(counter[0])
    except Exception:
        return 0


def setPrimaryDbName(name: str) -> None:
    """설명: 기본 DB 이름 설정 부작용: 전역 primaryDbName 값 갱신. 갱신일: 2025-11-12"""
    global primaryDbName
    primaryDbName = (name or "").strip() or None


def getPrimaryDbName() -> str:
    """
 설명: 우선순위(설정→ENV→보유목록)로 기본 DB 이름 반환
    처리 규칙: 설정값이 없으면 ENV/기본 키/main_db 순으로 폴백
    반환값: 현재 프로세스에서 사용할 기본 DB 키 문자열
    갱신일: 2025-11-12
    """

    # 우선순위: 명시적 설정 → 환경변수 → 템플릿 기본값 → 등록된 첫 DB
    if primaryDbName:
        return primaryDbName
    env = os.getenv("DB_PRIMARY")
    if env:
        return env
    if "main_db" in dbManagers:
        return "main_db"
    if dbManagers:

        # 키가 여러 개면 사전순 첫 번째를 사용
        try:
            return sorted(dbManagers.keys())[0]
        except Exception:
            return next(iter(dbManagers.keys()))
    return "main_db"


def getManager(name: str | None = None) -> "DatabaseManager" | None:
    """설명: 이름(없으면 기본 DB)으로 DatabaseManager 조회 반환값: 매니저 인스턴스 또 None. 갱신일: 2025-11-12"""
    key = (name or "").strip() or getPrimaryDbName()
    return dbManagers.get(key)


def incSqlCount(n: int = 1) -> None:
    """설명: 현재 컨텍스트 SQL 카운터 증 부작용: sqlCountVar 값 n만큼 증가. 갱신일: 2025-11-12"""
    try:
        counter = sqlCountVar.get()
        if counter is None:
            counter = [0]
            sqlCountVar.set(counter)
        counter[0] += int(n)
    except Exception:
        pass


def resetSqlCount() -> None:
    """설명: 현재 컨텍스트 SQL 카운터 0 초기화 부작용: sqlCountVar 값 0으로 재설정. 갱신일: 2026-02-22"""
    try:
        # 새 mutable counter를 발급해 이후 컨텍스트를 기존 child task와 분리한다.
        sqlCountVar.set([0])
    except Exception:
        pass


class QueryManager:
    instance: "QueryManager" | None = None

    @staticmethod
    def getInstance():
        """설명: 싱글톤 QueryManager 반환 반환값: 프로세스 내 단일 QueryManager 인스턴스. 갱신일: 2025-11-12"""
        if QueryManager.instance is None:
            QueryManager.instance = QueryManager()
        return QueryManager.instance

    def __init__(self):
        """
 설명: 최초 생성 시 쿼리/파일 매핑 저장소 초기화
        부작용: self.queries/self.nameToFile/self.fileToNames 저장소를 빈 상태로 구성
        갱신일: 2026-02-27
        """
        if QueryManager.instance is None:
            self.queries: dict[str, str] = {}
            self.nameToFile: dict[str, str] = {}
            self.fileToNames: dict[str, set[str]] = {}

    def setAll(self, queries: dict[str, str], nameToFile: dict[str, str], fileToNames: dict[str, set[str]]):
        """설명: 전체 쿼리/파일 매핑 덮어쓰기 부작용: QueryManager 내부 인덱스 3종 전체 교체. 갱신일: 2025-11-12"""
        self.queries = dict(queries or {})
        self.nameToFile = dict(nameToFile or {})
        self.fileToNames = {fp: set(names) for fp, names in (fileToNames or {}).items()}

    def getQuery(self, queryName: str) -> str | None:
        """설명: 이름으로 SQL 텍스트 조회 반환값: 등록된 SQL 문자열 또 None. 갱신일: 2025-11-12"""
        return self.queries.get(queryName)


class DatabaseManager:
    """설명: databases. Database 래퍼로 실행/바인딩 검증 담당 갱신일: 2025-11-12"""

    def __init__(self, databaseUrl: str):
        """설명: DB 연결 URL 기반 클라이언트 준비 부작용: databases.Database 및 QueryManager 참조 초기화. 갱신일: 2025-11-12"""
        self.databaseUrl = databaseUrl
        self.database = Database(databaseUrl)
        self.metadata = MetaData()
        self.queryManager = QueryManager.getInstance()

    def maskParams(self, values: dict[str, Any] | None) -> dict[str, str]:
        """설명: 로그에 사용할 파라미터 키만 노출 반환값: 입력 키 유지하고 값 모두 ***로 치환한 dict. 갱신일: 2025-11-12"""
        if not values:
            return {}
        return {k: "***" for k in values.keys()}

    def scanSqlSegments(self, query: str) -> list[tuple[str, str]]:
        """설명: SQL을 실행 코드/문자열/인용 식별자/주석 구간으로 분리 반환값: (종류, 원문) 튜플 목록. 갱신일: 2026-07-11"""
        sql = str(query or "")
        segments: list[tuple[str, str]] = []
        index = 0
        codeStart = 0
        length = len(sql)

        def appendCode(end: int) -> None:
            if end > codeStart:
                segments.append(("code", sql[codeStart:end]))

        while index < length:
            char = sql[index]
            nextChar = sql[index + 1] if index + 1 < length else ""
            isEscapeString = (
                char in {"e", "E"}
                and nextChar == "'"
                and (index == 0 or not (sql[index - 1].isalnum() or sql[index - 1] in {"_", "$"}))
            )
            if char == "'" or isEscapeString:
                appendCode(index)
                start = index
                escapeBackslash = isEscapeString
                index += 2 if isEscapeString else 1
                while index < length:
                    current = sql[index]
                    if escapeBackslash and current == "\\" and index + 1 < length:
                        index += 2
                        continue
                    if current == "'":
                        if index + 1 < length and sql[index + 1] == "'":
                            index += 2
                            continue
                        index += 1
                        break
                    index += 1
                segments.append(("string", sql[start:index]))
                codeStart = index
                continue
            if char == "$":
                delimiterMatch = re.match(r"\$(?:[a-zA-Z_][a-zA-Z0-9_]*)?\$", sql[index:])
                if delimiterMatch is not None:
                    delimiter = delimiterMatch.group(0)
                    contentStart = index + len(delimiter)
                    closeIndex = sql.find(delimiter, contentStart)
                    if closeIndex >= 0:
                        appendCode(index)
                        end = closeIndex + len(delimiter)
                        segments.append(("string", sql[index:end]))
                        index = end
                        codeStart = index
                        continue
            if char == '"':
                appendCode(index)
                start = index
                index += 1
                while index < length:
                    if sql[index] == '"':
                        if index + 1 < length and sql[index + 1] == '"':
                            index += 2
                            continue
                        index += 1
                        break
                    index += 1
                segments.append(("quoted", sql[start:index]))
                codeStart = index
                continue
            if char == "-" and nextChar == "-":
                appendCode(index)
                start = index
                index += 2
                while index < length and sql[index] != "\n":
                    index += 1
                segments.append(("comment", sql[start:index]))
                codeStart = index
                continue
            if char == "/" and nextChar == "*":
                appendCode(index)
                start = index
                index += 2
                commentDepth = 1
                while index < length and commentDepth > 0:
                    current = sql[index]
                    following = sql[index + 1] if index + 1 < length else ""
                    if current == "/" and following == "*":
                        commentDepth += 1
                        index += 2
                        continue
                    if current == "*" and following == "/":
                        commentDepth -= 1
                        index += 2
                        continue
                    index += 1
                segments.append(("comment", sql[start:index]))
                codeStart = index
                continue
            index += 1

        appendCode(length)
        return segments

    def decodeSqlStringSegment(self, rawLiteral: str) -> str:
        """설명: 민감도 판정을 위해 단일/escape/dollar SQL 문자열의 내용만 복원 반환값: 문자열 내부 값. 갱신일: 2026-07-11"""
        raw = str(rawLiteral or "")
        delimiterMatch = re.match(r"\$(?:[a-zA-Z_][a-zA-Z0-9_]*)?\$", raw)
        if delimiterMatch is not None:
            delimiter = delimiterMatch.group(0)
            if raw.endswith(delimiter) and len(raw) >= len(delimiter) * 2:
                return raw[len(delimiter) : -len(delimiter)]
            return raw[len(delimiter) :]

        isEscapeString = len(raw) >= 2 and raw[0] in {"e", "E"} and raw[1] == "'"
        start = 2 if isEscapeString else 1
        end = len(raw) - 1 if raw.endswith("'") else len(raw)
        content = raw[start:end]
        decoded: list[str] = []
        index = 0
        while index < len(content):
            if isEscapeString and content[index] == "\\" and index + 1 < len(content):
                decoded.append(content[index + 1])
                index += 2
                continue
            if content[index] == "'" and index + 1 < len(content) and content[index + 1] == "'":
                decoded.append("'")
                index += 2
                continue
            decoded.append(content[index])
            index += 1
        return "".join(decoded)

    def extractPlaceholders(self, query: str) -> set[str]:
        """설명: 쿼리에서 :name 형 플레이스홀더 목록 추출 반환값: 바인딩 이름 집합(set). 갱신일: 2025-11-12"""
        # PostgreSQL 캐스트(::jsonb)와 구분하기 위해 단일 ':'만 파라미터로 본다.
        placeholders: set[str] = set()
        for kind, raw in self.scanSqlSegments(query):
            if kind == "code":
                placeholders.update(re.findall(r"(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)", raw))
        return placeholders

    def normalizeQueryForLog(self, query: str) -> str:
        """설명: SQL 원문의 빈 줄/불필요 공백 정리해 사람 읽기 좋게 반환값: 로그 출력용 정규화 SQL 문자열. 갱신일: 2026-02-22"""
        rawLines = str(query or "").splitlines()
        lines: list[str] = []
        for rawLine in rawLines:
            line = re.sub(r"\s+", " ", rawLine).strip()
            if not line:
                continue
            lines.append(line)
        return "\n".join(lines).rstrip(";")

    def truncateLogText(self, text: str, maxLength: int = 1200) -> str:
        """설명: 과도하게 긴 SQL 로그 잘라 단일 라인 로그 폭주 방지 반환값: 길 제한이 적용된 문자열. 갱신일: 2026-02-22"""
        if len(text) <= maxLength:
            return text
        return f"{text[:maxLength]} …(truncated)"

    def mapDatabaseBackendRuntimeError(self, error: Exception) -> Exception:
        """
        설명: 런타임 DB backend 중단 예외를 서비스 계층 공통 코드로 정규화
        처리 규칙: query not found(ValueError)는 그대로 유지하고, known backend-not-running만 DB_NOT_READY로 승격
        반환값: 재전파할 원본 예외 또는 ServiceError("DB_NOT_READY")
        갱신일: 2026-06-24
        """
        if isinstance(error, ValueError):
            return error
        message = str(error or "").strip().lower()
        if isinstance(error, AssertionError) and "databasebackend is not running" in message:
            return ServiceError("DB_NOT_READY")
        return error

    def shouldRevealSqlLiteralValues(self) -> bool:
        """
 설명: SQL 로그에 실제 리터럴 값 노출할지 여부 판단
        환경변수 SQL_LOG_LITERAL_VALUES=true|1|yes|on 일 때만 노출
        갱신일: 2026-02-22
        """
        raw = str(os.getenv("SQL_LOG_LITERAL_VALUES", "")).strip().lower()
        return raw in {"1", "true", "yes", "on"}

    def isSensitiveSqlParamName(self, paramName: str | None) -> bool:
        """
 설명: 파라미터 키 이름으로 민감정보 가능성 판별
        반환값: 민감 키 패턴이 감지되면 True, 아니면 False
        갱신일: 2026-02-27
        """
        name = str(paramName or "").strip()
        if not name:
            return False
        return SENSITIVE_SQL_PARAM_NAME_PATTERN.search(name) is not None

    def isSensitiveSqlStringValue(self, rawValue: str) -> bool:
        """
 설명: 문자열 값 자체 토큰/이메일 같 민감값인지 판별
        반환값: 민감값으로 판단되면 True, 일반 문자열이면 False
        갱신일: 2026-02-27
        """
        value = str(rawValue or "").strip()
        if not value:
            return False
        lowered = value.lower()
        if lowered.startswith("bearer "):
            return True
        if JWT_LITERAL_PATTERN.fullmatch(value) and len(value) >= 24:
            return True
        if EMAIL_LITERAL_PATTERN.fullmatch(value):
            return True
        return False

    def shouldMaskSqlParamForLog(self, paramName: str | None, value: Any) -> bool:
        """
 설명: SQL 로그 출력 시 마스킹 필요한 파라미터인지 판정
        반환값: 키/값 중 하나라도 민감 기준을 만족하면 True
        갱신일: 2026-02-27
        """
        if self.isSensitiveSqlParamName(paramName):
            return True
        if isinstance(value, str) and self.isSensitiveSqlStringValue(value):
            return True
        return False

    def sanitizeSqlLogValue(self, value: Any) -> Any:
        """
 설명: dict/list 같 복합 파라미터에서 민감 키 재귀적으로 마스킹
        처리 규칙: dict/list/tuple을 재귀 순회하고 민감 키·민감 문자열 값은 "***"로 치환
        갱신일: 2026-02-27
        """
        if isinstance(value, str):
            return "***" if self.isSensitiveSqlStringValue(value) else value
        if isinstance(value, dict):
            sanitized: dict[str, Any] = {}
            for key, nested in value.items():
                keyText = str(key)
                if self.shouldMaskSqlParamForLog(keyText, nested):
                    sanitized[keyText] = "***"
                else:
                    sanitized[keyText] = self.sanitizeSqlLogValue(nested)
            return sanitized
        if isinstance(value, list):
            return [self.sanitizeSqlLogValue(item) for item in value]
        if isinstance(value, tuple):
            return tuple(self.sanitizeSqlLogValue(item) for item in value)
        return value

    def toSqlLiteralForLog(self, value: Any, revealLiteral: bool, paramName: str | None = None) -> str:
        """설명: 로그 출력용 SQL 리터럴 문자열로 변환 반환값: 마스킹/리터럴 정책 반영된 SQL 조각 문자열. 갱신일: 2026-02-27"""
        if value is None:
            return "NULL"
        if self.shouldMaskSqlParamForLog(paramName, value):
            return "'***'"
        safeValue = self.sanitizeSqlLogValue(value)
        if not revealLiteral:
            if isinstance(safeValue, (int, float)) and not isinstance(safeValue, bool):
                return "?"
            if isinstance(safeValue, bool):
                return "?"
            return "'***'"
        if isinstance(safeValue, bool):
            return "TRUE" if safeValue else "FALSE"
        if isinstance(safeValue, (int, float)) and not isinstance(safeValue, bool):
            return str(safeValue)
        if isinstance(safeValue, (dict, list)):
            text = json.dumps(safeValue, ensure_ascii=False).replace("'", "''")
            return f"'{text}'"
        if isinstance(safeValue, (bytes, bytearray, memoryview)):
            return "'<binary>'"
        text = str(safeValue).replace("'", "''")
        return f"'{text}'"

    def renderQueryForLog(self, normalizedQuery: str, values: dict[str, Any] | None, revealLiteral: bool) -> str:
        """설명: :name 플레이스홀더 로그용 리터럴로 치환한 SQL 생성 반환값: 바인딩 치환된 SQL 문자열. 갱신일: 2026-02-22"""
        params = values or {}
        rendered: list[str] = []
        codeTokenPattern = re.compile(
            rf"(?<!:):(?P<param>[a-zA-Z_][a-zA-Z0-9_]*)|(?P<number>{SQL_NUMERIC_LITERAL_PATTERN.pattern})",
            re.VERBOSE,
        )
        for kind, raw in self.scanSqlSegments(normalizedQuery):
            if kind == "string":
                literalValue = self.decodeSqlStringSegment(raw)
                if revealLiteral and not self.isSensitiveSqlStringValue(literalValue):
                    rendered.append(raw)
                else:
                    rendered.append("'***'")
                continue
            if kind != "code":
                rendered.append(raw)
                continue

            lastEnd = 0
            for match in codeTokenPattern.finditer(raw):
                rendered.append(raw[lastEnd : match.start()])
                key = match.group("param")
                if key is not None:
                    token = match.group(0)
                    if key in params:
                        rendered.append(self.toSqlLiteralForLog(params.get(key), revealLiteral, paramName=key))
                    else:
                        rendered.append(token)
                else:
                    rendered.append(match.group(0) if revealLiteral else "?")
                lastEnd = match.end()
            rendered.append(raw[lastEnd:])
        return "".join(rendered)

    def hasUnsafeInlineLiteralPredicate(self, query: str) -> bool:
        """설명: raw SQL의 WHERE/HAVING 절에 직접 박힌 문자열/숫자 리터럴 조건이 있는지 판별 반환값: 위험 패턴이면 True. 갱신일: 2026-06-04"""
        analysisParts: list[str] = []
        for kind, raw in self.scanSqlSegments(query):
            if kind == "string":
                analysisParts.append(SQL_STRING_LITERAL_MARKER)
            elif kind == "code":
                analysisParts.append(SQL_NUMERIC_LITERAL_PATTERN.sub(SQL_NUMERIC_LITERAL_MARKER, raw))
            else:
                analysisParts.append("".join("\n" if char == "\n" else " " for char in raw))
        analysisSql = "".join(analysisParts)
        if not analysisSql.strip():
            return False
        clauseMatches = list(SQL_PREDICATE_CLAUSE_PATTERN.finditer(analysisSql))
        matchDepths: list[int] = []
        matchIndexByStart = {match.start(): index for index, match in enumerate(clauseMatches)}
        parenthesisDepth = 0
        for charIndex, char in enumerate(analysisSql):
            clauseIndex = matchIndexByStart.get(charIndex)
            if clauseIndex is not None:
                while len(matchDepths) <= clauseIndex:
                    matchDepths.append(parenthesisDepth)
            if char == "(":
                parenthesisDepth += 1
            elif char == ")":
                parenthesisDepth = max(0, parenthesisDepth - 1)

        pendingJoinDepths: set[int] = set()
        predicateStarts: list[tuple[int, re.Match[str], int]] = []
        for matchIndex, clauseMatch in enumerate(clauseMatches):
            clauseName = re.sub(r"\s+", " ", clauseMatch.group(0).strip().lower())
            clauseDepth = matchDepths[matchIndex]
            if clauseName == "join":
                pendingJoinDepths.add(clauseDepth)
                continue
            if clauseName == "on":
                if clauseDepth in pendingJoinDepths:
                    predicateStarts.append((matchIndex, clauseMatch, clauseDepth))
                    pendingJoinDepths.discard(clauseDepth)
                continue
            if clauseName in {"where", "having"}:
                predicateStarts.append((matchIndex, clauseMatch, clauseDepth))
            pendingJoinDepths.discard(clauseDepth)

        for matchIndex, clauseMatch, clauseDepth in predicateStarts:
            regionEnd = len(analysisSql)
            for nextIndex in range(matchIndex + 1, len(clauseMatches)):
                if matchDepths[nextIndex] <= clauseDepth:
                    regionEnd = clauseMatches[nextIndex].start()
                    break
            predicateRegion = analysisSql[clauseMatch.end() : regionEnd]
            if (
                SQL_ANALYSIS_CAST_LITERAL_PREFIX_PATTERN.search(predicateRegion) is not None
                or UNSAFE_INLINE_LITERAL_PREDICATE_PATTERN.search(predicateRegion) is not None
            ):
                return True
        return False

    def logQuery(self, op: str, query: str, values: dict[str, Any] | None = None, queryName: str | None = None) -> None:
        """설명: SQL 로그 읽기 쉬운 최소 필드(queryName/sqlRendered)로 구성 부작용: logger.info로 단일 JSON 로그 기록. 갱신일: 2026-02-22"""
        normalized = self.normalizeQueryForLog(query)
        revealLiteral = self.shouldRevealSqlLiteralValues()
        rendered = self.renderQueryForLog(normalized, values, revealLiteral)
        payload: dict[str, Any] = {
            "event": "db.query",
            "sqlRendered": self.truncateLogText(rendered),
        }
        payload["queryName"] = queryName or op
        logger.info(json.dumps(payload, ensure_ascii=False))

    def validateBindParameters(
        self,
        query: str,
        values: dict[str, Any] | None,
        queryName: str | None = None,
    ):
        """설명: 제공된 파라미터와 플레이스홀더 일치 여부 검사 실패 동작: 누락/미사용/치환오용이면 ValueError 발생. 갱신일: 2025-11-12"""
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=False)

    def _validateBindParameters(
        self,
        query: str,
        values: dict[str, Any] | None,
        queryName: str | None = None,
        allowStaticSqlLiteralPredicate: bool = False,
    ):
        """설명: 내부 SQL 실행 경로용 바인드/리터럴 검증 헬퍼 실패 동작: 누락/미사용/치환오용이면 ValueError 발생. 갱신일: 2026-06-04"""
        values = values or {}
        placeholders = self.extractPlaceholders(query)
        provided = set(values.keys())

        if not allowStaticSqlLiteralPredicate and self.hasUnsafeInlineLiteralPredicate(query):
            logger.warning(
                json.dumps(
                    {
                        "event": "db.bind.warn",
                        "msg": "unsafe inline literal predicate without bind params",
                    },
                    ensure_ascii=False,
                )
            )
            raise ValueError("DB_400_INLINE_LITERAL_UNSAFE")

        if provided and not placeholders:

            # 값만 있고 바인딩이 없으면 문자열 치환 오용 가능성
            logger.warning(
                json.dumps(
                    {
                        "event": "db.bind.warn",
                        "msg": "values provided but no bind placeholders",
                    },
                    ensure_ascii=False,
                )
            )
            raise ValueError("DB_400_BIND_REQUIRED")

        missing = placeholders - provided
        if missing:
            logger.warning(
                json.dumps(
                    {
                        "event": "db.bind.warn",
                        "msg": "missing bind params",
                        "missing": sorted(list(missing)),
                    },
                    ensure_ascii=False,
                )
            )
            raise ValueError("DB_400_PARAM_MISSING")

        extra = provided - placeholders
        if extra:
            logger.warning(
                json.dumps(
                    {
                        "event": "db.bind.warn",
                        "msg": "unused bind params",
                        "unused": sorted(list(extra)),
                    },
                    ensure_ascii=False,
                )
            )
            raise ValueError("DB_400_PARAM_UNUSED")

    async def connect(self):
        """설명: DB 연결 시작 및 SQLite 튜닝 적용 부작용: 연결 성립 후 WAL/timeout/synchronous pragma 시도. 갱신일: 2025-11-12"""
        await self.database.connect()
        logger.info(f"Connected to database {maskDatabaseUrl(self.databaseUrl)}")

        # SQLite 잠금 오류를 줄이기 위한 pragma 적용
        try:
            if (self.databaseUrl or "").startswith("sqlite"):
                await self.database.execute("PRAGMA journal_mode=WAL;")
                await self.database.execute("PRAGMA busy_timeout=3000;")
                await self.database.execute("PRAGMA synchronous=NORMAL;")
        except Exception:
            pass

    async def disconnect(self):
        """설명: 데이터베이스 연결 종료 부작용: pool/session 리소스 해제. 갱신일: 2025-11-12"""
        await self.database.disconnect()

    async def execute(self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None) -> Any:
        """
 설명: INSERT/UPDATE/DELETE 결과(영향 행) 전달하는 쓰기 전용 실행 진입점
        처리 규칙: 바인드 파라미터를 검증한 뒤 query 로깅과 SQL 카운터 증가를 함께 수행
        반환값: DB 드라이버가 반환한 영향 행 수 또는 실행 결과 값
        갱신일: 2025-11-12
        """
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=False)
        self.logQuery("execute", query, values, queryName)
        incSqlCount()
        try:
            result = await self.database.execute(query=query, values=values or {})
        except Exception as error:
            raise self.mapDatabaseBackendRuntimeError(error) from error
        logger.info(f"rows_affected={result}")
        return result

    async def fetchOne(
        self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None
    ) -> dict[str, Any] | None:
        """
 설명: 조회 결과 단일 dict 형태로 정규화해 전달하 단건 조회 헬퍼
        처리 규칙: 결과가 없으면 None을 반환하고, 조회 성공/실패와 관계없이 SQL 카운터를 증가시킨
        반환값: 조회된 단일 행(dict) 또는 None
        갱신일: 2025-11-12
        """
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=False)
        self.logQuery("fetchOne", query, values, queryName)
        incSqlCount()
        try:
            result = await self.database.fetch_one(query=query, values=values or {})
        except Exception as error:
            raise self.mapDatabaseBackendRuntimeError(error) from error
        if result is not None:
            data: dict[str, Any] = dict(result)
            logger.info("rows_returned=1")
            return data
        else:
            logger.info("rows_returned=0")
            return None

    async def fetchAll(
        self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None
    ) -> list[dict[str, Any]] | None:
        """
 설명: 조회 결과 dict 리스트 형태로 정규화해 전달하 다건 조회 헬퍼
        처리 규칙: 결과가 없으면 None을 반환하고, 조회 성공/실패와 관계없이 SQL 카운터를 증가시킨
        반환값: dict 리스트 또는 None
        갱신일: 2025-11-12
        """
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=False)
        self.logQuery("fetchAll", query, values, queryName)
        incSqlCount()
        try:
            result = await self.database.fetch_all(query=query, values=values or {})
        except Exception as error:
            raise self.mapDatabaseBackendRuntimeError(error) from error
        if result is not None:
            data: list[dict[str, Any]] = [{column: row[column] for column in row.keys()} for row in result]  # type: ignore[index]
            logger.info(f"rows_returned={len(data)}")
            return data
        else:
            logger.info("rows_returned=0")
            return None

    async def executeQuery(self, queryName: str, values: dict[str, Any] | None = None) -> Any:
        """설명: 등록된 이름 기반 쿼리 실행 실패 동작: queryName 미등록이면 ValueError 발생. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError(f"Query not found: {queryName}")
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=True)
        self.logQuery("execute", query, values, queryName)
        incSqlCount()
        try:
            result = await self.database.execute(query=query, values=values or {})
        except Exception as error:
            raise self.mapDatabaseBackendRuntimeError(error) from error
        logger.info(f"rows_affected={result}")
        return result

    async def fetchOneQuery(self, queryName: str, values: dict[str, Any] | None = None) -> dict[str, Any] | None:
        """설명: 등록 쿼리 중 단일 행 조회 실패 동작: queryName 미등록이면 ValueError 발생. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError(f"Query not found: {queryName}")
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=True)
        self.logQuery("fetchOne", query, values, queryName)
        incSqlCount()
        try:
            result = await self.database.fetch_one(query=query, values=values or {})
        except Exception as error:
            raise self.mapDatabaseBackendRuntimeError(error) from error
        if result is not None:
            data: dict[str, Any] = dict(result)
            logger.info("rows_returned=1")
            return data
        else:
            logger.info("rows_returned=0")
            return None

    async def fetchAllQuery(
        self, queryName: str, values: dict[str, Any] | None = None
    ) -> list[dict[str, Any]] | None:
        """설명: 등록 쿼리 중 여러 행 조회 실패 동작: queryName 미등록이면 ValueError 발생. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError(f"Query not found: {queryName}")
        self._validateBindParameters(query, values, queryName=queryName, allowStaticSqlLiteralPredicate=True)
        self.logQuery("fetchAll", query, values, queryName)
        incSqlCount()
        try:
            result = await self.database.fetch_all(query=query, values=values or {})
        except Exception as error:
            raise self.mapDatabaseBackendRuntimeError(error) from error
        if result is not None:
            data: list[dict[str, Any]] = [{column: row[column] for column in row.keys()} for row in result]  # type: ignore[index]
            logger.info(f"rows_returned={len(data)}")
            return data
        else:
            logger.info("rows_returned=0")
            return None

# =========================
# 쿼리 로더 설정 및 동작
# =========================


def setQueryConfig(queryDirParam: str, watch: bool, debounceMsParam: int):
    """설명: 쿼리 디렉터리/워치 설정 업데이트 처리 부작용: queryDir/queryWatch/debounceMs 전역 설정값 갱신. 갱신일: 2025-11-12"""
    global queryDir, queryWatch, debounceMs
    if not os.path.isabs(queryDirParam):
        queryDirParam = os.path.join(baseDir, queryDirParam)
    queryDir = queryDirParam
    queryWatch = bool(watch)
    debounceMs = int(debounceMsParam)


def loadQueries() -> int:
    """설명: SQL 폴더 파싱해 QueryManager에 로드 반환값: 로드된 SQL 키 개수. 갱신일: 2025-11-12"""
    started = time.perf_counter()
    queries, nameToFile, fileToNames = scanSqlQueries(queryDir)
    QueryManager.getInstance().setAll(queries, nameToFile, fileToNames)
    durationMs = int((time.perf_counter() - started) * 1000)
    try:
        msg = json.dumps(
            {
                "event": "query.load",
                "file": queryDir,
                "keys": sorted(list(queries.keys()))[:20],
                "count": len(queries),
                "duration_ms": durationMs,
            },
            ensure_ascii=False,
        )
        logger.info(msg)
    except Exception:
        logger.info(f"queries_loaded dir={queryDir} count={len(queries)} duration_ms={durationMs}")
    return len(queries)


def scheduleReload(changedPath: str | None):
    """설명: 변경된 파일 기록 및 디바운스 타이머 기동 부작용: 기존 타이머 취소 후 새 타이머 등록. 갱신일: 2025-11-12"""
    global debounceTimer, lastChangedFile
    with debounceStateLock:
        lastChangedFile = changedPath
        pendingChangedFiles.add(os.path.normpath(changedPath or queryDir))
        if debounceTimer and debounceTimer.is_alive():
            debounceTimer.cancel()
        debounceTimer = threading.Timer(debounceMs / 1000.0, doReload)
        debounceTimer.daemon = True
        debounceTimer.start()


def doReload() -> bool:
    """설명: 디바운스 이후 실제로 쿼리 파일 다시 반환값: 재로딩 성공 여부(True/False). 갱신일: 2025-11-12"""
    started = time.perf_counter()
    changedFile = queryDir
    keysFromFile: list[str] | None = None
    try:
        with reloadPublicationLock:
            with debounceStateLock:
                changedFiles = set(pendingChangedFiles)
                pendingChangedFiles.clear()

            try:
                qm = QueryManager.getInstance()
                partialFile = next(iter(changedFiles)) if len(changedFiles) == 1 else None
                if (
                    partialFile is not None
                    and partialFile.lower().endswith(".sql")
                    and os.path.isfile(partialFile)
                ):
                    changedFile = partialFile
                    pairs = parseSqlFile(partialFile)

                    # 게시 중인 최신 상태를 기준으로 특정 파일만 안전하게 교체한다.
                    newQueries = dict(qm.queries)
                    newNameToFile = dict(qm.nameToFile)
                    newFileToNames = {fp: set(names) for fp, names in qm.fileToNames.items()}
                    oldNames = newFileToNames.get(partialFile, set())
                    for name in oldNames:
                        newQueries.pop(name, None)
                        newNameToFile.pop(name, None)
                    for name, sql in pairs:
                        owner = newNameToFile.get(name)
                        if owner is not None and owner != partialFile:
                            raise ValueError(f"duplicate query key across files: {name}")
                        newQueries[name] = sql
                        newNameToFile[name] = partialFile
                    newFileToNames[partialFile] = {name for name, _ in pairs}
                    keysFromFile = [name for name, _ in pairs]
                else:
                    # 복수 변경, 삭제, 경로 누락/모호성은 전체 스캔으로 수렴한다.
                    newQueries, newNameToFile, newFileToNames = scanSqlQueries(queryDir)

                # 스캔/복사와 같은 임계 구역에서 게시해 stale snapshot 덮어쓰기를 막는다.
                qm.setAll(newQueries, newNameToFile, newFileToNames)
            except Exception:
                # 실패한 배치와 그 사이 새로 들어온 변경을 합쳐 다음 재시도에 보존한다.
                with debounceStateLock:
                    pendingChangedFiles.update(changedFiles)
                raise
    except Exception as e:
        durationMs = int((time.perf_counter() - started) * 1000)
        errPayload = {
            "event": "query.reload.error",
            "file": changedFile,
            "error": str(e),
            "duration_ms": durationMs,
        }
        logger.error(json.dumps(errPayload, ensure_ascii=False))

        # 실패 시 기존 상태 유지
        return False

    durationMs = int((time.perf_counter() - started) * 1000)
    payload = {
        "event": "query.reload",
        "file": changedFile,
        "keys": keysFromFile if keysFromFile is not None else sorted(list(newQueries.keys()))[:20],
        "count": len(newQueries),
        "duration_ms": durationMs,
    }
    logger.info(json.dumps(payload, ensure_ascii=False))
    return True


def startWatchingQueryFolder() -> Any | None:
    """설명: watchdog으로 쿼리 폴더 변화 감시 반환값: 감시 Observer 또 비활성화 시 None. 갱신일: 2025-11-12"""
    if not queryWatch:
        return None
    if not watchdogAvailable:
        logger.info("watchdog 미설치: 쿼리 폴더 감시 비활성화")
        return None
    observer = Observer()
    handler = QueryFolderEventHandler(scheduleReload)
    observer.schedule(handler, queryDir, recursive=True)
    observer.start()
    return observer


class QueryFolderEventHandler(FileSystemEventHandler):
    """설명: SQL 파일 변경 감지해 재로딩 예약 갱신일: 2025-11-12"""

    def __init__(self, onChange):
        """
 설명: SQL 파일 변경 알림 콜백 저장해 각 파일 이벤트에서 재사용
        부작용: self.onChange에 외부 콜백 참조를 보관
        갱신일: 2026-02-27
        """
        super().__init__()
        self.onChange = onChange

    def maybe(self, event: FileSystemEvent):
        """
 설명: SQL 파일 이벤트만 재로딩 후보로 분류
        부작용: 조건을 만족하면 onChange(path)를 호출
        갱신일: 2025-11-12
        """
        paths = (getattr(event, "src_path", None), getattr(event, "dest_path", None))
        notifiedPaths: set[str] = set()
        for path in paths:
            if not path or path in notifiedPaths:
                continue
            notifiedPaths.add(path)
            if path.lower().endswith(".sql"):
                self.onChange(path)

    def on_modified(self, event: FileSystemEvent):
        """설명: 수정 이벤트 수신해 SQL 파일 필터링 로직으로 전달 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_created(self, event: FileSystemEvent):
        """설명: 생성 이벤트 수신해 SQL 파일 필터링 로직으로 전달 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_moved(self, event: FileSystemEvent):
        """설명: 이동 이벤트 수신해 SQL 파일 필터링 로직으로 전달 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_deleted(self, event: FileSystemEvent):
        """설명: 삭제 이벤트 수신해 SQL 파일 필터링 로직으로 전달 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)
