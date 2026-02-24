import asyncio
import os
import sys


baseDir = os.path.dirname(os.path.dirname(__file__))
if baseDir not in sys.path:
    sys.path.insert(0, baseDir)


def testCreateDataTemplateUsesCandidateQueryWhenInsertIdMissing(monkeypatch):
    from service import DashboardService
    from lib import Database as DB

    class FakeManager:
        def __init__(self):
            self.fetchQueryCalls = []

        async def executeQuery(self, queryName, binds):
            assert queryName == "dashboard.create"
            return None

        async def fetchOneQuery(self, queryName, binds):
            self.fetchQueryCalls.append((queryName, dict(binds)))
            if queryName == "dashboard.findCreatedCandidate":
                return {
                    "id": 901,
                    "title": binds.get("title"),
                    "description": binds.get("description"),
                    "status": binds.get("status"),
                    "amount": binds.get("amount"),
                    "tags": binds.get("tags"),
                    "created_at": "2026-02-23 00:00:00",
                }
            return None

    fakeDb = FakeManager()
    monkeypatch.setattr(DB, "getManager", lambda _name=None: fakeDb)

    created = asyncio.run(
        DashboardService.createDataTemplate(
            {
                "title": "후보 조회 테스트",
                "description": "insert id 없음 fallback",
                "status": "ready",
                "amount": 1000,
                "tags": ["qa", "fallback"],
            }
        )
    )

    assert int(created["id"]) == 901
    assert created["title"] == "후보 조회 테스트"
    queryNameList = [call[0] for call in fakeDb.fetchQueryCalls]
    assert "dashboard.findCreatedCandidate" in queryNameList

