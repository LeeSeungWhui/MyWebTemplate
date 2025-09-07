import os
import sys
from fastapi.testclient import TestClient


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def test_login_requires_csrf_when_enabled(monkeypatch):
    from server import app
    # enable login CSRF at runtime
    from backend import server as server_mod  # type: ignore
    server_mod.config['AUTH']['login_require_csrf'] = 'true'

    with TestClient(app) as client:
        # without CSRF should 403
        r = client.post('/api/v1/auth/login', json={'username': 'demo', 'password': 'password123'})
        assert r.status_code == 403
        # issue csrf and then login ok
        csrf = client.get('/api/v1/auth/csrf').json()['result']['csrf']
        r2 = client.post('/api/v1/auth/login', headers={'X-CSRF-Token': csrf}, json={'username': 'demo', 'password': 'password123'})
        assert r2.status_code == 204

