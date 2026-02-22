"""
파일명: backend/run.py
작성자: LSH
설명: 로컬 실행 엔트리. config.ini를 읽어 uvicorn을 기동한다.
"""

import os
import sys

import uvicorn

baseDir = os.path.dirname(__file__)
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)

from lib.Config import getConfig


def loadConfig():
    return getConfig()


if __name__ == "__main__":
    config = loadConfig()
    serverConfig = config["SERVER"]

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=serverConfig.getint("port", 2000),
        reload=True,
    )
