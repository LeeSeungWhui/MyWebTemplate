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


def maskDatabaseUrl(url: str) -> str:
    """
    설명: DB 접속 URL에서 자격증명(password)을 마스킹해 로그에 노출되지 않게 한다.
    갱신일: 2026-02-06
    """
    if not url or not isinstance(url, str):
        return ""
    try:
        parts = urlsplit(url)
        if not parts.netloc or "@" not in parts.netloc:
            return url
        userinfo, hostinfo = parts.netloc.rsplit("@", 1)
        if ":" in userinfo:
            user, _password = userinfo.split(":", 1)
            safeUserinfo = f"{user}:***"
        else:
            safeUserinfo = userinfo
        safeNetloc = f"{safeUserinfo}@{hostinfo}"
        return urlunsplit((parts.scheme, safeNetloc, parts.path, parts.query, parts.fragment))
    except Exception:
        try:
            return re.sub(r"(^[a-zA-Z][a-zA-Z0-9+.-]*://[^:@/]+):[^@/]*@", r"\\1:***@", url)
        except Exception:
            return "<redacted>"


def getSqlCount() -> int:
    """설명: 현재 요청 컨텍스트의 SQL 실행 누계를 반환. 갱신일: 2025-11-12"""
    try:
        return int(sqlCountVar.get())
    except Exception:
        return 0


def setPrimaryDbName(name: str) -> None:
    """설명: 기본 DB 이름을 설정한다. 갱신일: 2025-11-12"""
    global primaryDbName
    primaryDbName = (name or "").strip() or None


def getPrimaryDbName() -> str:
    """설명: 우선순위(설정→ENV→보유목록)로 기본 DB 이름을 반환. 갱신일: 2025-11-12"""
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
    """설명: 이름(없으면 기본 DB)으로 DatabaseManager를 조회. 갱신일: 2025-11-12"""
    key = (name or "").strip() or getPrimaryDbName()
    return dbManagers.get(key)


def incSqlCount(n: int = 1) -> None:
    """설명: 현재 컨텍스트 SQL 카운터를 증가. 갱신일: 2025-11-12"""
    try:
        cur = int(sqlCountVar.get())
        sqlCountVar.set(cur + int(n))
    except Exception:
        pass


def resetSqlCount() -> None:
    """설명: 현재 컨텍스트 SQL 카운터를 0으로 초기화. 갱신일: 2026-02-22"""
    try:
        sqlCountVar.set(0)
    except Exception:
        pass


class QueryManager:
    instance: "QueryManager" | None = None

    @staticmethod
    def getInstance():
        """설명: 싱글톤 QueryManager를 반환한다. 갱신일: 2025-11-12"""
        if QueryManager.instance is None:
            QueryManager.instance = QueryManager()
        return QueryManager.instance

    def __init__(self):
        if QueryManager.instance is None:
            self.queries: dict[str, str] = {}
            self.nameToFile: dict[str, str] = {}
            self.fileToNames: dict[str, set[str]] = {}

    def setAll(self, queries: dict[str, str], nameToFile: dict[str, str], fileToNames: dict[str, set[str]]):
        """설명: 전체 쿼리/파일 매핑을 덮어쓴다. 갱신일: 2025-11-12"""
        self.queries = dict(queries or {})
        self.nameToFile = dict(nameToFile or {})
        self.fileToNames = {fp: set(names) for fp, names in (fileToNames or {}).items()}

    def setQueries(self, queries: dict):
        """설명: 쿼리 테이블만 교체(레거시 호환). 갱신일: 2025-11-12"""
        # 이전 코드 호환을 위해 쿼리 dict만 갱신 허용
        self.queries = dict(queries or {})

    def getQuery(self, queryName: str) -> str | None:
        """설명: 이름으로 SQL 텍스트를 조회한다. 갱신일: 2025-11-12"""
        return self.queries.get(queryName)


class DatabaseManager:
    """설명: databases.Database 래퍼로 실행/바인딩 검증 담당. 갱신일: 2025-11-12"""

    def __init__(self, databaseUrl: str):
        """설명: DB 연결 URL을 받아 클라이언트를 준비한다. 갱신일: 2025-11-12"""
        self.databaseUrl = databaseUrl
        self.database = Database(databaseUrl)
        self.metadata = MetaData()
        self.queryManager = QueryManager.getInstance()

    def maskParams(self, values: dict[str, Any] | None) -> dict[str, str]:
        """설명: 로그에 사용할 파라미터 키만 노출. 갱신일: 2025-11-12"""
        if not values:
            return {}
        return {k: "***" for k in values.keys()}

    def extractPlaceholders(self, query: str) -> set[str]:
        """설명: 쿼리에서 :name 형 플레이스홀더 목록을 추출. 갱신일: 2025-11-12"""
        # 예시: :id, :user_name 등 명명 파라미터
        # PostgreSQL 캐스트(::jsonb)와 구분하기 위해 단일 ':'만 파라미터로 본다.
        return set(re.findall(r"(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)", query or ""))

    def normalizeQueryForLog(self, query: str) -> str:
        """설명: SQL 원문의 빈 줄/불필요 공백을 정리해 사람이 읽기 좋게 만든다. 갱신일: 2026-02-22"""
        rawLines = str(query or "").splitlines()
        lines: list[str] = []
        for rawLine in rawLines:
            line = re.sub(r"\s+", " ", rawLine).strip()
            if not line:
                continue
            lines.append(line)
        return "\n".join(lines).rstrip(";")

    def truncateLogText(self, text: str, maxLength: int = 1200) -> str:
        """설명: 과도하게 긴 SQL 로그를 잘라 단일 라인 로그 폭주를 방지한다. 갱신일: 2026-02-22"""
        if len(text) <= maxLength:
            return text
        return f"{text[:maxLength]} …(truncated)"

    def shouldRevealSqlLiteralValues(self) -> bool:
        """
        설명: SQL 로그에 실제 리터럴 값을 노출할지 여부를 판단한다.
        환경변수 SQL_LOG_LITERAL_VALUES=true|1|yes|on 일 때만 노출한다.
        갱신일: 2026-02-22
        """
        raw = str(os.getenv("SQL_LOG_LITERAL_VALUES", "")).strip().lower()
        return raw in {"1", "true", "yes", "on"}

    def toSqlLiteralForLog(self, value: Any, revealLiteral: bool) -> str:
        """설명: 로그 출력용 SQL 리터럴 문자열로 변환한다. 갱신일: 2026-02-22"""
        if value is None:
            return "NULL"
        if not revealLiteral:
            if isinstance(value, (int, float)) and not isinstance(value, bool):
                return "?"
            if isinstance(value, bool):
                return "?"
            return "'***'"
        if isinstance(value, bool):
            return "TRUE" if value else "FALSE"
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            return str(value)
        if isinstance(value, (dict, list)):
            text = json.dumps(value, ensure_ascii=False).replace("'", "''")
            return f"'{text}'"
        if isinstance(value, (bytes, bytearray, memoryview)):
            return "'<binary>'"
        text = str(value).replace("'", "''")
        return f"'{text}'"

    def renderQueryForLog(self, normalizedQuery: str, values: dict[str, Any] | None, revealLiteral: bool) -> str:
        """설명: :name 플레이스홀더를 로그용 리터럴로 치환한 SQL을 생성한다. 갱신일: 2026-02-22"""
        params = values or {}
        pattern = re.compile(r"(?<!:):([a-zA-Z_][a-zA-Z0-9_]*)")

        def replace(match: re.Match[str]) -> str:
            key = match.group(1)
            if key not in params:
                return match.group(0)
            return self.toSqlLiteralForLog(params.get(key), revealLiteral)

        return pattern.sub(replace, normalizedQuery)

    def logQuery(self, op: str, query: str, values: dict[str, Any] | None = None, queryName: str | None = None) -> None:
        """설명: SQL 로그를 읽기 쉬운 최소 필드(queryName/sqlRendered)로 남긴다. 갱신일: 2026-02-22"""
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
        """설명: 제공된 파라미터와 플레이스홀더 일치 여부를 검사. 갱신일: 2025-11-12"""
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
        """설명: DB 연결을 시작하고 SQLite 튜닝을 적용. 갱신일: 2025-11-12"""
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
        """설명: 데이터베이스 연결을 종료한다. 갱신일: 2025-11-12"""
        await self.database.disconnect()

    async def execute(self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None) -> Any:
        """설명: 쓰기 쿼리를 실행하고 영향 행을 반환. 갱신일: 2025-11-12"""
        self.validateBindParameters(query, values)
        self.logQuery("execute", query, values, queryName)
        result = await self.database.execute(query=query, values=values or {})
        logger.info(f"rows_affected={result}")
        incSqlCount()
        return result

    async def fetchOne(
        self, query: str, values: dict[str, Any] | None = None, queryName: str | None = None
    ) -> dict[str, Any] | None:
        """설명: 단일 행을 조회해 dict로 반환. 갱신일: 2025-11-12"""
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
        """설명: 여러 행을 리스트로 반환. 갱신일: 2025-11-12"""
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
        """설명: 등록된 이름 기반 쿼리를 실행. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        return await self.execute(query, values, queryName=queryName)

    async def fetchOneQuery(self, queryName: str, values: dict[str, Any] | None = None) -> dict[str, Any] | None:
        """설명: 등록 쿼리 중 단일 행을 가져온다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        return await self.fetchOne(query, values, queryName=queryName)

    async def fetchAllQuery(
        self, queryName: str, values: dict[str, Any] | None = None
    ) -> list[dict[str, Any]] | None:
        """설명: 등록 쿼리 중 여러 행을 가져온다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        return await self.fetchAll(query, values, queryName=queryName)


# =========================
# 쿼리 로더 설정 및 동작
# =========================


def setQueryConfig(queryDirParam: str, watch: bool, debounceMsParam: int):
    """설명: 쿼리 디렉터리/워치 설정을 업데이트. 갱신일: 2025-11-12"""
    global queryDir, queryWatch, debounceMs
    if not os.path.isabs(queryDirParam):
        queryDirParam = os.path.join(baseDir, queryDirParam)
    queryDir = queryDirParam
    queryWatch = bool(watch)
    debounceMs = int(debounceMsParam)


def loadQueries() -> int:
    """설명: SQL 폴더를 파싱해 QueryManager에 로드. 갱신일: 2025-11-12"""
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
    """설명: 변경된 파일을 기록하고 디바운스 타이머를 기동. 갱신일: 2025-11-12"""
    global debounceTimer, lastChangedFile
    lastChangedFile = changedPath
    if debounceTimer and debounceTimer.is_alive():
        debounceTimer.cancel()
    debounceTimer = threading.Timer(debounceMs / 1000.0, doReload)
    debounceTimer.daemon = True
    debounceTimer.start()


def doReload() -> bool:
    """설명: 디바운스 이후 실제로 쿼리 파일을 다시 읽는다. 갱신일: 2025-11-12"""
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
    """설명: watchdog으로 쿼리 폴더 변화를 감시. 갱신일: 2025-11-12"""
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
        super().__init__()
        self.onChange = onChange

    def maybe(self, event: FileSystemEvent):
        """설명: SQL 파일이면 콜백을 호출한다. 갱신일: 2025-11-12"""
        path = getattr(event, "src_path", None) or getattr(event, "dest_path", None)
        if not path:
            return
        if path.lower().endswith(".sql"):
            self.onChange(path)

    def on_modified(self, event: FileSystemEvent):
        """설명: 수정 이벤트 처리. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_created(self, event: FileSystemEvent):
        """설명: 생성 이벤트 처리. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_moved(self, event: FileSystemEvent):
        """설명: 이동 이벤트 처리. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)

    def on_deleted(self, event: FileSystemEvent):
        """설명: 삭제 이벤트 처리. 갱신일: 2025-11-12"""
        if not event.is_directory:
            self.maybe(event)
