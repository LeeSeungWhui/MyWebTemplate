from concurrent.futures import ThreadPoolExecutor
from threading import Event, Lock

import pytest

from lib import Config


@pytest.fixture(autouse=True)
def isolatedConfigCache(monkeypatch):
    monkeypatch.setattr(Config, "configCache", None)
    monkeypatch.setattr(Config, "configCachePath", None)


def writeConfig(path, value):
    path.write_text(f"[TEST]\nvalue = {value}\n", encoding="utf-8")


def testLoadConfigPreservesLiteralPercentCharacters(tmp_path):
    configPath = tmp_path / "percent.ini"
    writeConfig(configPath, "secret%value%(name)s")

    config = Config.loadConfig(str(configPath))

    assert config["TEST"]["value"] == "secret%value%(name)s"


def testSamePathConcurrentAccessPublishesOneSnapshot(tmp_path, monkeypatch):
    configPath = tmp_path / "same.ini"
    writeConfig(configPath, "same")
    originalLoadConfig = Config.loadConfig
    loadEntered = Event()
    releaseLoad = Event()
    countLock = Lock()
    loadCount = 0

    def delayedLoadConfig(filename):
        nonlocal loadCount
        with countLock:
            loadCount += 1
        loadEntered.set()
        assert releaseLoad.wait(timeout=5)
        return originalLoadConfig(filename)

    monkeypatch.setattr(Config, "loadConfig", delayedLoadConfig)
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(Config.getConfig, str(configPath)) for _ in range(8)]
        assert loadEntered.wait(timeout=5)
        releaseLoad.set()
        results = [future.result(timeout=5) for future in futures]

    assert loadCount == 1
    assert all(config is results[0] for config in results)
    assert results[0]["TEST"]["value"] == "same"


def testRuntimeReloadAndPathChangesAreRejectedWithoutMutation(tmp_path):
    firstPath = tmp_path / "first.ini"
    secondPath = tmp_path / "second.ini"
    writeConfig(firstPath, "first")
    writeConfig(secondPath, "second")
    firstConfig = Config.getConfig(str(firstPath))

    with pytest.raises(RuntimeError, match="restart the process"):
        Config.getConfig(str(secondPath))
    with pytest.raises(RuntimeError, match="restart the process"):
        Config.getConfig(str(firstPath), forceReload=True)
    with pytest.raises(RuntimeError, match="restart the process"):
        Config.reloadConfig()

    assert Config.configCache is firstConfig
    assert Config.configCachePath == Config.resolvePath(str(firstPath))
    assert Config.getConfig(str(firstPath))["TEST"]["value"] == "first"


def testConcurrentDifferentPathNeverReturnsWrongConfiguration(tmp_path, monkeypatch):
    firstPath = tmp_path / "first.ini"
    secondPath = tmp_path / "second.ini"
    writeConfig(firstPath, "first")
    writeConfig(secondPath, "second")
    originalLoadConfig = Config.loadConfig
    firstLoadEntered = Event()
    releaseFirstLoad = Event()

    def delayedLoadConfig(filename):
        if Config.resolvePath(filename) == Config.resolvePath(str(firstPath)):
            firstLoadEntered.set()
            assert releaseFirstLoad.wait(timeout=5)
        return originalLoadConfig(filename)

    monkeypatch.setattr(Config, "loadConfig", delayedLoadConfig)
    with ThreadPoolExecutor(max_workers=2) as executor:
        firstFuture = executor.submit(Config.getConfig, str(firstPath))
        assert firstLoadEntered.wait(timeout=5)
        secondFuture = executor.submit(Config.getConfig, str(secondPath))
        releaseFirstLoad.set()
        firstConfig = firstFuture.result(timeout=5)
        with pytest.raises(RuntimeError, match="restart the process"):
            secondFuture.result(timeout=5)

    assert firstConfig["TEST"]["value"] == "first"
    assert Config.configCache is firstConfig
    assert Config.configCachePath == Config.resolvePath(str(firstPath))
