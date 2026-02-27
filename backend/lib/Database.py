"""
파일명: backend/lib/Database.py
작성자: LSH
갱신일: 2026-01-18
설명: DB 매니저/쿼리 로더/디렉터리 감시. 파라미터 바인딩 강제·PII 마스킹 로깅.
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

# 요청 단위 SQL 카운터(ContextVar)
sqlCountVar: contextvars.ContextVar[int] = contextvars.ContextVar("sql_count", default=0)

SENSITIVE_SQL_PARAM_NAME_PATTERN = re.compile(
    r"(pass(word)?|pwd|secret|token|refresh|access|auth|cookie|session|csrf|email|eml|phone|mobile|tel|ssn|rrn|card|account|acct|bank)",
    re.IGNORECASE,
)
EMAIL_LITERAL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
JWT_LITERAL_PATTERN = re.compile(r"^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$")


def maskDatabaseUrl(url: str) -> str:
    """
    설명: DB 접속 URL에서 자격증명(password)을 마스킹해 로그에 노출되지 않게
    처리 규칙: URL 파싱이 실패하면 정규식 대체 마스킹을 시도하고, 최종 실패 시 <redacted>를 반환한다.
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
    """설명: 현재 요청 컨텍스트의 SQL 실행 누계를 반환. 반환값: 정수 카운트(예외 시 0). 갱신일: 2025-11-12"""
    try:
        return int(sqlCountVar.get())
    except Exception:
        return 0


def setPrimaryDbName(name: str) -> None:
    """설명: 기본 DB 이름을 설정한다. 부작용: 전역 primaryDbName 값을 갱신한다. 갱신일: 2025-11-12"""
    global primaryDbName
    primaryDbName = (name or "").strip() or None


def getPrimaryDbName() -> str:
    """
    설명: 우선순위(설정→ENV→보유목록)로 기본 DB 이름을 반환.
    처리 규칙: 설정값이 없으면 ENV/기본 키/main_db 순으로 폴백한다.
    반환값: 현재 프로세스에서 사용할 기본 DB 키 문자열.
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
    """설명: 이름(없으면 기본 DB)으로 DatabaseManager를 조회. 반환값: 매니저 인스턴스 또는 None. 갱신일: 2025-11-12"""
    key = (name or "").strip() or getPrimaryDbName()
    return dbManagers.get(key)


def incSqlCount(n: int = 1) -> None:
    """설명: 현재 컨텍스트 SQL 카운터를 증가. 부작용: sqlCountVar 값이 n만큼 커진다. 갱신일: 2025-11-12"""
    try:
        cur = int(sqlCountVar.get())
        sqlCountVar.set(cur + int(n))
    except Exception:
        pass


def resetSqlCount() -> None:
    """설명: 현재 컨텍스트 SQL 카운터를 0으로 초기화. 부작용: sqlCountVar 값이 0으로 덮어써진다. 갱신일: 2026-02-22"""
    try:
        sqlCountVar.set(0)
    except Exception:
        pass


class QueryManager:
    instance: "QueryManager" | None = None

    @staticmethod
    def getInstance():
        """설명: 싱글톤 QueryManager를 반환한다. 반환값: 프로세스 내 단일 QueryManager 인스턴스. 갱신일: 2025-11-12"""
        if QueryManager.instance is None:
            QueryManager.instance = QueryManager()
        return QueryManager.instance

    def __init__(self):
        """
        설명: 최초 생성 시 쿼리/파일 매핑 저장소를 초기화
        부작용: self.queries/self.nameToFile/self.fileToNames 저장소를 빈 상태로 구성한다.
        갱신일: 2026-02-27
        """
        if QueryManager.instance is None:
            self.queries: dict[str, str] = {}
            self.nameToFile: dict[str, str] = {}
            self.fileToNames: dict[str, set[str]] = {}

    def setAll(self, queries: dict[str, str], nameToFile: dict[str, str], fileToNames: dict[str, set[str]]):
        """설명: 전체 쿼리/파일 매핑을 덮어쓴다. 부작용: QueryManager 내부 인덱스 3종을 모두 교체한다. 갱신일: 2025-11-12"""
        self.queries = dict(queries or {})
        self.nameToFile = dict(nameToFile or {})
        self.fileToNames = {fp: set(names) for fp, names in (fileToNames or {}).items()}

    def setQueries(self, queries: dict):
        """설명: 쿼리 테이블만 교체(레거시 호환). 부작용: self.queries만 새 dict로 대체한다. 갱신일: 2025-11-12"""
        # 이전 코드 호환을 위해 쿼리 dict만 갱신 허용
        self.queries = dict(queries or {})

    def getQuery(self, queryName: str) -> str | None:
        """설명: 이름으로 SQL 텍스트를 조회한다. 반환값: 등록된 SQL 문자열 또는 None. 갱신일: 2025-11-12"""
        return self.queries.get(queryName)


class DatabaseManager:
    """설명: databases.Database 래퍼로 실행/바인딩 검증 담당. 갱신일: 2025-11-12"""

    def __init__(self, databaseUrl: str):
        """설명: DB 연결 URL을 받아 클라이언트를 준비한다. 부작용: databases.Database 및 QueryManager 참조를 초기화한다. 갱신일: 2025-11-12"""
        self.databaseUrl = databaseUrl
        self.database = Database(databaseUrl)
        self.metadata = MetaData()
        self.queryManager = QueryManager.getInstance()

    def maskParams(self, values: dict[str, Any] | None) -> dict[str, str]:
        """설명: 로그에 사용할 파라미터 키만 노출. 반환값: 입력 키를 유지하고 값은 모두 ***로 치환한 dict. 갱신일: 2025-11-12"""
        if not values:
            return {}
        return {k: "***" for k in values.keys()}

    def extractPlaceholders(self, query: str) -> set[str]:
        """설명: 쿼리에서 :name 형 플레이스홀더 목록을 추출. 반환값: 바인딩 이름 집합(set). 갱신일: 2025-11-12"""
        # 예시: :id, :user_name 등 명명 파라미터
        # PostgreSQL 캐스트(::jsonb)와 구분하기 위해 단일 ':'만 파라미터로 본다.
        return set(re.findall(r"(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)", query or ""))

    def normalizeQueryForLog(self, query: str) -> str:
        """설명: SQL 원문의 빈 줄/불필요 공백을 정리해 사람이 읽기 좋게 만든다. 반환값: 로그 출력용 정규화 SQL 문자열. 갱신일: 2026-02-22"""
        rawLines = str(query or "").splitlines()
        lines: list[str] = []
        for rawLine in rawLines:
            line = re.sub(r"\s+", " ", rawLine).strip()
            if not line:
                continue
            lines.append(line)
        return "\n".join(lines).rstrip(";")

    def truncateLogText(self, text: str, maxLength: int = 1200) -> str:
        """설명: 과도하게 긴 SQL 로그를 잘라 단일 라인 로그 폭주를 방지한다. 반환값: 길이 제한이 적용된 문자열. 갱신일: 2026-02-22"""
        if len(text) <= maxLength:
            return text
        return f"{text[:maxLength]} …(truncated)"

    def shouldRevealSqlLiteralValues(self) -> bool:
        """
        설명: SQL 로그에 실제 리터럴 값을 노출할지 여부를 판단
        환경변수 SQL_LOG_LITERAL_VALUES=true|1|yes|on 일 때만 노출한다.
        갱신일: 2026-02-22
        """
        raw = str(os.getenv("SQL_LOG_LITERAL_VALUES", "")).strip().lower()
        return raw in {"1", "true", "yes", "on"}

    def isSensitiveSqlParamName(self, paramName: str | None) -> bool:
        """
        설명: 파라미터 키 이름으로 민감정보 가능성을 판별
        반환값: 민감 키 패턴이 감지되면 True, 아니면 False.
        갱신일: 2026-02-27
        """
        name = str(paramName or "").strip()
        if not name:
            return False
        return SENSITIVE_SQL_PARAM_NAME_PATTERN.search(name) is not None

    def isSensitiveSqlStringValue(self, rawValue: str) -> bool:
        """
        설명: 문자열 값 자체가 토큰/이메일 같은 민감값인지 판별
        반환값: 민감값으로 판단되면 True, 일반 문자열이면 False.
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
        설명: SQL 로그 출력 시 마스킹이 필요한 파라미터인지 판정
        반환값: 키/값 중 하나라도 민감 기준을 만족하면 True.
        갱신일: 2026-02-27
        """
        if self.isSensitiveSqlParamName(paramName):
            return True
        if isinstance(value, str) and self.isSensitiveSqlStringValue(value):
            return True
        return False

    def sanitizeSqlLogValue(self, value: Any) -> Any:
        """
        설명: dict/list 같은 복합 파라미터에서 민감 키를 재귀적으로 마스킹
        처리 규칙: dict/list/tuple을 재귀 순회하고 민감 키·민감 문자열 값은 "***"로 치환한다.
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
        """설명: 로그 출력용 SQL 리터럴 문자열로 변환한다. 반환값: 마스킹/리터럴 정책이 반영된 SQL 조각 문자열. 갱신일: 2026-02-27"""
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
        """설명: :name 플레이스홀더를 로그용 리터럴로 치환한 SQL을 생성한다. 반환값: 바인딩이 치환된 SQL 문자열. 갱신일: 2026-02-22"""
        params = values or {}
        pattern = re.compile(r"(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)")

        def replace(match: re.Match[str]) -> str:
            """설명: 개별 플레이스홀더를 로그용 리터럴로 치환한다. 반환값: 치환된 리터럴 또는 원본 플레이스홀더. 갱신일: 2026-02-26"""
            key = match.group(1)
            if key not in params:
                return match.group(0)
            return self.toSqlLiteralForLog(params.get(key), revealLiteral, paramName=key)

        return pattern.sub(replace, normalizedQuery)

    def logQuery(self, op: str, query: str, values: dict[str, Any] | None = None, queryName: str | None = None) -> None:
        """설명: SQL 로그를 읽기 쉬운 최소 필드(queryName/sqlRendered)로 남긴다. 부작용: logger.info로 단일 JSON 로그를 기록한다. 갱신일: 2026-02-22"""
        normalized = self.normalizeQueryForLog(query)
        revealLiteral = self.shouldRevealSqlLiteralValues()
        rendered = self.renderQueryForLog(normalized, values, revealLiteral)
        payload: dict[str, Any] = {
            "event": "db.query",
            "sqlRendered": self.truncateLogText(rendered),
        }
        payload["queryName"] = queryName or op
        logger.info(json.dumps(payload, ensure_ascii=False))

    def validateBindParameters(self, query: str, values: dict[str, Any] | None):
        """설명: 제공된 파라미터와 플레이스홀더 일치 여부를 검사. 실패 동작: 누락/미사용/치환오용이면 ValueError를 발생시킨다. 갱신일: 2025-11-12"""
        values = values or {}
        placeholders = self.extractPlaceholders(query)
        provided = set(values.keys())

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
        """설명: DB 연결을 시작하고 SQLite 튜닝을 적용. 부작용: 연결 성립 후 WAL/timeout/synchronous pragma를 시도한다. 갱신일: 2025-11-12"""
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
        """설명: 데이터베이스 연결을 종료한다. 부작용: pool/session 리소스를 해제한다. 갱신일: 2025-11-12"""
        await self.database.disconnect()

    async def execute(self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None) -> Any:
        """
        설명: INSERT/UPDATE/DELETE 결과(영향 행)를 전달하는 쓰기 전용 실행 진입점.
        처리 규칙: 바인드 파라미터를 검증한 뒤 query 로깅과 SQL 카운터 증가를 함께 수행한다.
        반환값: DB 드라이버가 반환한 영향 행 수 또는 실행 결과 값.
        갱신일: 2025-11-12
        """
        self.validateBindParameters(query, values)
        self.logQuery("execute", query, values, queryName)
        result = await self.database.execute(query=query, values=values or {})
        logger.info(f"rows_affected={result}")
        incSqlCount()
        return result

    async def fetchOne(
        self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None
    ) -> dict[str, Any] | None:
        """
        설명: 조회 결과를 단일 dict 형태로 정규화해 전달하는 단건 조회 헬퍼.
        처리 규칙: 결과가 없으면 None을 반환하고, 조회 성공/실패와 관계없이 SQL 카운터를 증가시킨다.
        반환값: 조회된 단일 행(dict) 또는 None.
        갱신일: 2025-11-12
        """
        self.validateBindParameters(query, values)
        self.logQuery("fetchOne", query, values, queryName)
        result = await self.database.fetch_one(query=query, values=values or {})
        if result is not None:
            data: dict[str, Any] = dict(result)
            logger.info("rows_returned=1")
            incSqlCount()
            return data
        else:
            logger.info("rows_returned=0")
            incSqlCount()
            return None

    async def fetchAll(
        self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None
    ) -> list[dict[str, Any]] | None:
        """
        설명: 조회 결과를 dict 리스트 형태로 정규화해 전달하는 다건 조회 헬퍼.
        처리 규칙: 결과가 없으면 None을 반환하고, 조회 성공/실패와 관계없이 SQL 카운터를 증가시킨다.
        반환값: dict 리스트 또는 None.
        갱신일: 2025-11-12
        """
        self.validateBindParameters(query, values)
        self.logQuery("fetchAll", query, values, queryName)
        result = await self.database.fetch_all(query=query, values=values or {})
        if result is not None:
            data: list[dict[str, Any]] = [{column: row[column] for column in row.keys()} for row in result]  # type: ignore[index]
            logger.info(f"rows_returned={len(data)}")
            incSqlCount()
            return data
        else:
            logger.info("rows_returned=0")
            incSqlCount()
            return None

    async def executeQuery(self, queryName: str, values: dict[str, Any] | None = None) -> Any:
        """설명: 등록된 이름 기반 쿼리를 실행. 실패 동작: queryName 미등록이면 ValueError를 발생시킨다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError(f"Query not found: {queryName}")
        return await self.execute(query, values, queryName=queryName)

    async def fetchOneQuery(self, queryName: str, values: dict[str, Any] | None = None) -> dict[str, Any] | None:
        """설명: 등록 쿼리 중 단일 행을 가져온다. 실패 동작: queryName 미등록이면 ValueError를 발생시킨다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError(f"Query not found: {queryName}")
        return await self.fetchOne(query, values, queryName=queryName)

    async def fetchAllQuery(
        self, queryName: str, values: dict[str, Any] | None = None
    ) -> list[dict[str, Any]] | None:
        """설명: 등록 쿼리 중 여러 행을 가져온다. 실패 동작: queryName 미등록이면 ValueError를 발생시킨다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError(f"Query not found: {queryName}")
        return await self.fetchAll(query, values, queryName=queryName)


# =========================
# 쿼리 로더 설정 및 동작
# =========================


def setQueryConfig(queryDirParam: str, watch: bool, debounceMsParam: int):
    """설명: 쿼리 디렉터리/워치 설정을 업데이트. 부작용: queryDir/queryWatch/debounceMs 전역 설정값이 바뀐다. 갱신일: 2025-11-12"""
    global queryDir, queryWatch, debounceMs
    if not os.path.isabs(queryDirParam):
        queryDirParam = os.path.join(baseDir, queryDirParam)
    queryDir = queryDirParam
    queryWatch = bool(watch)
    debounceMs = int(debounceMsParam)


def loadQueries() -> int:
    """설명: SQL 폴더를 파싱해 QueryManager에 로드. 반환값: 로드된 SQL 키 개수. 갱신일: 2025-11-12"""
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
    """설명: 변경된 파일을 기록하고 디바운스 타이머를 기동. 부작용: 기존 타이머를 취소하고 새 타이머를 등록한다. 갱신일: 2025-11-12"""
    global debounceTimer, lastChangedFile
    lastChangedFile = changedPath
    if debounceTimer and debounceTimer.is_alive():
        debounceTimer.cancel()
    debounceTimer = threading.Timer(debounceMs / 1000.0, doReload)
    debounceTimer.daemon = True
    debounceTimer.start()


def doReload() -> bool:
    """설명: 디바운스 이후 실제로 쿼리 파일을 다시 읽는다. 반환값: 재로딩 성공 여부(True/False). 갱신일: 2025-11-12"""
    started = time.perf_counter()
    changedFile = lastChangedFile or queryDir
    try:
        qm = QueryManager.getInstance()
        if changedFile and os.path.isfile(changedFile):
            # 특정 파일만 부분 재로딩
            pairs = parseSqlFile(changedFile)
            # 기존 상태를 복사
            newQueries = dict(qm.queries)
            newNameToFile = dict(qm.nameToFile)
            newFileToNames = {fp: set(names) for fp, names in qm.fileToNames.items()}
            # 해당 파일에서 이전 키 삭제
            oldNames = newFileToNames.get(changedFile, set())
            for n in oldNames:
                newQueries.pop(n, None)
                newNameToFile.pop(n, None)
            # 새 항목 추가 + 파일 간 중복 검사
            for name, sql in pairs:
                owner = newNameToFile.get(name)
                if owner is not None and owner != changedFile:
                    raise ValueError(f"duplicate query key across files: {name}")
                newQueries[name] = sql
                newNameToFile[name] = changedFile
            newFileToNames[changedFile] = set(n for n, _ in pairs)
        else:
            newQueries, newNameToFile, newFileToNames = scanSqlQueries(queryDir)
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

    # 성공하면 새로운 쿼리 매핑으로 교체
    qm.setAll(newQueries, newNameToFile, newFileToNames)
    durationMs = int((time.perf_counter() - started) * 1000)
    keysFromFile: list[str] | None = None
    try:
        if changedFile and os.path.isfile(changedFile):
            pairs2 = parseSqlFile(changedFile)
            keysFromFile = [name for name, _ in pairs2]
    except Exception:
        keysFromFile = None
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
    """설명: watchdog으로 쿼리 폴더 변화를 감시. 반환값: 감시 Observer 또는 비활성화 시 None. 갱신일: 2025-11-12"""
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
    """설명: SQL 파일 변경을 감지해 재로딩을 예약. 갱신일: 2025-11-12"""

    def __init__(self, onChange):
        """
        설명: SQL 파일 변경 알림 콜백을 저장해 각 파일 이벤트에서 재사용
        부작용: self.onChange에 외부 콜백 참조를 보관한다.
        갱신일: 2026-02-27
        """
        super().__init__()
        self.onChange = onChange

    def maybe(self, event: FileSystemEvent):
        """
        설명: SQL 파일 이벤트만 재로딩 후보로 분류
        부작용: 조건을 만족하면 onChange(path)를 호출한다.
        갱신일: 2025-11-12
        """
        path = getattr(event, "src_path", None) or getattr(event, "dest_path", None)
        if not path:
            return
        if path.lower().endswith(".sql"):
            self.onChange(path)

    def on_modified(self, event: FileSystemEvent):
        """설명: 수정 이벤트를 수신해 SQL 파일 필터링 로직으로 전달한다. 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_created(self, event: FileSystemEvent):
        """설명: 생성 이벤트를 수신해 SQL 파일 필터링 로직으로 전달한다. 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_moved(self, event: FileSystemEvent):
        """설명: 이동 이벤트를 수신해 SQL 파일 필터링 로직으로 전달한다. 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_deleted(self, event: FileSystemEvent):
        """설명: 삭제 이벤트를 수신해 SQL 파일 필터링 로직으로 전달한다. 부작용: 파일이면 maybe(event) 실행. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)
