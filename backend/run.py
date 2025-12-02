"""
파일명: backend/run.py
작성자: LSH
설명: 로컬 실행 엔트리. config.ini를 읽어 uvicorn을 기동한다.
"""

from configparser import ConfigParser

import uvicorn


def load_config():
    config = ConfigParser()
    with open("config.ini", "r", encoding="utf-8") as config_file:
        config.read_file(config_file)
    return config


if __name__ == "__main__":
    config = load_config()
    server_config = config["SERVER"]

    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=server_config.getint("port", 8000),
        reload=True,
    )
