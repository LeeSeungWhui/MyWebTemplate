import asyncio

import pytest

from lib.ServiceError import ServiceError


class FakeDbManager:
    def __init__(self):
        self.entries = {}
        self.calls = []

    async def executeQuery(self, queryName: str, values=None):
        params = dict(values or {})
        self.calls.append((queryName, params))
        if queryName == "idempotency.ensureTable":
            return None
        if queryName == "idempotency.deleteExpired":
            nowMs = int(params["nowMs"])
            self.entries = {
                key: value
                for key, value in self.entries.items()
                if int(value["expiresAtMs"]) > nowMs
            }
            return None
        if queryName == "idempotency.insertEntry":
            key = (params["scopeType"], params["idempotencyKey"])
            if key in self.entries:
                raise Exception("duplicate key")
            self.entries[key] = {
                "scopeTp": params["scopeType"],
                "idempotencyKey": params["idempotencyKey"],
                "statusCd": params["statusCd"],
                "payloadDigest": params["payloadDigest"],
                "responseJson": params["responseJson"],
                "expiresAtMs": params["expiresAtMs"],
            }
            return 1
        if queryName == "idempotency.completeEntry":
            key = (params["scopeType"], params["idempotencyKey"])
            self.entries[key].update(
                {
                    "statusCd": params["statusCd"],
                    "responseJson": params["responseJson"],
                    "expiresAtMs": params["expiresAtMs"],
                }
            )
            return 1
        raise AssertionError(f"unexpected queryName: {queryName}")

    async def fetchOneQuery(self, queryName: str, values=None):
        params = dict(values or {})
        self.calls.append((queryName, params))
        if queryName != "idempotency.getEntry":
            raise AssertionError(f"unexpected queryName: {queryName}")
        key = (params["scopeType"], params["idempotencyKey"])
        row = self.entries.get(key)
        return dict(row) if row else None


def testNormalizeIdempotencyKeyValidation():
    from lib.Idempotency import normalizeIdempotencyKey

    assert normalizeIdempotencyKey(None) is None
    assert normalizeIdempotencyKey("  idem-key:1234  ") == "idem-key:1234"

    with pytest.raises(ServiceError) as invalidType:
        normalizeIdempotencyKey(12345)  # type: ignore[arg-type]
    assert invalidType.value.code == "IDEMPOTENCY_422_INVALID_INPUT"

    with pytest.raises(ServiceError) as invalidPattern:
        normalizeIdempotencyKey("short")
    assert invalidPattern.value.code == "IDEMPOTENCY_422_INVALID_INPUT"


def testIdempotencyPayloadDigestIsStable():
    from lib.Idempotency import buildIdempotencyPayloadDigest

    left = buildIdempotencyPayloadDigest("resume.create", {"b": 2, "a": {"x": 1}})
    right = buildIdempotencyPayloadDigest("resume.create", {"a": {"x": 1}, "b": 2})
    otherScope = buildIdempotencyPayloadDigest("resume.update", {"a": {"x": 1}, "b": 2})

    assert left == right
    assert left != otherScope


def testBeginCompleteAndReplayIdempotencyRequest(monkeypatch):
    import lib.Idempotency as Idempotency

    fakeManager = FakeDbManager()
    monkeypatch.setattr(Idempotency.DB, "getManager", lambda: fakeManager)

    async def scenario():
        first = await Idempotency.beginIdempotencyRequest(
            "resume.create",
            "idem-key:1234",
            {"userId": "demo", "resumeId": 7},
        )
        assert first["status"] == "new"
        assert first["payloadDigest"]

        with pytest.raises(ServiceError) as inProgress:
            await Idempotency.beginIdempotencyRequest(
                "resume.create",
                "idem-key:1234",
                {"resumeId": 7, "userId": "demo"},
            )
        assert inProgress.value.code == "IDEMPOTENCY_409_IN_PROGRESS"

        await Idempotency.completeIdempotencyRequest(
            "resume.create",
            "idem-key:1234",
            {"ok": True, "resultId": 99},
        )

        replay = await Idempotency.beginIdempotencyRequest(
            "resume.create",
            "idem-key:1234",
            {"resumeId": 7, "userId": "demo"},
        )
        assert replay == {
            "status": "replay",
            "payloadDigest": first["payloadDigest"],
            "result": {"ok": True, "resultId": 99},
        }

        with pytest.raises(ServiceError) as mismatch:
            await Idempotency.beginIdempotencyRequest(
                "resume.create",
                "idem-key:1234",
                {"resumeId": 8, "userId": "demo"},
            )
        assert mismatch.value.code == "IDEMPOTENCY_409_PAYLOAD_MISMATCH"

    asyncio.run(scenario())

    executedNames = [name for name, ignoredParams in fakeManager.calls]
    assert "idempotency.ensureTable" in executedNames
    assert "idempotency.insertEntry" in executedNames
    assert "idempotency.completeEntry" in executedNames
    assert "idempotency.getEntry" in executedNames
