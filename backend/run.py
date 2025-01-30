from configparser import ConfigParser

import uvicorn


def loadConfig():
    config = ConfigParser()
    with open("config.ini", "r", encoding="utf-8") as f:
        config.read_file(f)
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
