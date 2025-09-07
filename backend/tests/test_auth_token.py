import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_token_invalid_credentials_bearer_header():
    from server import app
    with TestClient(app) as client:
        r = client.post(
            "/api/v1/auth/token",
            json={"username": "no_such_user", "password": "nope-nope"},
        )
        # Depending on rate limiter state, first failures may be 401, later 429
        if r.status_code == 401:
            assert r.headers.get("WWW-Authenticate") == "Bearer"
            j = r.json()
            assert j["status"] is False and j["code"] == "AUTH_401_INVALID"
        else:
            assert r.status_code == 429
            assert r.headers.get("Retry-After")
            assert r.json()["code"] == "AUTH_429_RATE_LIMIT"
