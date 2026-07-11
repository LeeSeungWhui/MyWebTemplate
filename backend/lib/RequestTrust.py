"""
파일명: backend/lib/RequestTrust.py
작성자: LSH
갱신일: 2026-06-05
설명: 프록시 신뢰 헤더 관련 공용 판정 helper
"""

import ipaddress
import os

from fastapi import Request


DEFAULT_TRUSTED_PROXY_CIDRS = ("127.0.0.0/8", "::1/128")


def trustProxyHeaders() -> bool:
    """
    설명: TRUST_PROXY_HEADERS 환경변수가 true-like인지 판별
    반환값: 1/true/yes 값이면 True, 그 외는 False
    갱신일: 2026-06-05
    """
    return os.getenv("TRUST_PROXY_HEADERS", "false").lower() in ("1", "true", "yes")


def _trustedProxyNetworks() -> tuple[ipaddress.IPv4Network | ipaddress.IPv6Network, ...]:
    """
    설명: TRUSTED_PROXY_CIDRS를 신뢰 가능한 IP 네트워크 목록으로 파싱
    처리 규칙: 미설정 시 loopback만 기본 신뢰하고, 잘못된 CIDR 항목은 무시
    갱신일: 2026-07-11
    """
    configuredCidrs = os.getenv("TRUSTED_PROXY_CIDRS")
    cidrValues = DEFAULT_TRUSTED_PROXY_CIDRS if not configuredCidrs else configuredCidrs.split(",")
    networks: list[ipaddress.IPv4Network | ipaddress.IPv6Network] = []
    for cidrValue in cidrValues:
        candidate = str(cidrValue).strip()
        if not candidate:
            continue
        try:
            networks.append(ipaddress.ip_network(candidate, strict=False))
        except ValueError:
            continue
    return tuple(networks)


def isTrustedProxyRequest(request: Request) -> bool:
    """
    설명: 프록시 헤더 opt-in과 실제 연결 peer CIDR 신뢰를 함께 판정
    반환값: TRUST_PROXY_HEADERS 활성화 및 peer IP가 TRUSTED_PROXY_CIDRS에 속하면 True
    갱신일: 2026-07-11
    """
    if not trustProxyHeaders():
        return False
    try:
        clientHost = getattr(request.client, "host", None) if request.client else None
        peerIp = ipaddress.ip_address(str(clientHost).strip())
    except (TypeError, ValueError):
        return False
    return any(peerIp.version == network.version and peerIp in network for network in _trustedProxyNetworks())


def getTrustedForwardedIp(request: Request) -> str | None:
    """
    설명: 신뢰 프록시 체인의 오른쪽부터 trusted hop을 제거해 실제 클라이언트 IP를 반환
    처리 규칙: XFF가 있으면 전체 체인을 검증하며, 모두 trusted이면 socket peer를 안전한 고정 결과로 사용
    처리 규칙: X-Real-IP는 XFF가 아예 없을 때만 단일 유효 IP로 허용
    반환값: 검증된 클라이언트 IP 정규화 문자열, 그 외 None
    갱신일: 2026-07-11
    """
    trustedProxy = isTrustedProxyRequest(request)
    if not trustedProxy:
        return None
    try:
        peerIp = ipaddress.ip_address(str(request.client.host).strip())
        forwardedFor = request.headers.get("X-Forwarded-For")
    except Exception:
        return None

    if forwardedFor is not None:
        if not isinstance(forwardedFor, str):
            return None
        forwardedParts = forwardedFor.split(",")
        if not forwardedParts or any(not part.strip() for part in forwardedParts):
            return None
        forwardedChain: list[ipaddress.IPv4Address | ipaddress.IPv6Address] = []
        try:
            forwardedChain = [ipaddress.ip_address(part.strip()) for part in forwardedParts]
        except ValueError:
            return None

        trustedNetworks = _trustedProxyNetworks()
        for hopIp in reversed([*forwardedChain, peerIp]):
            isTrustedHop = any(
                hopIp.version == network.version and hopIp in network
                for network in trustedNetworks
            )
            if not isTrustedHop:
                return str(hopIp)
        return str(peerIp)

    try:
        realIp = request.headers.get("X-Real-IP")
    except Exception:
        return None
    if not isinstance(realIp, str) or not realIp.strip():
        return None
    try:
        return str(ipaddress.ip_address(realIp.strip()))
    except ValueError:
        return None
