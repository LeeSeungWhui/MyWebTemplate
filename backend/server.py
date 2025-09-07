"""
?뚯씪紐? backend/server.py
?묒꽦?? Codex CLI
媛깆떊?? 2025-09-07
?ㅻ챸: FastAPI ??援ъ꽦. DB/?쇱슦??珥덇린?? CORS/?몄뀡/濡쒓퉭/?덉쇅 泥섎━ ?ㅼ젙.
"""

import importlib
import os
import pkgutil
from configparser import ConfigParser

try:
    from . import router as router  # when imported as package
except Exception:  # pragma: no cover
    import router  # when running from backend/ working dir
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.utils import get_openapi
from starlette.middleware.sessions import SessionMiddleware
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

# FastAPI ???몄뒪?댁뒪 ?앹꽦
app = FastAPI()

# =========================================================
# 湲곕낯 ?ㅼ젙 諛??좏떥由ы떚 ?⑥닔
# =========================================================


def loadConfig(filename: str) -> ConfigParser:
    """
    ?ㅻ챸: ?ㅼ젙 ?뚯씪??紐⑤뱢 湲곗? 寃쎈줈濡??쎌뼱 援ъ꽦 諛섑솚.
    媛깆떊?? 2025-09-07
    """
    logger.info("?ㅼ젙?뚯씪 濡쒕뱶 以?..")
    config = ConfigParser()
    # resolve relative to this file's directory to be robust in tests
    base_dir = os.path.dirname(__file__)
    cfg_path = filename
    if not os.path.isabs(filename):
        cfg_path = os.path.join(base_dir, filename)
    with open(cfg_path, "r", encoding="utf-8") as f:
        config.read_file(f)
    logger.info("?ㅼ젙?뚯씪 濡쒕뱶 ?꾨즺")
    return config


async def onShutdown():
    """?쒕쾭 醫낅즺 ???ㅽ뻾?섎뒗 ?뺣━ ?묒뾽"""
    for manager in DB.dbManagers.values():
        if hasattr(manager, "disconnect"):
            await manager.disconnect()
    if sqlObserver:
        sqlObserver.stop()
        sqlObserver.join()


# =========================================================
# 而ㅼ뒪?곕쭏?댁쭠 媛?ν븳 ?곸뿭
# =========================================================


async def onStartup():
    """
    ?쒕쾭 ?쒖옉 ???ㅽ뻾?섎뒗 珥덇린???묒뾽
    ?곗씠?곕쿋?댁뒪 ?곌껐 諛?珥덇린 ?ㅼ젙??而ㅼ뒪?곕쭏?댁쭠?섏꽭??
    """
    logger.info("Database ?곌껐 以?..")
    global sqlObserver

    # DATABASE濡??쒖옉?섎뒗 紐⑤뱺 ?뱀뀡 李얘린
    dbSections = [s for s in config.sections() if s.startswith("DATABASE")]

    for section in dbSections:
        dbConfig = config[section]
        dbName = dbConfig.get("name", section.lower())
        dbType = dbConfig.get("type")

        # If tests or external code pre-populated a manager, honor it
        if dbName in DB.dbManagers:
            # skip full init for this db; assume external manager controls lifecycle
            continue

        if dbType == "sqlite":
            dbPath = dbConfig.get("database")
            # ensure absolute path and parent directory exists for sqlite file
            base_dir = os.path.dirname(__file__)
            if not os.path.isabs(dbPath):
                dbPath = os.path.join(base_dir, dbPath)
            os.makedirs(os.path.dirname(dbPath), exist_ok=True)
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
            logger.warning(f"吏?먰븯吏 ?딅뒗 ?곗씠?곕쿋?댁뒪 ??낆엯?덈떎: {dbType}")
            continue

        try:
            # respect pre-populated managers (e.g., tests monkeypatch)
            if dbName not in DB.dbManagers or not getattr(DB.dbManagers[dbName], "databaseUrl", None):
                DB.dbManagers[dbName] = DatabaseManager(dbUrl)
            # connect only if object supports it
            if hasattr(DB.dbManagers[dbName], "connect"):
                await DB.dbManagers[dbName].connect()
            logger.info(f"?곗씠?곕쿋?댁뒪 ?곌껐 ?깃났: {dbName}")

        except Exception as e:
            logger.error(f"?곗씠?곕쿋?댁뒪 ?곌껐 ?ㅽ뙣 ({dbName}): {str(e)}")

    logger.info("Database ?곌껐 ?꾨즺")
    logger.info("荑쇰━ 濡쒕뱶 以?..")
    # Configure query loader from [DATABASE]
    try:
        dbGlobal = config["DATABASE"]
    except Exception:
        dbGlobal = None

    base_dir = os.path.dirname(__file__)
    repo_root = os.path.dirname(base_dir)
    qdir_raw = (dbGlobal.get("query_dir") if dbGlobal else None) or "query"
    if not os.path.isabs(qdir_raw):
        norm = qdir_raw.replace("\\", "/")
        if norm.startswith("backend/"):
            qdir_abs = os.path.join(repo_root, qdir_raw)
        else:
            qdir_abs = os.path.join(base_dir, qdir_raw)
    else:
        qdir_abs = qdir_raw

    qwatch = True
    try:
        qwatch = dbGlobal.getboolean("query_watch", True) if dbGlobal else True
    except Exception:
        pass

    try:
        qdebounce = dbGlobal.getint("query_watch_debounce_ms", 150) if dbGlobal else 150
    except Exception:
        qdebounce = 150

    setQueryConfig(qdir_abs, qwatch, qdebounce)

    loadQueries()
    logger.info("荑쇰━ 濡쒕뱶 ?꾨즺")
    sqlObserver = startWatchingQueryFolder()
    if sqlObserver:
        logger.info("荑쇰━ 媛먯떆 ?쒖옉")

    # ?ㅼ젙 ?뚯씪 濡쒕뱶 ??
    authConfig = config["AUTH"]
    AuthConfig.initConfig(
        secretKey=authConfig["secret_key"],
        expireMinutes=authConfig.getint("token_expire", 3600) // 60,
        tokenEnable=authConfig.getboolean("token_enable", True),
    )

    # Ensure auth tables and demo account exist for local/dev
    try:
        if "main_db" in DB.dbManagers:
            db = DB.dbManagers["main_db"]
            # only run init when manager exposes required methods
            if hasattr(db, "execute") and hasattr(db, "fetchOne"):
                await db.execute(
                    """
                    CREATE TABLE IF NOT EXISTS member (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      username TEXT UNIQUE NOT NULL,
                      password_hash TEXT NOT NULL,
                      name TEXT
                    )
                    """
                )
                row = await db.fetchOne(
                    "SELECT username FROM member WHERE username = :u", {"u": "demo"}
                )
                if not row:
                    import bcrypt

                    hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
                    await db.execute(
                        "INSERT INTO member (username, password_hash, name) VALUES (:u,:p,:n)",
                        {"u": "demo", "p": hashed, "n": "Demo User"},
                    )
    except Exception as e:
        logger.error(f"auth table init failed: {e}")
    # ensure OpenAPI customization is attached (idempotent)
    try:
        attachOpenAPI(app, config)
    except Exception:
        pass


# =========================================================
# ?쒕쾭 ?ㅼ젙 諛??쒖옉
# =========================================================

# ?ㅼ젙 ?뚯씪 濡쒕뱶
config = loadConfig("config.ini")

# CORS ?ㅼ젙
origins_raw = config["CORS"].get("allow_origins", "").strip()
if origins_raw == "*":
    # Enforce allowlist default per common rules; use DEV_WEB_ORIGIN when wildcard found
    origins = [os.getenv("DEV_WEB_ORIGIN", "http://localhost:3000")]
else:
    origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ?대깽???몃뱾???깅줉
app.add_event_handler("startup", onStartup)
app.add_event_handler("shutdown", onShutdown)

# request logging + request id propagation
app.add_middleware(RequestLogMiddleware)

# Session (cookie-based) for Web
app.add_middleware(
    SessionMiddleware,
    secret_key=config["AUTH"]["secret_key"],
    session_cookie=config["AUTH"].get("session_cookie", "sid"),
    same_site="lax",
    https_only=os.getenv("ENV", "dev").lower() == "prod",
    max_age=config["AUTH"].getint("token_expire", 3600),
)

# ?쇱슦??濡쒕뱶
logger.info("?쇱슦??濡쒕뱶 以?..")
for _, moduleName, _ in pkgutil.iter_modules(router.__path__, router.__name__ + "."):
    module = importlib.import_module(moduleName)
    if hasattr(module, "router"):
        app.include_router(module.router)
logger.info("?쇱슦??濡쒕뱶 ?꾨즺")


@app.exception_handler(Exception)
async def globalExceptionHandler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=errorResponse(message=str(exc), result={"path": request.url.path}),
    )


