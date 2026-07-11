import asyncio
import configparser
import json

import pytest

from lib import UserAccessLog as userAccessLog


def buildConfig(**sections):
    config = configparser.ConfigParser()
    for sectionName, values in sections.items():
        config[sectionName] = values
    return config


@pytest.fixture(autouse=True)
def resetIpGeoState(monkeypatch):
    userAccessLog.ipGeoCache.clear()
    userAccessLog.ipGeoInFlight.clear()
    for envName in (
        "IP_GEO_ENABLED",
        "IP_GEO_TIMEOUT_MS",
        "IP_GEO_CACHE_TTL_SEC",
        "IP_GEO_CACHE_MAX_ENTRIES",
    ):
        monkeypatch.delenv(envName, raising=False)
    yield
    userAccessLog.ipGeoCache.clear()
    userAccessLog.ipGeoInFlight.clear()


def testIpGeoTimeoutPrecedenceAndInvalidFallback(monkeypatch):
    config = buildConfig(
        OBSERVABILITY={"ip_geo_timeout_ms": "700"},
        **{
            "API_POLICY.ipGeoLookup": {"request_timeout_sec": "2"},
            "API_POLICY": {"request_timeout_sec": "3"},
        },
    )
    monkeypatch.setattr(userAccessLog, "getConfig", lambda: config)

    monkeypatch.setenv("IP_GEO_TIMEOUT_MS", "250")
    assert userAccessLog.getIpGeoTimeoutMs() == 250
    monkeypatch.setenv("IP_GEO_TIMEOUT_MS", "invalid")
    assert userAccessLog.getIpGeoTimeoutMs() == 700

    config["OBSERVABILITY"]["ip_geo_timeout_ms"] = "0"
    assert userAccessLog.getIpGeoTimeoutMs() == 2000
    config["API_POLICY.ipGeoLookup"]["request_timeout_sec"] = "invalid"
    assert userAccessLog.getIpGeoTimeoutMs() == 3000
    config["API_POLICY"]["request_timeout_sec"] = "invalid"
    assert userAccessLog.getIpGeoTimeoutMs() == userAccessLog.IP_GEO_DEFAULT_TIMEOUT_MS

    monkeypatch.setenv("IP_GEO_TIMEOUT_MS", "1")
    assert userAccessLog.getIpGeoTimeoutMs() == userAccessLog.IP_GEO_MIN_TIMEOUT_MS


def testFailedIpGeoLogDoesNotExposeRawIp(monkeypatch):
    rawIp = "8.8.8.8"
    warnings = []

    class FailingClient:
        def __init__(self, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, excType, excValue, traceback):
            return False

        async def get(self, url, headers):
            raise RuntimeError(f"provider failure for {rawIp}")

    monkeypatch.setattr(userAccessLog.httpx, "AsyncClient", FailingClient)
    monkeypatch.setattr(userAccessLog.logger, "warning", warnings.append)

    with pytest.raises(RuntimeError):
        asyncio.run(userAccessLog.getIpGeoFromRemote(rawIp, requestId="request-1"))

    assert len(warnings) == 1
    assert rawIp not in warnings[0]
    payload = json.loads(warnings[0])
    assert payload["target"] == userAccessLog.IP_GEO_PROVIDER_TARGET
    assert payload["reason"] == "RuntimeError"


def testUserAccessLogPersistsBaseRowBeforeLocationEnrichment(monkeypatch):
    events = []

    class FakeDb:
        async def executeQuery(self, queryName, values):
            events.append((queryName, dict(values)))
            if queryName == "common.userAccessLogLocationUpdate":
                raise RuntimeError("optional update failed")

    async def fakeResolve(clientIp, requestId=None):
        events.append(("resolve", {"clientIp": clientIp, "requestId": requestId}))
        return ("US / California", "IP_GEO_REMOTE")

    monkeypatch.setattr(userAccessLog.DB, "getManager", lambda dbName: FakeDb())
    monkeypatch.setattr(userAccessLog, "resolveIpLocation", fakeResolve)
    monkeypatch.setattr(userAccessLog.logger, "warning", lambda message: None)

    asyncio.run(
        userAccessLog.writeUserAccessLog(
            username="person@example.com",
            requestId="request-2",
            method="GET",
            path="/api/example",
            statusCode=200,
            latencyMs=20,
            sqlCount=1,
            clientIp="8.8.8.8",
            dbName="test",
        )
    )

    assert [event[0] for event in events] == [
        "common.userAccessLogInsert",
        "resolve",
        "common.userAccessLogLocationUpdate",
    ]
    insertValues = events[0][1]
    updateValues = events[2][1]
    assert insertValues["ipLocTxt"] is None
    assert insertValues["ipLocSrc"] is None
    assert updateValues == {
        "logId": insertValues["logId"],
        "ipLocTxt": "US / California",
        "ipLocSrc": "IP_GEO_REMOTE",
    }


def testBaseInsertFailureStopsLocationLookup(monkeypatch):
    resolved = False

    class FailingDb:
        async def executeQuery(self, queryName, values):
            raise RuntimeError("base insert failed")

    async def fakeResolve(clientIp, requestId=None):
        nonlocal resolved
        resolved = True
        return ("PUBLIC_IP", "IP_PUBLIC")

    monkeypatch.setattr(userAccessLog.DB, "getManager", lambda dbName: FailingDb())
    monkeypatch.setattr(userAccessLog, "resolveIpLocation", fakeResolve)
    monkeypatch.setattr(userAccessLog.logger, "warning", lambda message: None)

    asyncio.run(
        userAccessLog.writeUserAccessLog(
            username="person@example.com",
            requestId="request-3",
            method="GET",
            path="/api/example",
            statusCode=500,
            latencyMs=20,
            sqlCount=1,
            clientIp="8.8.8.8",
            dbName="test",
        )
    )

    assert resolved is False


def testSameIpMissUsesSingleFlightAndWaiterCancellationIsIsolated(monkeypatch):
    async def exercise():
        started = asyncio.Event()
        release = asyncio.Event()
        callCount = 0

        async def fakeRemote(ipValue, requestId=None):
            nonlocal callCount
            callCount += 1
            started.set()
            await release.wait()
            return {"country_code": "US"}

        monkeypatch.setattr(userAccessLog, "getIpGeoEnabled", lambda: True)
        monkeypatch.setattr(userAccessLog, "getIpGeoCacheMaxEntries", lambda: 10)
        monkeypatch.setattr(userAccessLog, "getIpGeoFromRemote", fakeRemote)

        cancelledWaiter = asyncio.create_task(userAccessLog.resolveIpLocation("8.8.8.8"))
        await started.wait()
        survivingWaiter = asyncio.create_task(userAccessLog.resolveIpLocation("8.8.8.8"))
        await asyncio.sleep(0)
        cancelledWaiter.cancel()
        with pytest.raises(asyncio.CancelledError):
            await cancelledWaiter
        release.set()

        assert await survivingWaiter == ("US", "IP_GEO_REMOTE")
        await asyncio.sleep(0)
        await asyncio.sleep(0)
        assert callCount == 1
        assert not userAccessLog.ipGeoInFlight

    asyncio.run(exercise())


def testFailedSingleFlightIsRemoved(monkeypatch):
    async def exercise():
        callCount = 0

        async def fakeRemote(ipValue, requestId=None):
            nonlocal callCount
            callCount += 1
            await asyncio.sleep(0)
            raise RuntimeError("remote unavailable")

        monkeypatch.setattr(userAccessLog, "getIpGeoEnabled", lambda: True)
        monkeypatch.setattr(userAccessLog, "getIpGeoFromRemote", fakeRemote)

        results = await asyncio.gather(
            userAccessLog.resolveIpLocation("8.8.4.4"),
            userAccessLog.resolveIpLocation("8.8.4.4"),
        )
        await asyncio.sleep(0)
        await asyncio.sleep(0)
        assert results == [("PUBLIC_IP", "IP_GEO_FAIL")] * 2
        assert callCount == 1
        assert not userAccessLog.ipGeoInFlight

    asyncio.run(exercise())


def testCacheIsPublishedBeforeSingleFlightCleanupBoundary(monkeypatch):
    async def exercise():
        callCount = 0
        cachePublishedAtCleanup = []
        boundaryEntrants = []
        originalCleanup = userAccessLog.scheduleIpGeoInFlightCleanup

        async def fakeRemote(ipValue, requestId=None):
            nonlocal callCount
            callCount += 1
            await asyncio.sleep(0)
            return {"country_code": "KR"}

        def boundaryCleanup(ipValue, task):
            cachePublishedAtCleanup.append(ipValue in userAccessLog.ipGeoCache)
            boundaryEntrants.append(asyncio.create_task(userAccessLog.resolveIpLocation(ipValue)))
            originalCleanup(ipValue, task)

        monkeypatch.setattr(userAccessLog, "getIpGeoEnabled", lambda: True)
        monkeypatch.setattr(userAccessLog, "getIpGeoCacheMaxEntries", lambda: 10)
        monkeypatch.setattr(userAccessLog, "getIpGeoFromRemote", fakeRemote)
        monkeypatch.setattr(userAccessLog, "scheduleIpGeoInFlightCleanup", boundaryCleanup)

        assert await userAccessLog.resolveIpLocation("8.8.8.8") == ("KR", "IP_GEO_REMOTE")
        await asyncio.sleep(0)
        assert len(boundaryEntrants) == 1
        assert await boundaryEntrants[0] == ("KR", "IP_GEO_REMOTE")
        await asyncio.sleep(0)

        assert cachePublishedAtCleanup == [True]
        assert callCount == 1

    asyncio.run(exercise())


def testCacheSweepRemovesExpiredAndEvictsDeterministically():
    userAccessLog.ipGeoCache.update(
        {
            "8.8.8.8": {"expiresAtMs": 99},
            "9.9.9.9": {"expiresAtMs": 500},
            "1.1.1.1": {"expiresAtMs": 300},
            "4.4.4.4": {"expiresAtMs": 400},
        }
    )

    userAccessLog.sweepIpGeoCache(nowMs=100, maxEntries=2)

    assert list(sorted(userAccessLog.ipGeoCache)) == ["4.4.4.4", "9.9.9.9"]


def testCacheMaxEntriesConfigUsesPositiveBound(monkeypatch):
    config = buildConfig(OBSERVABILITY={"ip_geo_cache_max_entries": "3"})
    monkeypatch.setattr(userAccessLog, "getConfig", lambda: config)

    monkeypatch.setenv("IP_GEO_CACHE_MAX_ENTRIES", "2")
    assert userAccessLog.getIpGeoCacheMaxEntries() == 2
    monkeypatch.setenv("IP_GEO_CACHE_MAX_ENTRIES", "invalid")
    assert userAccessLog.getIpGeoCacheMaxEntries() == 3
    config["OBSERVABILITY"]["ip_geo_cache_max_entries"] = "0"
    assert userAccessLog.getIpGeoCacheMaxEntries() == userAccessLog.IP_GEO_DEFAULT_CACHE_MAX_ENTRIES
