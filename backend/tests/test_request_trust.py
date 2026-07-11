"""
파일명: backend/tests/test_request_trust.py
작성자: LSH
갱신일: 2026-07-11
설명: trusted proxy 경계와 forwarded header 검증 단위 테스트
"""

from starlette.requests import Request

from lib.RateLimit import resolveClientIp
from lib.RequestTrust import getTrustedForwardedIp, isTrustedProxyRequest
from router.AuthRouter import isSecureRequest


def makeRequest(*, clientIp: str, headers: list[tuple[bytes, bytes]] | None = None) -> Request:
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/",
            "headers": headers or [],
            "scheme": "http",
            "server": ("testserver", 80),
            "client": (clientIp, 12345),
        }
    )


def test_request_trust_flag_off_rejects_forwarded_ip(monkeypatch):
    monkeypatch.delenv("TRUST_PROXY_HEADERS", raising=False)
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"203.0.113.7")])

    assert isTrustedProxyRequest(request) is False
    assert getTrustedForwardedIp(request) is None


def test_request_trust_flag_on_rejects_untrusted_peer(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(clientIp="192.0.2.10", headers=[(b"x-forwarded-for", b"203.0.113.7")])

    assert isTrustedProxyRequest(request) is False
    assert getTrustedForwardedIp(request) is None


def test_request_trust_defaults_to_loopback_peer(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"203.0.113.7, 127.0.0.1")])

    assert isTrustedProxyRequest(request) is True
    assert getTrustedForwardedIp(request) == "203.0.113.7"


def test_request_trust_accepts_configured_cidr(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.setenv("TRUSTED_PROXY_CIDRS", "10.23.0.0/16")
    request = makeRequest(clientIp="10.23.4.5", headers=[(b"x-forwarded-for", b"2001:db8::1")])

    assert isTrustedProxyRequest(request) is True
    assert getTrustedForwardedIp(request) == "2001:db8::1"


def test_request_trust_malformed_cidr_does_not_broaden_trust(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.setenv("TRUSTED_PROXY_CIDRS", "not-a-cidr")
    request = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"203.0.113.7")])

    assert isTrustedProxyRequest(request) is False
    assert getTrustedForwardedIp(request) is None


def test_request_trust_rejects_malformed_forwarded_ip(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"not-an-ip, 203.0.113.7")])

    assert isTrustedProxyRequest(request) is True
    assert getTrustedForwardedIp(request) is None


def test_request_trust_malformed_forwarded_chain_rejects_valid_real_ip(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(
        clientIp="127.0.0.1",
        headers=[
            (b"x-forwarded-for", b"not-an-ip"),
            (b"x-real-ip", b"203.0.113.8"),
        ],
    )

    assert getTrustedForwardedIp(request) is None


def test_request_trust_ignores_client_prepended_spoof(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(
        clientIp="127.0.0.1",
        headers=[(b"x-forwarded-for", b"203.0.113.250, 198.51.100.24")],
    )

    assert getTrustedForwardedIp(request) == "198.51.100.24"


def test_request_trust_discards_multiple_trusted_proxy_hops(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.setenv("TRUSTED_PROXY_CIDRS", "10.0.0.0/8")
    request = makeRequest(
        clientIp="10.0.0.3",
        headers=[(b"x-forwarded-for", b"198.51.100.24, 10.0.0.1, 10.0.0.2")],
    )

    assert getTrustedForwardedIp(request) == "198.51.100.24"


def test_request_trust_accepts_overwritten_single_forwarded_ip(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"198.51.100.24")])

    assert getTrustedForwardedIp(request) == "198.51.100.24"


def test_request_trust_all_trusted_chain_uses_socket_peer(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(
        clientIp="127.0.0.1",
        headers=[(b"x-forwarded-for", b"127.0.0.2, 127.0.0.3")],
    )

    assert getTrustedForwardedIp(request) == "127.0.0.1"


def test_request_trust_uses_valid_real_ip_only_when_forwarded_for_absent(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    request = makeRequest(clientIp="127.0.0.1", headers=[(b"x-real-ip", b"198.51.100.24")])

    assert getTrustedForwardedIp(request) == "198.51.100.24"


def test_request_trust_rate_limit_uses_only_valid_trusted_forwarded_ip(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    trustedRequest = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"203.0.113.7")])
    malformedRequest = makeRequest(clientIp="127.0.0.1", headers=[(b"x-forwarded-for", b"invalid")])
    untrustedRequest = makeRequest(clientIp="192.0.2.10", headers=[(b"x-forwarded-for", b"203.0.113.7")])

    assert resolveClientIp(trustedRequest) == "203.0.113.7"
    assert resolveClientIp(malformedRequest) == "127.0.0.1"
    assert resolveClientIp(untrustedRequest) == "192.0.2.10"


def test_request_trust_secure_proto_requires_trusted_peer(monkeypatch):
    monkeypatch.setenv("TRUST_PROXY_HEADERS", "true")
    monkeypatch.delenv("TRUSTED_PROXY_CIDRS", raising=False)
    monkeypatch.delenv("ENV", raising=False)
    headers = [(b"x-forwarded-proto", b"https")]

    assert isSecureRequest(makeRequest(clientIp="127.0.0.1", headers=headers)) is True
    assert isSecureRequest(makeRequest(clientIp="192.0.2.10", headers=headers)) is False
