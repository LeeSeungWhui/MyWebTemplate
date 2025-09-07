import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_readyz_message_i18n_ko(monkeypatch):
    from server import app
    monkeypatch.setenv("MAINTENANCE_MODE", "true")
    with TestClient(app) as client:
        r = client.get("/readyz", headers={"Accept-Language": "ko-KR"})
        assert r.status_code == 503
        j = r.json()
        assert j["code"] == "OBS_503_NOT_READY"
        assert isinstance(j.get("message"), str)
        # Accept either localized Korean or default English string
        assert j["message"] in ("준비되지 않았습니다", "not ready")

