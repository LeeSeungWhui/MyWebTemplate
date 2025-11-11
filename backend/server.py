"""
파일: backend/server.py
작성자: LSH
갱신일: 2025-11-12
설명: FastAPI 서버 기동, DB/CORS/라우터 전체 초기화 담당.
"""

import importlib
import os
import pkgutil

try:
    from . import router as router  # 패키지로 실행될 때 라우터 임포트
except Exception:  # pragma: no cover - 단일 스크립트 실행 대응
    import router  # backend/ 디렉터리에서 직접 실행되는 경우 라우터 임포트

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

# backend.server / server 양쪽 임포트 경로를 모두 지원
try:  # 패키지 컨텍스트
    from .lib.Auth import AuthConfig  # type: ignore
    from .lib.Database import (  # type: ignore
        DatabaseManager,
        loadQueries,
        sqlObserver,
        startWatchingQueryFolder,
        setQueryConfig,
    )
    from .lib import Database as DB  # type: ignore
    from .lib.Logger import logger  # type: ignore
    from .lib.Response import errorResponse  # type: ignore
    from .lib.Middleware import RequestLogMiddleware  # type: ignore
    from .lib.OpenAPI import attachOpenAPI  # type: ignore
    from .lib.Config import get_config  # type: ignore
except Exception:  # 모듈 컨텍스트
    from lib.Auth import AuthConfig
    from lib.Database import (
        DatabaseManager,
        loadQueries,
        sqlObserver,
        startWatchingQueryFolder,
        setQueryConfig,
    )
    from lib import Database as DB
    from lib.Logger import logger
    from lib.Response import errorResponse
    from lib.Middleware import RequestLogMiddleware
    from lib.OpenAPI import attachOpenAPI
    from lib.Config import get_config

app = FastAPI()

# ---------------------------------------------------------------------------
# 설정 관련 헬퍼
# ---------------------------------------------------------------------------


async def onShutdown():
    """애플리케이션 종료 시 DB/워처 리소스를 정리한다. (갱신: 2025-11-12)"""
    for manager in DB.dbManagers.values():
        if hasattr(manager, "disconnect"):
            await manager.disconnect()
    if sqlObserver:
        sqlObserver.stop()
        sqlObserver.join()


# ---------------------------------------------------------------------------
# 스타트업 작업
# ---------------------------------------------------------------------------


async def onStartup():
    """DB/쿼리/인증 설정을 초기화한다. (갱신: 2025-11-12)"""
    logger.info("database connect start")
    global sqlObserver

    config = get_config()
    dbSections = [s for s in config.sections() if s.startswith("DATABASE")]

    for section in dbSections:
        dbConfig = config[section]
        dbName = dbConfig.get("name", section.lower())
        dbType = dbConfig.get("type")

        # 이미 등록된 매니저는 다시 초기화하지 않음
        if dbName in DB.dbManagers:
            continue

        if dbType == "sqlite":
            # 데이터베이스 파일 경로 안전 처리(None/빈문자열 대비)
            rawPath = dbConfig.get("database")
            baseDir = os.path.dirname(__file__)
            if not rawPath:
                dbPath = os.path.join(baseDir, "data", "main.db")
            else:
                dbPath = rawPath
                if not os.path.isabs(dbPath):
                    dbPath = os.path.join(baseDir, dbPath)
            os.makedirs(os.path.dirname(dbPath), exist_ok=True)
            dbUrl = f"sqlite:///{dbPath}"
        elif dbType in ["mysql", "mariadb"]:
            host = dbConfig.get("host", "localhost")
            port = dbConfig.get("port", "3306")
            database = dbConfig.get("database")
            user = dbConfig.get("user")
            password = dbConfig.get("password")
            # databases 패키지와의 호환을 위해 async 드라이버를 사용
            dbUrl = f"mysql+aiomysql://{user}:{password}@{host}:{port}/{database}"
        elif dbType == "postgresql":
            host = dbConfig.get("host", "localhost")
            port = dbConfig.get("port", "5432")
            database = dbConfig.get("database")
            user = dbConfig.get("user")
            password = dbConfig.get("password")
            dbUrl = f"postgresql://{user}:{password}@{host}:{port}/{database}"
        else:
            logger.warning(f"unsupported database type: {dbType}")
            continue

        try:
            if dbName not in DB.dbManagers or not getattr(DB.dbManagers[dbName], "databaseUrl", None):
                DB.dbManagers[dbName] = DatabaseManager(dbUrl)
            if hasattr(DB.dbManagers[dbName], "connect"):
                await DB.dbManagers[dbName].connect()
            logger.info(f"database connected: {dbName}")
        except Exception as e:
            logger.error(f"database connect failed ({dbName}): {str(e)}")

    logger.info("database connect done")
    logger.info("query load start")

    # 쿼리 로더 설정
    try:
        dbGlobal = config["DATABASE"]
    except Exception:
        dbGlobal = None

    baseDir = os.path.dirname(__file__)
    repoRoot = os.path.dirname(baseDir)
    queryDirRaw = (dbGlobal.get("query_dir") if dbGlobal else None) or "query"
    if not os.path.isabs(queryDirRaw):
        norm = queryDirRaw.replace("\\", "/")
        if norm.startswith("backend/"):
            queryDirAbs = os.path.join(repoRoot, queryDirRaw)
        else:
            queryDirAbs = os.path.join(baseDir, queryDirRaw)
    else:
        queryDirAbs = queryDirRaw

    queryWatch = True
    try:
        queryWatch = dbGlobal.getboolean("query_watch", True) if dbGlobal else True
    except Exception:
        pass

    try:
        queryWatchDebounceMs = dbGlobal.getint("query_watch_debounce_ms", 150) if dbGlobal else 150
    except Exception:
        queryWatchDebounceMs = 150

    setQueryConfig(queryDirAbs, queryWatch, queryWatchDebounceMs)

    loadQueries()
    logger.info("query load done")
    sqlObserver = startWatchingQueryFolder()
    if sqlObserver:
        logger.info("query watcher started")

    # 인증 설정 로딩
    config = get_config()
    authConfig = config["AUTH"]
    AuthConfig.initConfig(
        secretKey=authConfig["secret_key"],
        expireMinutes=authConfig.getint("token_expire", 3600) // 60,
        tokenEnable=authConfig.getboolean("token_enable", True),
    )

    # 사용자 테이블 생성/시드는 스크립트나 AuthService가 담당하므로 여기서는 건드리지 않는다.
    # 외부 DB를 존중하기 위해 스타트업 단계에서 묵시적 DDL/DML을 수행하지 않는다.

    try:
        attachOpenAPI(app, get_config())
    except Exception:
        pass


# ---------------------------------------------------------------------------
# 애플리케이션 설정
# ---------------------------------------------------------------------------

# 설정은 한 번만 로드해 재사용
cfg = get_config()

# DB 헬퍼가 기본 DB 이름을 알 수 있도록 전달(실패 시 무시)
try:
    DB.setPrimaryDbName(cfg["DATABASE"].get("name", "main_db"))
except Exception:
    pass

# CORS 설정
corsConfig = cfg["CORS"]
originsRaw = corsConfig.get("allow_origins", "").strip()
originRegexRaw = corsConfig.get("allow_origin_regex", "").strip()
try:
    allowCredentials = corsConfig.getboolean("allow_credentials", True)
except Exception:
    allowCredentials = True

# 엄격 모드: 자격 증명 허용 시 '*' 사용 금지
if originsRaw == "*":
    if allowCredentials:
        raise ValueError(
            "CORS misconfig: '*' cannot be used with allow_credentials=true. "
            "Either set allow_credentials=false or list explicit origins."
        )
    origins = ["*"]
else:
    origins = [o.strip() for o in originsRaw.split(",") if o.strip()]

allowOriginRegex = originRegexRaw or None

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allowOriginRegex,
    allow_credentials=allowCredentials,
    allow_methods=["*"],
    allow_headers=["*"]
)

# FastAPI 이벤트 핸들러 연결
app.add_event_handler("startup", onStartup)
app.add_event_handler("shutdown", onShutdown)

# 요청 로그 및 request id 전파 미들웨어
app.add_middleware(RequestLogMiddleware)

# 웹 세션 쿠키 미들웨어
app.add_middleware(
    SessionMiddleware,
    secret_key=cfg["AUTH"]["secret_key"],
    session_cookie=cfg["AUTH"].get("session_cookie", "sid"),
    same_site="lax",
    https_only=os.getenv("ENV", "dev").lower() == "prod",
    max_age=cfg["AUTH"].getint("token_expire", 3600),
)

# 라우터 로딩
logger.info("router load start")
# 설정값에 따라 데모 라우터를 비활성화할 수 있음
disableDemoRoutes = False
try:
    disableDemoRoutes = cfg["SERVER"].getboolean("disable_demo_routes", False)
except Exception:
    disableDemoRoutes = False

for _, moduleName, _ in pkgutil.iter_modules(router.__path__, router.__name__ + "."):
    # 데모 TransactionRouter는 비활성화 시 제외
    if disableDemoRoutes and moduleName.endswith(".TransactionRouter"):
        continue
    module = importlib.import_module(moduleName)
    if hasattr(module, "router"):
        app.include_router(module.router)
logger.info("router load done")


@app.exception_handler(Exception)
async def globalExceptionHandler(request: Request, exc: Exception):
    """전역 예외를 JSON 응답으로 치환한다. (갱신: 2025-11-12)"""
    return JSONResponse(
        status_code=500,
        content=errorResponse(message=str(exc), result={"path": request.url.path}),
    )
