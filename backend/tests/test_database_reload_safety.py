import threading
from pathlib import Path
from types import SimpleNamespace

import pytest

from lib import Database


def writeSql(path: Path, name: str, statement: str) -> None:
    path.write_text(f"-- name: {name}\n{statement}\n", encoding="utf-8")


class FakeTimer:
    instances: list["FakeTimer"] = []

    def __init__(self, interval: float, callback):
        self.interval = interval
        self.callback = callback
        self.daemon = False
        self.started = False
        self.cancelled = False
        self.instances.append(self)

    def start(self) -> None:
        self.started = True

    def cancel(self) -> None:
        self.cancelled = True

    def is_alive(self) -> bool:
        return self.started and not self.cancelled


@pytest.fixture
def reloadState(monkeypatch, tmp_path):
    FakeTimer.instances = []
    monkeypatch.setattr(Database.threading, "Timer", FakeTimer)
    monkeypatch.setattr(Database, "queryDir", str(tmp_path))
    monkeypatch.setattr(Database, "debounceTimer", None)
    monkeypatch.setattr(Database, "lastChangedFile", None)
    monkeypatch.setattr(Database.QueryManager, "instance", None)
    Database.pendingChangedFiles.clear()
    queryManager = Database.QueryManager.getInstance()
    yield queryManager
    Database.pendingChangedFiles.clear()


def loadCurrentQueries(queryManager) -> None:
    loaded = Database.scanSqlQueries(Database.queryDir)
    queryManager.setAll(*loaded)


def test_debounce_retains_multiple_changed_sql_paths_and_full_scans(
    reloadState, monkeypatch, tmp_path
):
    first = tmp_path / "first.sql"
    second = tmp_path / "second.sql"
    writeSql(first, "first.value", "SELECT 1;")
    writeSql(second, "second.value", "SELECT 2;")
    loadCurrentQueries(reloadState)

    realScan = Database.scanSqlQueries
    scannedFolders: list[str] = []

    def countedScan(folderPath: str):
        scannedFolders.append(folderPath)
        return realScan(folderPath)

    monkeypatch.setattr(Database, "scanSqlQueries", countedScan)
    writeSql(first, "first.value", "SELECT 10;")
    writeSql(second, "second.value", "SELECT 20;")

    Database.scheduleReload(str(first))
    Database.scheduleReload(str(second))

    assert Database.pendingChangedFiles == {str(first), str(second)}
    assert FakeTimer.instances[0].cancelled is True
    assert Database.doReload() is True
    assert scannedFolders == [str(tmp_path)]
    assert reloadState.queries["first.value"] == "SELECT 10;"
    assert reloadState.queries["second.value"] == "SELECT 20;"


def test_deletion_followed_by_another_change_removes_deleted_queries(
    reloadState, tmp_path
):
    deleted = tmp_path / "deleted.sql"
    remaining = tmp_path / "remaining.sql"
    writeSql(deleted, "deleted.value", "SELECT 1;")
    writeSql(remaining, "remaining.value", "SELECT 2;")
    loadCurrentQueries(reloadState)

    deleted.unlink()
    writeSql(remaining, "remaining.value", "SELECT 22;")
    Database.scheduleReload(str(deleted))
    Database.scheduleReload(str(remaining))

    assert Database.doReload() is True
    assert "deleted.value" not in reloadState.queries
    assert reloadState.queries["remaining.value"] == "SELECT 22;"
    assert str(deleted) not in reloadState.fileToNames


def test_failed_batch_requeues_all_paths_for_full_scan_recovery(
    reloadState, tmp_path
):
    first = tmp_path / "first.sql"
    second = tmp_path / "second.sql"
    writeSql(first, "first.value", "SELECT 1;")
    writeSql(second, "second.value", "SELECT 2;")
    loadCurrentQueries(reloadState)

    writeSql(first, "first.value", "SELECT 10;")
    second.write_text("-- name:\nSELECT broken;\n", encoding="utf-8")
    Database.scheduleReload(str(first))
    Database.scheduleReload(str(second))

    assert Database.doReload() is False
    assert reloadState.queries == {
        "first.value": "SELECT 1;",
        "second.value": "SELECT 2;",
    }
    assert Database.pendingChangedFiles == {str(first), str(second)}

    writeSql(second, "second.value", "SELECT 20;")
    Database.scheduleReload(str(second))

    assert Database.doReload() is True
    assert reloadState.queries == {
        "first.value": "SELECT 10;",
        "second.value": "SELECT 20;",
    }
    assert Database.pendingChangedFiles == set()


def test_ambiguous_change_after_sql_path_forces_full_scan(
    reloadState, monkeypatch, tmp_path
):
    queryFile = tmp_path / "query.sql"
    writeSql(queryFile, "query.value", "SELECT 1;")
    loadCurrentQueries(reloadState)
    realScan = Database.scanSqlQueries
    scannedFolders: list[str] = []

    def countedScan(folderPath: str):
        scannedFolders.append(folderPath)
        return realScan(folderPath)

    monkeypatch.setattr(Database, "scanSqlQueries", countedScan)
    writeSql(queryFile, "query.value", "SELECT 11;")
    Database.scheduleReload(str(queryFile))
    Database.scheduleReload(None)

    assert Database.doReload() is True
    assert scannedFolders == [str(tmp_path)]
    assert reloadState.queries["query.value"] == "SELECT 11;"


def test_concurrent_reload_publication_uses_latest_published_snapshot(
    reloadState, monkeypatch, tmp_path
):
    first = tmp_path / "first.sql"
    second = tmp_path / "second.sql"
    writeSql(first, "first.value", "SELECT 1;")
    writeSql(second, "second.value", "SELECT 2;")
    loadCurrentQueries(reloadState)
    writeSql(first, "first.value", "SELECT 10;")
    writeSql(second, "second.value", "SELECT 20;")

    firstParseEntered = threading.Event()
    releaseFirstParse = threading.Event()
    realParse = Database.parseSqlFile

    def blockingParse(filePath: str):
        if filePath == str(first):
            firstParseEntered.set()
            assert releaseFirstParse.wait(timeout=2)
        return realParse(filePath)

    class TrackedLock:
        def __init__(self):
            self.lock = threading.Lock()
            self.attemptGuard = threading.Lock()
            self.attempts = 0
            self.secondAttempted = threading.Event()

        def __enter__(self):
            with self.attemptGuard:
                self.attempts += 1
                if self.attempts == 2:
                    self.secondAttempted.set()
            self.lock.acquire()
            return self

        def __exit__(self, excType, excValue, traceback):
            self.lock.release()

    trackedLock = TrackedLock()
    monkeypatch.setattr(Database, "parseSqlFile", blockingParse)
    monkeypatch.setattr(Database, "reloadPublicationLock", trackedLock)
    results: list[bool] = []

    Database.scheduleReload(str(first))
    firstThread = threading.Thread(target=lambda: results.append(Database.doReload()))
    firstThread.start()
    assert firstParseEntered.wait(timeout=2)

    Database.scheduleReload(str(second))
    secondThread = threading.Thread(target=lambda: results.append(Database.doReload()))
    secondThread.start()
    assert trackedLock.secondAttempted.wait(timeout=2)
    releaseFirstParse.set()
    firstThread.join(timeout=2)
    secondThread.join(timeout=2)

    assert not firstThread.is_alive()
    assert not secondThread.is_alive()
    assert results == [True, True]
    assert reloadState.queries["first.value"] == "SELECT 10;"
    assert reloadState.queries["second.value"] == "SELECT 20;"


def test_moved_events_consider_sql_source_and_destination():
    changedPaths: list[str] = []
    handler = Database.QueryFolderEventHandler(changedPaths.append)

    handler.on_moved(
        SimpleNamespace(
            is_directory=False,
            src_path="/queries/upload.tmp",
            dest_path="/queries/created.sql",
        )
    )
    handler.on_moved(
        SimpleNamespace(
            is_directory=False,
            src_path="/queries/deleted.sql",
            dest_path="/queries/deleted.bak",
        )
    )

    assert changedPaths == ["/queries/created.sql", "/queries/deleted.sql"]


def test_failed_partial_reload_keeps_last_good_queries(reloadState, tmp_path):
    queryFile = tmp_path / "query.sql"
    writeSql(queryFile, "query.value", "SELECT 1;")
    loadCurrentQueries(reloadState)
    queryFile.write_text("-- name:\nSELECT broken;\n", encoding="utf-8")
    Database.scheduleReload(str(queryFile))

    assert Database.doReload() is False
    assert reloadState.queries == {"query.value": "SELECT 1;"}
    assert reloadState.nameToFile == {"query.value": str(queryFile)}
    assert reloadState.fileToNames == {str(queryFile): {"query.value"}}
