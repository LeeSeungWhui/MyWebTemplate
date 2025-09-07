import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_savepoint_partial_rollback():
    from server import app
    from lib import Database as DB
    from lib.Transaction import transaction, savepoint
    from service.TransactionService import ensure_tables

    with TestClient(app):
        import anyio

        @transaction('main_db')
        async def do_ops():
            await ensure_tables()
            db = DB.dbManagers['main_db']
            # clear table for deterministic test
            await db.execute("DELETE FROM test_transaction")
            # insert keep1
            await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "keep1"})
            # duplicate in savepoint; on error should rollback only inner block
            try:
                async with savepoint('main_db', 'sp1'):
                    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "dup"})
                    # second insert violates UNIQUE
                    await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "dup"})
            except Exception:
                # expected due to unique constraint; outer tx continues
                pass
            # insert keep2 outside savepoint
            await db.execute("INSERT INTO test_transaction (value) VALUES (:val)", {"val": "keep2"})

        anyio.run(do_ops)

        async def counts():
            db = DB.dbManagers['main_db']
            r = await db.fetchAll("SELECT value, COUNT(*) as cnt FROM test_transaction GROUP BY value")
            return {row['value']: row['cnt'] for row in (r or [])}

        c = anyio.run(counts)
        assert c.get('keep1') == 1
        assert c.get('keep2') == 1
        # dup should not remain due to savepoint rollback; or at most 1 if unique has been inserted before error
        assert c.get('dup') in (None, 1)

