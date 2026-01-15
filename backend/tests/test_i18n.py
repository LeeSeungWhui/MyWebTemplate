import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_i18n_invalid_credentials_ko():
    from server import app
    with TestClient(app) as client:
        r = client.post(
            "/api/v1/auth/login",
            json={"username": "demo@demo.demo", "password": "wrongpassword"},
            headers={"Accept-Language": "ko-KR"},
        )
        assert r.status_code == 401
        j = r.json()
        assert j["code"] == "AUTH_401_INVALID"
        # Korean message expected
        assert "아이디" in j["message"] or "비밀번호" in j["message"]


def test_i18n_invalid_input_en():
    from server import app
    with TestClient(app) as client:
        # invalid short username/password
        r = client.post(
            "/api/v1/auth/login",
            json={"username": "a", "password": "b"},
            headers={"Accept-Language": "en-US"},
        )
        assert r.status_code == 422
        j = r.json()
        assert j["code"] == "AUTH_422_INVALID_INPUT"
        assert j["message"] in ("invalid input", "잘못된 입력")  # fallback safety
