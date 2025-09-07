"""
파일: backend/lib/Database.py
작성: Codex CLI
갱신: 2025-09-07
설명: DB 매니저/쿼리 로더/디렉터리 감시. 파라미터 바인딩 강제·PII 마스킹 로깅.
"""

from __future__ import annotations

import json
import os
import re
import threading
import time
from typing import Dict, Optional, Set
import contextvars

from databases import Database
from lib.Logger import logger
from lib.SqlLoader import loadSqlQueries, parseSqlFile, scanSqlQueries
from sqlalchemy import MetaData
from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

# =========================
# Module state
# =========================

dbManagers: Dict[str, "DatabaseManager"] = {}
sqlObserver: Optional[Observer] = None

baseDir = os.path.dirname(__file__)
# default: backend/query (one level up from this file)
queryDir: str = os.path.normpath(os.path.join(baseDir, "..", "query"))
queryWatch: bool = True
debounceMs: int = 150
debounceTimer: Optional[threading.Timer] = None
lastChangedFile: Optional[str] = None

# Per-request SQL counter (ContextVar)
_sql_count_var: contextvars.ContextVar[int] = contextvars.ContextVar("sql_count", default=0)


def getSqlCount() -> int:
    try:
        return int(_sql_count_var.get())
    except Exception:
        return 0


def _inc_sql_count(n: int = 1) -> None:
    try:
        cur = int(_sql_count_var.get())
        _sql_count_var.set(cur + int(n))
    except Exception:
        pass


class QueryManager:
    _instance: Optional["QueryManager"] = None

    @staticmethod
    def getInstance():
        if QueryManager._instance is None:
            QueryManager._instance = QueryManager()
        return QueryManager._instance

    def __init__(self):
        if QueryManager._instance is None:
            self.queries: Dict[str, str] = {}
            self.nameToFile: Dict[str, str] = {}
            self.fileToNames: Dict[str, Set[str]] = {}

    def setAll(self, queries: Dict[str, str], nameToFile: Dict[str, str], fileToNames: Dict[str, Set[str]]):
        self.queries = dict(queries or {})
        self.nameToFile = dict(nameToFile or {})
        self.fileToNames = {fp: set(names) for fp, names in (fileToNames or {}).items()}

    def setQueries(self, queries: dict):
        # legacy compatibility for callers only setting queries
        self.queries = dict(queries or {})

    def getQuery(self, queryName: str) -> Optional[str]:
        return self.queries.get(queryName)


class DatabaseManager:
    def __init__(self, databaseUrl: str):
        self.databaseUrl = databaseUrl
        self.database = Database(databaseUrl)
        self.metadata = MetaData()
        self.queryManager = QueryManager.getInstance()

    def _mask_params(self, values: Dict) -> Dict:
        if not values:
            return {}
        return {k: "***" for k in values.keys()}

    def _extract_placeholders(self, query: str) -> Set[str]:
        # named params: :id, :user_name, etc.
        return set(re.findall(r":([a-zA-Z_][a-zA-Z0-9_]*)", query or ""))

    def _validate_bind_parameters(self, query: str, values: Optional[Dict]):
        values = values or {}
        placeholders = self._extract_placeholders(query)
        provided = set(values.keys())

        if provided and not placeholders:
            # Provided values but query has no binds -> likely string interpolation misuse
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
        await self.database.connect()
        logger.info(f"Connected to database {self.databaseUrl}")
        # Apply pragmatic settings for SQLite to reduce 'database is locked'
        try:
            if (self.databaseUrl or "").startswith("sqlite"):
                await self.database.execute("PRAGMA journal_mode=WAL;")
                await self.database.execute("PRAGMA busy_timeout=3000;")
                await self.database.execute("PRAGMA synchronous=NORMAL;")
        except Exception:
            pass

    async def disconnect(self):
        await self.database.disconnect()

    async def execute(self, query: str, values: Dict = None):
        self._validate_bind_parameters(query, values)
        logger.info("executing query")
        logger.debug(
            f"sql={query}; params={self._mask_params(values or {})}"
        )
        result = await self.database.execute(query=query, values=values or {})
        logger.info(f"rows_affected={result}")
        _inc_sql_count()
        return result

    async def fetchOne(self, query: str, values: Dict = None):
        self._validate_bind_parameters(query, values)
        logger.info("fetch_one")
        logger.debug(
            f"sql={query}; params={self._mask_params(values or {})}"
        )
        result = await self.database.fetch_one(query=query, values=values or {})
        if result is not None:
            data = dict(result)
            logger.info("rows_returned=1")
            _inc_sql_count()
            return data
        else:
            logger.info("rows_returned=0")
            _inc_sql_count()
            return None

    async def fetchAll(self, query: str, values: Dict = None):
        self._validate_bind_parameters(query, values)
        logger.info("fetch_all")
        logger.debug(
            f"sql={query}; params={self._mask_params(values or {})}"
        )
        result = await self.database.fetch_all(query=query, values=values or {})
        if result is not None:
            data = [{column: row[column] for column in row.keys()} for row in result]
            logger.info(f"rows_returned={len(data)}")
            _inc_sql_count()
            return data
        else:
            logger.info("rows_returned=0")
            _inc_sql_count()
            return None

    async def executeQuery(self, queryName: str, values: Dict = None):
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        logger.info(f"execute named query: {queryName}")
        return await self.execute(query, values)

    async def fetchOneQuery(self, queryName: str, values: Dict = None):
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        logger.info(f"fetchOne named query: {queryName}")
        return await self.fetchOne(query, values)

    async def fetchAllQuery(self, queryName: str, values: Dict = None):
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"cannot find query name : {queryName}")
            raise ValueError()
        logger.info(f"fetchAll named query: {queryName}")
        return await self.fetchAll(query, values)


# =========================
# Query loader config & ops
# =========================


def setQueryConfig(query_dir: str, watch: bool, debounce_ms: int):
    global queryDir, queryWatch, debounceMs
    if not os.path.isabs(query_dir):
        query_dir = os.path.join(baseDir, query_dir)
    queryDir = query_dir
    queryWatch = bool(watch)
    debounceMs = int(debounce_ms)


def loadQueries() -> int:
    started = time.perf_counter()
    queries, nameToFile, fileToNames = scanSqlQueries(queryDir)
    QueryManager.getInstance().setAll(queries, nameToFile, fileToNames)
    duration_ms = int((time.perf_counter() - started) * 1000)
    try:
        msg = json.dumps(
            {
                "event": "query.load",
                "file": queryDir,
                "keys": sorted(list(queries.keys()))[:20],
                "count": len(queries),
                "duration_ms": duration_ms,
            },
            ensure_ascii=False,
        )
        logger.info(msg)
    except Exception:
        logger.info(
            f"queries_loaded dir={queryDir} count={len(queries)} duration_ms={duration_ms}"
        )
    return len(queries)


def scheduleReload(changedPath: Optional[str]):
    global debounceTimer, lastChangedFile
    lastChangedFile = changedPath
    if debounceTimer and debounceTimer.is_alive():
        debounceTimer.cancel()
    debounceTimer = threading.Timer(debounceMs / 1000.0, doReload)
    debounceTimer.daemon = True
    debounceTimer.start()


def doReload() -> bool:
    started = time.perf_counter()
    changed_file = lastChangedFile or queryDir
    try:
        qm = QueryManager.getInstance()
        if changed_file and os.path.isfile(changed_file):
            # partial reload for single file
            pairs = parseSqlFile(changed_file)
            # copy current state
            newQueries = dict(qm.queries)
            newNameToFile = dict(qm.nameToFile)
            newFileToNames = {fp: set(names) for fp, names in qm.fileToNames.items()}
            # remove old names from this file
            oldNames = newFileToNames.get(changed_file, set())
            for n in oldNames:
                newQueries.pop(n, None)
                newNameToFile.pop(n, None)
            # add new ones (cross-file duplicate detection)
            for name, sql in pairs:
                owner = newNameToFile.get(name)
                if owner is not None and owner != changed_file:
                    raise ValueError(f"duplicate query key across files: {name}")
                newQueries[name] = sql
                newNameToFile[name] = changed_file
            newFileToNames[changed_file] = set(n for n, _ in pairs)
        else:
            newQueries, newNameToFile, newFileToNames = scanSqlQueries(queryDir)
    except Exception as e:
        duration_ms = int((time.perf_counter() - started) * 1000)
        err_payload = {
            "event": "query.reload.error",
            "file": changed_file,
            "error": str(e),
            "duration_ms": duration_ms,
        }
        logger.error(json.dumps(err_payload, ensure_ascii=False))
        # keep last good version intact
        return False

    # success -> swap to new queries
    qm.setAll(newQueries, newNameToFile, newFileToNames)
    duration_ms = int((time.perf_counter() - started) * 1000)
    keys_from_file: Optional[list] = None
    try:
        if changed_file and os.path.isfile(changed_file):
            pairs2 = parseSqlFile(changed_file)
            keys_from_file = [name for name, _ in pairs2]
    except Exception:
        keys_from_file = None
    payload = {
        "event": "query.reload",
        "file": changed_file,
        "keys": keys_from_file if keys_from_file is not None else sorted(list(newQueries.keys()))[:20],
        "count": len(newQueries),
        "duration_ms": duration_ms,
    }
    logger.info(json.dumps(payload, ensure_ascii=False))
    return True


def startWatchingQueryFolder() -> Optional[Observer]:
    if not queryWatch:
        return None
    observer = Observer()
    handler = QueryFolderEventHandler(scheduleReload)
    observer.schedule(handler, queryDir, recursive=True)
    observer.start()
    return observer


class QueryFolderEventHandler(FileSystemEventHandler):
    def __init__(self, onChange):
        super().__init__()
        self.onChange = onChange

    def maybe(self, event: FileSystemEvent):
        path = getattr(event, "src_path", None) or getattr(event, "dest_path", None)
        if not path:
            return
        if path.lower().endswith(".sql"):
            self.onChange(path)

    def on_modified(self, event: FileSystemEvent):
        if not event.is_directory:
            self.maybe(event)

    def on_created(self, event: FileSystemEvent):
        if not event.is_directory:
            self.maybe(event)

    def on_moved(self, event: FileSystemEvent):
        if not event.is_directory:
            self.maybe(event)

    def on_deleted(self, event: FileSystemEvent):
        if not event.is_directory:
            self.maybe(event)
