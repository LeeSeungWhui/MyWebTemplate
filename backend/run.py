"""
파일명: backend/run.py
작성자: LSH
설명: 로컬 실행 엔트리. config.ini를 읽어 uvicorn을 기동한다.
"""

from configparser import ConfigParser

import uvicorn


def loadConfig():
    config = ConfigParser()
    with open("config.ini", "r", encoding="utf-8") as configFile:
        config.read_file(configFile)
    return config


if __name__ == "__main__":
    config = loadConfig()
    serverConfig = config["SERVER"]

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=serverConfig.getint("port", 8000),
        reload=True,
    )
