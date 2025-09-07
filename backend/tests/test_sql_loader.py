import os
import tempfile
from pathlib import Path
import time


def write_sql(path: Path, content: str):
    path.write_text(content, encoding="utf-8")


def test_sql_loader_parses_named_blocks():
    from lib.SqlLoader import loadSqlQueries

    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        # nested dir
        (d / "sub").mkdir(parents=True)
        write_sql(
            d / "member.sql",
            """-- name: member.selectById
SELECT * FROM member WHERE id = :id;

-- name: member.insert
INSERT INTO member(id, name) VALUES(:id, :name);
""",
        )
        write_sql(
            d / "sub" / "other.sql",
            """-- name: other.ping
SELECT 1;
""",
        )

        q = loadSqlQueries(str(d))
        assert "member.selectById" in q
        assert "member.insert" in q
        assert "other.ping" in q
        assert ":id" in q["member.selectById"]


def test_sql_loader_duplicate_names_raises():
    from lib.SqlLoader import loadSqlQueries

    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        write_sql(
            d / "a.sql",
            """-- name: dup.name
SELECT 1;
""",
        )
        write_sql(
            d / "b.sql",
            """-- name: dup.name
SELECT 2;
""",
        )
        raised = False
        try:
            loadSqlQueries(str(d))
        except Exception:
            raised = True
        assert raised, "duplicate keys should fail-fast"


def test_bind_parameter_enforcement():
    from lib.Database import DatabaseManager

    mgr = DatabaseManager("sqlite:///ignored.db")

    # missing bind should raise
    try:
        import pytest  # for raises context if available
    except Exception:
        pytest = None

    if pytest:
        import pytest as _pytest

        with _pytest.raises(ValueError):
            # query expects :id but value missing
            mgr._validate_bind_parameters("SELECT * FROM t WHERE id = :id", {})
    else:
        # fallback without pytest
        raised = False
        try:
            mgr._validate_bind_parameters("SELECT * FROM t WHERE id = :id", {})
        except ValueError:
            raised = True
        assert raised


def test_bind_parameter_enforcement_more_cases():
    from lib.Database import DatabaseManager

    mgr = DatabaseManager("sqlite:///ignored.db")

    # Extra/unused param provided
    raised = False
    try:
        mgr._validate_bind_parameters("SELECT * FROM t WHERE id = :id", {"id": 1, "x": 2})
    except ValueError:
        raised = True
    assert raised

    # Values provided but no binds in SQL
    raised2 = False
    try:
        mgr._validate_bind_parameters("SELECT 1", {"id": 1})
    except ValueError:
        raised2 = True
    assert raised2

    # OK case
    mgr._validate_bind_parameters("SELECT * FROM t WHERE a=:a AND b=:b", {"a": 1, "b": 2})


def test_config_toggles_disables_watchdog():
    from lib.Database import setQueryConfig, startWatchingQueryFolder

    with tempfile.TemporaryDirectory() as td:
        setQueryConfig(td, False, 50)
        obs = startWatchingQueryFolder()
        assert obs is None


def test_hot_reload_success():
    from lib.Database import setQueryConfig, loadQueries, startWatchingQueryFolder, QueryManager

    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        setQueryConfig(td, True, 50)
        loadQueries()  # initial empty
        obs = startWatchingQueryFolder()
        try:
            # create a new sql file -> should trigger reload
            write_sql(
                d / "hot.sql",
                """-- name: hot.select
SELECT 1;
""",
            )
            time.sleep(0.4)
            q = QueryManager.getInstance().queries
            assert "hot.select" in q
        finally:
            if obs:
                obs.stop(); obs.join()


def test_hot_reload_failure_keeps_last_good_version():
    from lib.Database import setQueryConfig, loadQueries, startWatchingQueryFolder, QueryManager

    with tempfile.TemporaryDirectory() as td:
        d = Path(td)
        # write an initial valid query
        p = d / "q.sql"
        write_sql(
            p,
            """-- name: ok.name
SELECT 1;
""",
        )

        setQueryConfig(td, True, 50)
        loadQueries()
        obs = startWatchingQueryFolder()
        try:
            assert "ok.name" in QueryManager.getInstance().queries
            # now introduce a duplicate name in the same file to break parsing
            write_sql(
                p,
                """-- name: ok.name
SELECT 1;
-- name: ok.name
SELECT 2;
""",
            )
            time.sleep(0.4)
            # Should keep last good version
            q = QueryManager.getInstance().queries
            assert "ok.name" in q
            # and not replaced/cleared
        finally:
            if obs:
                obs.stop(); obs.join()
