import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_tx_logs_include_request_id_and_sql_count(caplog):
    from server import app

    with TestClient(app) as client:
        caplog.clear()
        rid = 'rid-tx-1234'
        r = client.post('/api/v1/transaction/test/single', headers={'X-Request-Id': rid})
        assert r.status_code == 200
        # find tx.commit log with our requestId and sql_count field
        seen = False
        for rec in caplog.records:
            msg = rec.message
            if 'tx.commit' in msg and 'sql_count=' in msg and ('requestId='+rid) in msg:
                seen = True
                break
        assert seen

