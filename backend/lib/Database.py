"""
파일: backend/lib/Database.py
작성: LSH
갱신: 2025-09-07
설명: DB 매니저/쿼리 로더/디렉터리 감시. 파라미터 바인딩 강제·PII 마스킹 로깅.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
from typing import Dict, Optional, Set, Any, List
import contextvars

from databases import Database
from lib.Logger import logger
from lib.SqlLoader import parseSqlFile, scanSqlQueries
from sqlalchemy import MetaData
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

# =========================
# 모듈 전역 상태
# =========================

dbManagers: Dict[str, "DatabaseManager"] = {}
# 기본 DB 이름(템플릿 기본값은 main_db)
_primaryDbName: Optional[str] = None
# 일부 서드파티 패키지는 PEP 561 타입 스텁이 없어 Pylance가 Unknown으로 인식한다.
sqlObserver: Optional[Any] = None

baseDir = os.path.dirname(__file__)
# 기본 쿼리 디렉터리: backend/query
queryDir: str = os.path.normpath(os.path.join(baseDir, "..", "query"))
queryWatch: bool = True
debounceMs: int = 150
debounceTimer: Optional[threading.Timer] = None
lastChangedFile: Optional[str] = None

# 요청 단위 SQL 카운터(ContextVar)
_sqlCountVar: contextvars.ContextVar[int] = contextvars.ContextVar("sql_count", default=0)


def getSqlCount() -> int:
    """설명: 현재 요청 컨텍스트의 SQL 실행 누계를 반환. 갱신일: 2025-11-12"""
    try:
        return int(_sqlCountVar.get())
    except Exception:
        return 0


def setPrimaryDbName(name: str) -> None:
    """설명: 기본 DB 이름을 설정한다. 갱신일: 2025-11-12"""
    global _primaryDbName
    _primaryDbName = (name or "").strip() or None


def getPrimaryDbName() -> str:
    """설명: 우선순위(설정→ENV→보유목록)로 기본 DB 이름을 반환. 갱신일: 2025-11-12"""
    # 우선순위: 명시적 설정 → 환경변수 → 템플릿 기본값 → 등록된 첫 DB
    if _primaryDbName:
        return _primaryDbName
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


def getManager(name: Optional[str] = None) -> Optional["DatabaseManager"]:
    """설명: 이름(없으면 기본 DB)으로 DatabaseManager를 조회. 갱신일: 2025-11-12"""
    key = (name or "").strip() or getPrimaryDbName()
    return dbManagers.get(key)


def _incSqlCount(n: int = 1) -> None:
    """설명: 현재 컨텍스트 SQL 카운터를 증가. 갱신일: 2025-11-12"""
    try:
        cur = int(_sqlCountVar.get())
        _sqlCountVar.set(cur + int(n))
    except Exception:
        pass


class QueryManager:
    _instance: Optional["QueryManager"] = None

    @staticmethod
    def getInstance():
        """설명: 싱글톤 QueryManager를 반환한다. 갱신일: 2025-11-12"""
        if QueryManager._instance is None:
            QueryManager._instance = QueryManager()
        return QueryManager._instance

    def __init__(self):
        if QueryManager._instance is None:
            self.queries: Dict[str, str] = {}
            self.nameToFile: Dict[str, str] = {}
            self.fileToNames: Dict[str, Set[str]] = {}

    def setAll(self, queries: Dict[str, str], nameToFile: Dict[str, str], fileToNames: Dict[str, Set[str]]):
        """설명: 전체 쿼리/파일 매핑을 덮어쓴다. 갱신일: 2025-11-12"""
        self.queries = dict(queries or {})
        self.nameToFile = dict(nameToFile or {})
        self.fileToNames = {fp: set(names) for fp, names in (fileToNames or {}).items()}

    def setQueries(self, queries: dict):
        """설명: 쿼리 테이블만 교체(레거시 호환). 갱신일: 2025-11-12"""
        # 이전 코드 호환을 위해 쿼리 dict만 갱신 허용
        self.queries = dict(queries or {})

    def getQuery(self, queryName: str) -> Optional[str]:
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

    def _maskParams(self, values: Optional[Dict[str, Any]]) -> Dict[str, str]:
        """설명: 로그에 사용할 파라미터 키만 노출. 갱신일: 2025-11-12"""
        if not values:
            return {}
        return {k: "***" for k in values.keys()}

    def _extractPlaceholders(self, query: str) -> Set[str]:
        """설명: 쿼리에서 :name 형 플레이스홀더 목록을 추출. 갱신일: 2025-11-12"""
        # 예시: :id, :user_name 등 명명 파라미터
        return set(re.findall(r":([a-zA-Z_][a-zA-Z0-9_]*)", query or ""))

    def _validateBindParameters(self, query: str, values: Optional[Dict[str, Any]]):
        """설명: 제공된 파라미터와 플레이스홀더 일치 여부를 검사. 갱신일: 2025-11-12"""
        values = values or {}
        placeholders = self._extractPlaceholders(query)
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
        logger.info(f"Connected to database {self.databaseUrl}")
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

    async def execute(self, query: str, values: Optional[Dict[str, Any]] = None) -> Any:
        """설명: 쓰기 쿼리를 실행하고 영향 행을 반환. 갱신일: 2025-11-12"""
        self._validateBindParameters(query, values)
        logger.info("executing query")
        logger.debug(
            f"sql={query}; params={self._maskParams(values or {})}"
        )
        result = await self.database.execute(query=query, values=values or {})
        logger.info(f"rows_affected={result}")
        _incSqlCount()
        return result

    async def fetchOne(self, query: str, values: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """설명: 단일 행을 조회해 dict로 반환. 갱신일: 2025-11-12"""
        self._validateBindParameters(query, values)
        logger.info("fetch_one")
        logger.debug(
            f"sql={query}; params={self._maskParams(values or {})}"
        )
        result = await self.database.fetch_one(query=query, values=values or {})
        if result is not None:
            data: Dict[str, Any] = dict(result)
            logger.info("rows_returned=1")
            _incSqlCount()
            return data
        else:
            logger.info("rows_returned=0")
            _incSqlCount()
            return None

    async def fetchAll(self, query: str, values: Optional[Dict[str, Any]] = None) -> Optional[List[Dict[str, Any]]]:
        """설명: 여러 행을 리스트로 반환. 갱신일: 2025-11-12"""
        self._validateBindParameters(query, values)
        logger.info("fetch_all")
        logger.debug(
            f"sql={query}; params={self._maskParams(values or {})}"
        )
        result = await self.database.fetch_all(query=query, values=values or {})
        if result is not None:
            data: List[Dict[str, Any]] = [{column: row[column] for column in row.keys()} for row in result]  # type: ignore[index]
            logger.info(f"rows_returned={len(data)}")
            _incSqlCount()
            return data
        else:
            logger.info("rows_returned=0")
            _incSqlCount()
            return None

    async def executeQuery(self, queryName: str, values: Optional[Dict[str, Any]] = None) -> Any:
        """설명: 등록된 이름 기반 쿼리를 실행. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        logger.info(f"execute named query: {queryName}")
        return await self.execute(query, values)

    async def fetchOneQuery(self, queryName: str, values: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """설명: 등록 쿼리 중 단일 행을 가져온다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        logger.info(f"fetchOne named query: {queryName}")
        return await self.fetchOne(query, values)

    async def fetchAllQuery(self, queryName: str, values: Optional[Dict[str, Any]] = None) -> Optional[List[Dict[str, Any]]]:
        """설명: 등록 쿼리 중 여러 행을 가져온다. 갱신일: 2025-11-12"""
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        logger.info(f"fetchAll named query: {queryName}")
        return await self.fetchAll(query, values)


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
        logger.info(
            f"queries_loaded dir={queryDir} count={len(queries)} duration_ms={durationMs}"
        )
    return len(queries)


def scheduleReload(changedPath: Optional[str]):
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
    keysFromFile: Optional[list] = None
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


def startWatchingQueryFolder() -> Optional[Any]:
    """설명: watchdog으로 쿼리 폴더 변화를 감시. 갱신일: 2025-11-12"""
    if not queryWatch:
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
