import importlib
import pkgutil
from configparser import ConfigParser

import router
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from lib.Auth import AuthConfig
from lib.Database import (
    DatabaseManager,
    dbManagers,
    loadQueries,
    sqlObserver,
    startWatchingQueryFolder,
)
from lib.Logger import logger
from lib.Response import errorResponse

# FastAPI 앱 인스턴스 생성
app = FastAPI()

# =========================================================
# 기본 설정 및 유틸리티 함수
# =========================================================


def loadConfig(filename: str) -> ConfigParser:
    logger.info("설정파일 로드 중...")
    config = ConfigParser()
    with open(filename, "r", encoding="utf-8") as f:
        config.read_file(f)
    logger.info("설정파일 로드 완료")
    return config


async def onShutdown():
    """서버 종료 시 실행되는 정리 작업"""
    for manager in dbManagers.values():
        await manager.disconnect()
    if sqlObserver:
        sqlObserver.stop()
        sqlObserver.join()


# =========================================================
# 커스터마이징 가능한 영역
# =========================================================


async def onStartup():
    """
    서버 시작 시 실행되는 초기화 작업
    데이터베이스 연결 및 초기 설정을 커스터마이징하세요
    """
    logger.info("Database 연결 중...")
    global sqlObserver

    # DATABASE로 시작하는 모든 섹션 찾기
    dbSections = [s for s in config.sections() if s.startswith("DATABASE")]

    for section in dbSections:
        dbConfig = config[section]
        dbName = dbConfig.get("name", section.lower())
        dbType = dbConfig.get("type")

        if dbType == "sqlite":
            dbPath = dbConfig.get("database")
            dbUrl = f"sqlite:///{dbPath}"
        elif dbType in ["mysql", "mariadb"]:
            host = dbConfig.get("host", "localhost")
            port = dbConfig.get("port", "3306")
            database = dbConfig.get("database")
            user = dbConfig.get("user")
            password = dbConfig.get("password")
            dbUrl = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"
        elif dbType == "postgresql":
            host = dbConfig.get("host", "localhost")
            port = dbConfig.get("port", "5432")
            database = dbConfig.get("database")
            user = dbConfig.get("user")
            password = dbConfig.get("password")
            dbUrl = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        else:
            logger.warning(f"지원하지 않는 데이터베이스 타입입니다: {dbType}")
            continue

        try:
            dbManagers[dbName] = DatabaseManager(dbUrl)
            await dbManagers[dbName].connect()
            logger.info(f"데이터베이스 연결 성공: {dbName}")

        except Exception as e:
            logger.error(f"데이터베이스 연결 실패 ({dbName}): {str(e)}")

    logger.info("Database 연결 완료")
    logger.info("쿼리 로드 중...")
    loadQueries()
    logger.info("쿼리 로드 완료")
    sqlObserver = startWatchingQueryFolder()
    logger.info("쿼리 감시 시작")

    # 설정 파일 로드 후
    authConfig = config["AUTH"]
    AuthConfig.initConfig(
        secretKey=authConfig["secret_key"],
        expireMinutes=authConfig.getint("token_expire", 3600) // 60,
        tokenEnable=authConfig.getboolean("token_enable", True),
    )


# =========================================================
# 서버 설정 및 시작
# =========================================================

# 설정 파일 로드
config = loadConfig("config.ini")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=config["CORS"]["allow_origins"].split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 이벤트 핸들러 등록
app.add_event_handler("startup", onStartup)
app.add_event_handler("shutdown", onShutdown)

# 라우터 로드
logger.info("라우터 로드 중...")
for _, moduleName, _ in pkgutil.iter_modules(router.__path__, router.__name__ + "."):
    module = importlib.import_module(moduleName)
    if hasattr(module, "router"):
        app.include_router(module.router)
logger.info("라우터 로드 완료")


@app.exception_handler(Exception)
async def globalExceptionHandler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=errorResponse(message=str(exc), result={"path": request.url.path}),
    )
