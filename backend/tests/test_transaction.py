import os
import sys
from fastapi.testclient import TestClient

baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def testTransactionSingleAndUniqueRollback():
    from server import app
    from lib import Database as DB

    with TestClient(app) as client:
        response = client.post("/api/v1/transaction/test/single")
        assert response.status_code == 200
        assert response.json()["status"] is True

        response = client.post("/api/v1/transaction/test/unique-violation")
        assert response.status_code == 409
        j = response.json()
        assert j["status"] is False
        assert j["code"] == "TX_409_UNIQUE"

        db = DB.dbManagers["main_db"]

        import anyio

        async def countRows():
            rows = await db.fetchAll(
                "SELECT COUNT(*) as cnt FROM test_transaction WHERE value = :v",
                {"v": "tx-dup"},
            )
            return rows[0]["cnt"] if rows else 0

        cnt = anyio.run(countRows)
        # unique violation rolled back the whole tx; no rows with 'tx-dup' should remain
        assert cnt == 0
