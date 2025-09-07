import os
import sys
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_transaction_single_and_unique_rollback():
    from server import app
    from lib import Database as DB

    with TestClient(app) as client:
        r = client.post("/api/v1/transaction/test/single")
        assert r.status_code == 200
        assert r.json()["status"] is True

        r = client.post("/api/v1/transaction/test/unique-violation")
        assert r.status_code == 200
        j = r.json()
        assert j["status"] is False
        assert j["code"] == "TX_409_UNIQUE"

        db = DB.dbManagers["main_db"]

        import anyio

        async def _count():
            r = await db.fetchAll(
                "SELECT COUNT(*) as cnt FROM test_transaction WHERE value = :v",
                {"v": "tx-dup"},
            )
            return r[0]["cnt"] if r else 0

        cnt = anyio.run(_count)
        # unique violation rolled back the whole tx; no rows with 'tx-dup' should remain
        assert cnt == 0
