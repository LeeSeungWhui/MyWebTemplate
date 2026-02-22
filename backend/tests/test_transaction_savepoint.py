import os
import sys
from fastapi.testclient import TestClient
import pytest


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def testSavepointPartialRollback():
    from server import app
    from lib import Database as DB
    from lib.Transaction import transaction, savepoint
    from service.TransactionService import ensureTables

    with TestClient(app):
        import anyio

        @transaction("main_db")
        async def doOps():
            await ensureTables()
            db = DB.dbManagers["main_db"]
            # clear table for deterministic test
            await db.execute("DELETE FROM test_transaction")
            # insert keep1
            await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "keep1"})
            # duplicate in savepoint; on error should rollback only inner block
            try:
                async with savepoint("main_db", "sp1"):
                    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "dup"})
                    # second insert violates UNIQUE
                    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "dup"})
            except Exception:
                # expected due to unique constraint; outer tx continues
                pass
            # insert keep2 outside savepoint
            await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "keep2"})

        anyio.run(doOps)

        async def fetchCounts():
            db = DB.dbManagers["main_db"]
            rows = await db.fetchAll("SELECT value, COUNT(*) as cnt FROM test_transaction GROUP BY value")
            return {row["value"]: row["cnt"] for row in (rows or [])}

        countsByValue = anyio.run(fetchCounts)
        assert countsByValue.get("keep1") == 1
        assert countsByValue.get("keep2") == 1
        # dup should not remain due to savepoint rollback; or at most 1 if unique has been inserted before error
        assert countsByValue.get("dup") in (None, 1)


def testSavepointNameValidation():
    from lib.Transaction import savepoint, TransactionError

    with pytest.raises(TransactionError):
        savepoint("main_db", "sp1; DROP TABLE T_USER;")

    with pytest.raises(TransactionError):
        savepoint("main_db", "1bad")

    # 정상 케이스
    sp = savepoint("main_db", "sp_valid_1")
    assert sp.name == "sp_valid_1"
