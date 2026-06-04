import asyncio
import os
import tempfile
from pathlib import Path
import time

import pytest


def writeSql(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def testSqlLoaderParsesNamedBlocks():
    from lib.SqlLoader import loadSqlQueries

    with tempfile.TemporaryDirectory() as tempDir:
        tmpPath = Path(tempDir)
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

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")

    try:
        import pytest  # raises 컨텍스트 사용 가능 시 활용
    except Exception:
        pytest = None

    if pytest:
        with pytest.raises(ValueError):
            manager.validateBindParameters("SELECT * FROM t WHERE id = :id", {})
    else:
        raised = False
        try:
            manager.validateBindParameters("SELECT * FROM t WHERE id = :id", {})
        except ValueError:
            raised = True
        assert raised


def testBindParameterEnforcementMoreCases():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")

    raisedExtraParam = False
    try:
        manager.validateBindParameters("SELECT * FROM t WHERE id = :id", {"id": 1, "x": 2})
    except ValueError:
        raisedExtraParam = True
    assert raisedExtraParam

    raisedNoBinds = False
    try:
        manager.validateBindParameters("SELECT 1", {"id": 1})
    except ValueError:
        raisedNoBinds = True
    assert raisedNoBinds

    manager.validateBindParameters("SELECT * FROM t WHERE a=:a AND b=:b", {"a": 1, "b": 2})


def testInlineLiteralPredicateRequiresBindsForRawSql():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")

    with pytest.raises(ValueError):
        manager.validateBindParameters(
            "SELECT * FROM T_USER WHERE USER_ID = 'demo@demo.demo'",
            None,
        )

    with pytest.raises(ValueError):
        manager.validateBindParameters(
            "SELECT * FROM T_USER WHERE USER_NO IN (1, 2, 3)",
            None,
        )


def testInlineLiteralGuardRejectsDirectNamedStaticSqlAndDoesNotExecute():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")
    query = "SELECT * FROM T_USER WHERE USER_ID = 'demo@demo.demo'"

    with pytest.raises(ValueError):
        manager.validateBindParameters(
            query,
            None,
            queryName="user.demoLookup",
        )

    calls: list[str] = []

    async def unexpectedExecute(**kwargs):
        calls.append(f"execute:{kwargs['query']}")
        raise AssertionError("database.execute should not be called")

    async def unexpectedFetchOne(**kwargs):
        calls.append(f"fetchOne:{kwargs['query']}")
        raise AssertionError("database.fetch_one should not be called")

    async def unexpectedFetchAll(**kwargs):
        calls.append(f"fetchAll:{kwargs['query']}")
        raise AssertionError("database.fetch_all should not be called")

    manager.database.execute = unexpectedExecute
    manager.database.fetch_one = unexpectedFetchOne
    manager.database.fetch_all = unexpectedFetchAll

    async def runDirectCalls():
        with pytest.raises(ValueError):
            await manager.execute(query, None, queryName="user.demoLookup")
        with pytest.raises(ValueError):
            await manager.fetchOne(query, None, queryName="user.demoLookup")
        with pytest.raises(ValueError):
            await manager.fetchAll(query, None, queryName="user.demoLookup")

    asyncio.run(runDirectCalls())
    assert calls == []


def testInlineLiteralGuardAllowsSafeRawStatements():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")

    safeQueries = [
        "SELECT 1",
        "CREATE TABLE IF NOT EXISTS T_TEMP (ID INTEGER PRIMARY KEY)",
        "PRAGMA journal_mode=WAL",
        "SAVEPOINT unit_sp",
        "ROLLBACK TO SAVEPOINT unit_sp",
        "RELEASE SAVEPOINT unit_sp",
        "DELETE FROM T_USER",
        "SELECT ROLE_CD, COUNT(*) FROM T_USER GROUP BY ROLE_CD",
    ]

    for query in safeQueries:
        manager.validateBindParameters(query, None)


def testInlineLiteralGuardAllowsRegistrySourcedStaticSql():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")
    query = "SELECT * FROM T_USER WHERE USER_ID = 'demo@demo.demo'"
    manager.queryManager.setAll({"user.demoLookup": query}, {}, {})

    calls: list[tuple[str, str, dict[str, object]]] = []

    async def fakeExecute(*, query: str, values: dict[str, object]):
        calls.append(("execute", query, values))
        return 1

    manager.database.execute = fakeExecute

    result = asyncio.run(manager.executeQuery("user.demoLookup"))

    assert result == 1
    assert calls == [("execute", query, {})]


def testSqlRenderedLiteralMasksSensitiveParams():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")
    fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vQGRlbW8uZGVtbyJ9.sig1234567890123456789012"
    rendered = manager.renderQueryForLog(
        "SELECT :password AS pw, :email AS eml, :title AS ttl, :refreshToken AS rt",
        {
            "password": "SuperSecret!234",
            "email": "demo@demo.demo",
            "title": "hello world",
            "refreshToken": fakeJwt,
        },
        True,
    )
    assert "SuperSecret!234" not in rendered
    assert "demo@demo.demo" not in rendered
    assert fakeJwt not in rendered
    assert "'hello world'" in rendered
    assert rendered.count("'***'") >= 3


def testSqlRenderedLiteralMasksSensitiveNestedPayload():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")
    rendered = manager.renderQueryForLog(
        "SELECT :payload AS payload",
        {
            "payload": {
                "contactEmail": "owner@example.com",
                "password": "nested-secret",
                "memo": "visible",
            }
        },
        True,
    )
    assert "owner@example.com" not in rendered
    assert "nested-secret" not in rendered
    assert "visible" in rendered
    assert "***" in rendered


def testSqlRenderedLiteralMasksSensitiveNestedListValues():
    from lib.Database import DatabaseManager

    manager = DatabaseManager("postgresql://ignored:ignored@127.0.0.1:5432/ignored")
    fakeJwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJvd25lckBleGFtcGxlLmNvbSJ9.sig1234567890123456789012"
    rendered = manager.renderQueryForLog(
        "SELECT :payload AS payload",
        {
            "payload": ["owner@example.com", "visible-text", fakeJwt]
        },
        True,
    )
    assert "owner@example.com" not in rendered
    assert fakeJwt not in rendered
    assert "visible-text" in rendered
    assert "***" in rendered


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
        loadQueries()  # 초기 빈 상태 로딩
        observer = startWatchingQueryFolder()
        try:
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
            writeSql(
                queryFile,
                """-- name: ok.name
SELECT 1;
-- name: ok.name
SELECT 2;
""",
            )
            time.sleep(0.4)
            queries = QueryManager.getInstance().queries
            assert "ok.name" in queries
        finally:
            if observer:
                observer.stop()
                observer.join()
