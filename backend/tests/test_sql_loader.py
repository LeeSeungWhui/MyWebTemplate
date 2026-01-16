import os
import tempfile
from pathlib import Path
import time


def writeSql(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def testSqlLoaderParsesNamedBlocks():
    from lib.SqlLoader import loadSqlQueries

    with tempfile.TemporaryDirectory() as tempDir:
        tmpPath = Path(tempDir)
        # nested dir
        (tmpPath / "sub").mkdir(parents=True)
        writeSql(
            tmpPath / "member.sql",
            """-- name: member.selectById
SELECT * FROM member WHERE id = :id;

-- name: member.insert
INSERT INTO member(id, name) VALUES(:id, :name);
""",
        )
        writeSql(
            tmpPath / "sub" / "other.sql",
            """-- name: other.ping
SELECT 1;
""",
        )

        queries = loadSqlQueries(str(tmpPath))
        assert "member.selectById" in queries
        assert "member.insert" in queries
        assert "other.ping" in queries
        assert ":id" in queries["member.selectById"]


def testSqlLoaderDuplicateNamesRaises():
    from lib.SqlLoader import loadSqlQueries

    with tempfile.TemporaryDirectory() as tempDir:
        tmpPath = Path(tempDir)
        writeSql(
            tmpPath / "a.sql",
            """-- name: dup.name
SELECT 1;
""",
        )
        writeSql(
            tmpPath / "b.sql",
            """-- name: dup.name
SELECT 2;
""",
        )
        raised = False
        try:
            loadSqlQueries(str(tmpPath))
        except Exception:
            raised = True
        assert raised, "duplicate keys should fail-fast"


def testBindParameterEnforcement():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("sqlite:///ignored.db")

    # missing bind should raise
    try:
        import pytest  # for raises context if available
    except Exception:
        pytest = None

    if pytest:
        with pytest.raises(ValueError):
            # query expects :id but value missing
            manager.validateBindParameters("SELECT * FROM t WHERE id = :id", {})
    else:
        # fallback without pytest
        raised = False
        try:
            manager.validateBindParameters("SELECT * FROM t WHERE id = :id", {})
        except ValueError:
            raised = True
        assert raised


def testBindParameterEnforcementMoreCases():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("sqlite:///ignored.db")

    # Extra/unused param provided
    raisedExtraParam = False
    try:
        manager.validateBindParameters("SELECT * FROM t WHERE id = :id", {"id": 1, "x": 2})
    except ValueError:
        raisedExtraParam = True
    assert raisedExtraParam

    # Values provided but no binds in SQL
    raisedNoBinds = False
    try:
        manager.validateBindParameters("SELECT 1", {"id": 1})
    except ValueError:
        raisedNoBinds = True
    assert raisedNoBinds

    # OK case
    manager.validateBindParameters("SELECT * FROM t WHERE a=:a AND b=:b", {"a": 1, "b": 2})


def testConfigTogglesDisablesWatchdog():
    from lib.Database import setQueryConfig, startWatchingQueryFolder

    with tempfile.TemporaryDirectory() as tempDir:
        setQueryConfig(tempDir, False, 50)
        observer = startWatchingQueryFolder()
        assert observer is None


def testHotReloadSuccess():
    from lib.Database import setQueryConfig, loadQueries, startWatchingQueryFolder, QueryManager

    with tempfile.TemporaryDirectory() as tempDir:
        tmpPath = Path(tempDir)
        setQueryConfig(tempDir, True, 50)
        loadQueries()  # initial empty
        observer = startWatchingQueryFolder()
        try:
            # create a new sql file -> should trigger reload
            writeSql(
                tmpPath / "hot.sql",
                """-- name: hot.select
SELECT 1;
""",
            )
            time.sleep(0.4)
            queries = QueryManager.getInstance().queries
            assert "hot.select" in queries
        finally:
            if observer:
                observer.stop()
                observer.join()


def testHotReloadFailureKeepsLastGoodVersion():
    from lib.Database import setQueryConfig, loadQueries, startWatchingQueryFolder, QueryManager

    with tempfile.TemporaryDirectory() as tempDir:
        tmpPath = Path(tempDir)
        # write an initial valid query
        queryFile = tmpPath / "q.sql"
        writeSql(
            queryFile,
            """-- name: ok.name
SELECT 1;
""",
        )

        setQueryConfig(tempDir, True, 50)
        loadQueries()
        observer = startWatchingQueryFolder()
        try:
            assert "ok.name" in QueryManager.getInstance().queries
            # now introduce a duplicate name in the same file to break parsing
            writeSql(
                queryFile,
                """-- name: ok.name
SELECT 1;
-- name: ok.name
SELECT 2;
""",
            )
            time.sleep(0.4)
            # Should keep last good version
            queries = QueryManager.getInstance().queries
            assert "ok.name" in queries
            # and not replaced/cleared
        finally:
            if observer:
                observer.stop()
                observer.join()
