import os
import sys
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def _login_session(client: TestClient):
    # Ensure user exists via login
    r = client.post('/api/v1/auth/login', json={'username': 'demo', 'password': 'password123'})
    assert r.status_code == 204
    # issue csrf
    r = client.get('/api/v1/auth/csrf')
    assert r.status_code == 200
    return r.json()['result']['csrf']


def _bearer_token(client: TestClient):
    r = client.post('/api/v1/auth/token', json={'username': 'demo', 'password': 'password123'})
    assert r.status_code == 200
    return r.json()['result']['access_token']


def test_header_data_get_post_with_session_csrf():
    from server import app
    with TestClient(app) as client:
        csrf = _login_session(client)
        # POST without CSRF should 403
        r = client.post('/api/v1/header-data', json={'key': 'company', 'value': {'code': 'C1'}})
        assert r.status_code == 403
        # POST with CSRF
        r = client.post('/api/v1/header-data', headers={'X-CSRF-Token': csrf}, json={'key': 'company', 'value': {'code': 'C1', 'name': 'Co'}})
        assert r.status_code == 200
        # GET keys
        r = client.get('/api/v1/header-data?keys=company')
        assert r.status_code == 200
        j = r.json()
        assert j['status'] is True
        assert j['result']['company']['code'] == 'C1'
        assert r.headers.get('ETag')
        etag = r.headers['ETag']
        # If-None-Match should 304
        r2 = client.get('/api/v1/header-data?keys=company', headers={'If-None-Match': etag})
        assert r2.status_code == 304


def test_header_data_post_with_bearer_no_csrf():
    from server import app
    with TestClient(app) as client:
        token = _bearer_token(client)
        r = client.post('/api/v1/header-data', headers={'Authorization': f'Bearer {token}'}, json={'key': 'regBiz', 'value': {'code': 'R1'}})
        assert r.status_code == 200
        # fetch via bearer
        r = client.get('/api/v1/header-data?keys=regBiz', headers={'Authorization': f'Bearer {token}'})
        assert r.status_code == 200
        assert r.json()['result']['regBiz']['code'] == 'R1'


