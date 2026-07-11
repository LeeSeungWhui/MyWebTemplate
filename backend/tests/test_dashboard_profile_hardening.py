import asyncio
import math
import os
import sys
from pathlib import Path

import pytest


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def testDashboardPartialUpdatePayloadUsesPresenceFlags():
    from service import DashboardService

    statusPatch = DashboardService.buildUpdatePayload({"status": "done"})
    titlePatch = DashboardService.buildUpdatePayload({"title": "새 제목"})

    assert statusPatch == {
        "setTitle": False,
        "title": None,
        "setDescription": False,
        "description": None,
        "setStatus": True,
        "status": "done",
        "setAmount": False,
        "amount": None,
        "setTags": False,
        "tags": None,
    }
    assert titlePatch["setTitle"] is True
    assert titlePatch["title"] == "새 제목"
    assert titlePatch["setStatus"] is False
    assert titlePatch["status"] is None


def testDashboardUpdateSqlKeepsOmittedColumnsAndOwnerScope():
    queryText = (Path(baseDir) / "query" / "dashboard.sql").read_text(encoding="utf-8")

    assert "CASE WHEN :setTitle THEN :title ELSE DATA_NM END" in queryText
    assert "CASE WHEN :setStatus THEN :status ELSE STAT_CD END" in queryText
    assert "CASE WHEN :setTags THEN :tags ELSE TAG_JSON END" in queryText
    assert "AND USER_ID = :userId" in queryText
    assert "dashboard.findCreatedCandidate" not in queryText
    assert 'RETURNING DATA_NO AS "dataNo"' in queryText
    assert 'dashboard.deleteReturning' in queryText
    assert 'SELECT changes() AS "affectedRows"' in queryText
    assert 'SELECT ROW_COUNT() AS "affectedRows"' in queryText


def testProfileNotificationPayloadUsesIndependentPresenceFlags():
    from service import ProfileService

    emailPatch = ProfileService.buildProfileUpdatePayload(
        "demo@demo.demo",
        {"notifyEmail": True},
    )
    smsPatch = ProfileService.buildProfileUpdatePayload(
        "demo@demo.demo",
        {"notifySms": True},
    )

    assert emailPatch["setNotifyEmail"] is True
    assert emailPatch["notifyEmail"] == 1
    assert emailPatch["setNotifySms"] is False
    assert emailPatch["notifySms"] is None
    assert smsPatch["setNotifyEmail"] is False
    assert smsPatch["notifyEmail"] is None
    assert smsPatch["setNotifySms"] is True
    assert smsPatch["notifySms"] == 1


def testProfileUpdateSqlKeepsOmittedNotificationColumns():
    queryText = (Path(baseDir) / "query" / "profile.sql").read_text(encoding="utf-8")

    assert "CASE WHEN :setNotifyEmail THEN :notifyEmail ELSE NOTIFY_EMAIL END" in queryText
    assert "CASE WHEN :setNotifySms THEN :notifySms ELSE NOTIFY_SMS END" in queryText
    assert "CASE WHEN :setNotifyPush THEN :notifyPush ELSE NOTIFY_PUSH END" in queryText
    assert "WHERE USER_ID = :userId" in queryText


def testProfileNotifyMigrationIsExplicitSourceArtifact():
    migrationPath = Path(baseDir) / "migrations" / "20260711_profile_notify_columns.postgresql.sql"
    migrationText = migrationPath.read_text(encoding="utf-8")

    assert "ADD COLUMN IF NOT EXISTS NOTIFY_EMAIL" in migrationText
    assert "ADD COLUMN IF NOT EXISTS NOTIFY_SMS" in migrationText
    assert "ADD COLUMN IF NOT EXISTS NOTIFY_PUSH" in migrationText


def testDashboardRowNormalizesNullableContractFields():
    from service import DashboardService

    result = DashboardService.convertDashboardRow(
        {
            "dataNo": 9,
            "dataNm": "nullable row",
            "dataDesc": None,
            "statCd": "ready",
            "amt": None,
            "tagJson": None,
            "regDt": None,
        }
    )

    assert result["description"] == ""
    assert result["amount"] == 0
    assert result["tags"] == "[]"


@pytest.mark.parametrize("rawAmount", [float("nan"), float("inf"), float("-inf")])
def testDashboardAmountRejectsNonFiniteValues(rawAmount):
    from lib.ServiceError import ServiceError
    from service import DashboardService

    assert not math.isfinite(rawAmount)
    with pytest.raises(ServiceError) as amountError:
        DashboardService.normalizeAmount(rawAmount)
    assert amountError.value.code == "DASH_422_INVALID_INPUT"


def testDashboardDeleteRejectsZeroAffectedRows(monkeypatch):
    from lib import Database as DB
    from lib.ServiceError import ServiceError
    from service import DashboardService

    class FakeTransaction:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

    class FakeDatabase:
        def transaction(self, **kwargs):
            return FakeTransaction()

    class FakeDb:
        databaseUrl = "sqlite:///:memory:"
        database = FakeDatabase()

        async def executeQuery(self, queryName, binds):
            assert queryName == "dashboard.delete"
            assert binds == {"id": 77, "userId": "demo@demo.demo"}
            return None

        async def fetchOneQuery(self, queryName, binds=None):
            assert queryName == "dashboard.sqliteAffectedRows"
            assert binds is None
            return {"affectedRows": 0}

    fakeDb = FakeDb()
    monkeypatch.setattr(DB, "getManager", lambda _name=None: fakeDb)
    monkeypatch.setitem(DB.dbManagers, "main_db", fakeDb)

    with pytest.raises(ServiceError) as deleteError:
        asyncio.run(DashboardService.deleteDataTemplate(77, userId="demo@demo.demo"))
    assert deleteError.value.code == "DASH_404_NOT_FOUND"


def testDashboardDatabaseFamilyAcceptsDriverQualifiedSqliteUrl():
    from service import DashboardService

    class DriverQualifiedSqliteDb:
        databaseUrl = "sqlite+aiosqlite:///:memory:"

    assert DashboardService.getDashboardDatabaseFamily(DriverQualifiedSqliteDb()) == "sqlite"


def testDashboardIdempotencyCompletionRunsInsideCreateTransaction(monkeypatch):
    from lib import Database as DB
    from service import DashboardService

    state = {"inTransaction": False, "discarded": False, "completed": False}

    class FakeTransaction:
        async def __aenter__(self):
            state["inTransaction"] = True
            return self

        async def __aexit__(self, exc_type, exc, tb):
            state["inTransaction"] = False
            return False

    class FakeDatabase:
        def transaction(self, **kwargs):
            return FakeTransaction()

    class FakeDb:
        database = FakeDatabase()

        async def executeQuery(self, queryName, binds):
            assert queryName == "dashboard.create"
            return 31

        async def fetchOneQuery(self, queryName, binds):
            assert queryName == "dashboard.detail"
            return {
                "dataNo": 31,
                "dataNm": "transactional create",
                "dataDesc": "idempotency completion",
                "statCd": "ready",
                "amt": 1,
                "tagJson": "[]",
                "regDt": "2026-07-11 00:00:00",
            }

    fakeDb = FakeDb()
    monkeypatch.setattr(DB, "getManager", lambda _name=None: fakeDb)
    monkeypatch.setitem(DB.dbManagers, "main_db", fakeDb)

    async def fakeBegin(scopeType, idempotencyKey, payload):
        return {"status": "new", "payloadDigest": "digest"}

    async def failingComplete(scopeType, idempotencyKey, result):
        assert state["inTransaction"] is True
        state["completed"] = True
        raise RuntimeError("completion failed")

    async def fakeDiscard(scopeType, idempotencyKey):
        assert state["inTransaction"] is False
        state["discarded"] = True
        return True

    monkeypatch.setattr(DashboardService, "beginIdempotencyRequest", fakeBegin)
    monkeypatch.setattr(DashboardService, "completeIdempotencyRequest", failingComplete)
    monkeypatch.setattr(DashboardService, "discardIdempotencyReservation", fakeDiscard)

    with pytest.raises(RuntimeError, match="completion failed"):
        asyncio.run(
            DashboardService.createDataTemplate(
                {"title": "transactional create", "status": "ready"},
                userId="demo@demo.demo",
                idempotencyKey="idem-key:dashboard-31",
            )
        )

    assert state == {"inTransaction": False, "discarded": True, "completed": True}
