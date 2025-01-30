from typing import Dict

from databases import Database
from lib.Logger import logger
from lib.SqlLoader import loadSqlQueries
from sqlalchemy import MetaData
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

# 쿼리 폴더 경로
path = "query"
dbManagers = {}
sqlObserver = {}


class QueryManager:
    _instance = None

    @staticmethod
    def getInstance():
        if QueryManager._instance == None:
            QueryManager._instance = QueryManager()
        return QueryManager._instance

    def __init__(self):
        if QueryManager._instance == None:
            self.queries = {}

    def setQueries(self, queries: dict):
        self.queries = queries

    def getQuery(self, queryName: str):
        return self.queries.get(queryName)


class DatabaseManager:
    def __init__(self, databaseUrl: str):
        self.databaseUrl = databaseUrl
        self.database = Database(databaseUrl)
        self.metadata = MetaData()
        self.queryManager = QueryManager.getInstance()

    def createQueryWithParams(self, query: str, values: Dict):
        for key, value in values.items():
            placeholder = f":{key}"
            query = query.replace(placeholder, repr(value))
        return query

    async def connect(self):
        await self.database.connect()
        logger.info(f"Connected to database {self.databaseUrl}")

    async def disconnect(self):
        await self.database.disconnect()

    async def execute(self, query: str, values: Dict = None):
        if values is None:
            values = {}

        filteredValues = {k: v for k, v in values.items() if f":{k}" in query}
        queryWithParams = self.createQueryWithParams(query, filteredValues)
        logger.info(f"실행 쿼리:\n {queryWithParams}")

        result = await self.database.execute(query=query, values=filteredValues)
        logger.info(f"영향 받은 row 수: {result}")
        return result

    async def fetchOne(self, query: str, values: Dict = None):
        if values is None:
            values = {}

        filteredValues = {k: v for k, v in values.items() if f":{k}" in query}
        queryWithParams = self.createQueryWithParams(query, filteredValues)
        logger.info(f"실행 쿼리:\n {queryWithParams}")

        result = await self.database.fetch_one(query=query, values=filteredValues)
        if result is not None:
            data = dict(result)
            logger.info("반환 row 수: 1")
            return data
        else:
            logger.info("반환 row 수: 0")
            return None

    async def fetchAll(self, query: str, values: Dict = None):
        if values is None:
            values = {}

        filteredValues = {k: v for k, v in values.items() if f":{k}" in query}
        queryWithParams = self.createQueryWithParams(query, filteredValues)
        logger.info(f"실행 쿼리:\n {queryWithParams}")

        result = await self.database.fetch_all(query=query, values=filteredValues)
        if result is not None:
            data = [{column: row[column] for column in row.keys()} for row in result]
            logger.info(f"반환 row 수: {len(data)}")
            return data
        else:
            logger.info("반환 row 수: 0")
            return None

    async def executeQuery(self, queryName: str, values: Dict = None):
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"실행 쿼리명을 찾을 수 없습니다 : {queryName}")
            raise ValueError()
        logger.info(f"실행 쿼리명 : {queryName}")
        return await self.execute(query, values)

    async def fetchOneQuery(self, queryName: str, values: Dict = None):
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"실행 쿼리명을 찾을 수 없습니다 : {queryName}")
            raise ValueError()
        logger.info(f"실행 쿼리명 : {queryName}")
        return await self.fetchOne(query, values)

    async def fetchAllQuery(self, queryName: str, values: Dict = None):
        query = self.queryManager.getQuery(queryName)
        if not query:
            logger.info(f"실행 쿼리명을 찾을 수 없습니다 : {queryName}")
            raise ValueError()
        logger.info(f"실행 쿼리명 : {queryName}")
        return await self.fetchAll(query, values)


# 감시 시작 함수


def startWatchingQueryFolder():
    eventHandler = QueryFolderEventHandler()
    observer = Observer()
    observer.schedule(eventHandler, path, recursive=False)
    observer.start()
    return observer


# 쿼리를 로드하는 메서드


def loadQueries():
    logger.info("쿼리 로드 폴더: " + path)
    QueryManager.getInstance().setQueries(loadSqlQueries(path))


class QueryFolderEventHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            logger.info(f"쿼리 변경 감지: {event.src_path}")
            # 변경 사항이 감지되면 쿼리 다시 로드
            loadQueries()
