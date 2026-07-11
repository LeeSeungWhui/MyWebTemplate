import asyncio

from service import SampleService
from service.SampleService import (
    PUBLIC_TASK_COPY_OVERRIDES,
    applyPublicAdminSetting,
    findStoredTaskTitlesForPublicSearch,
    readDefaultAdminSetting,
    readStoredAdminEmailCandidates,
    toAdminUserModel,
    toTaskModel,
)


def testLegacyTaskRowsUseCustomerFacingCopyWithoutDatabaseMutation():
    expectedTitleSet = {
        "신규 상담 요청 검토",
        "요구사항 상세 정리",
        "상담 일정 확정",
        "예상 일정 및 예산 검토",
        "프로젝트 제안서 작성",
        "계약 일정 조율",
        "디자인 시안 검토 요청",
        "고객 피드백 반영",
        "개발 진행 상황 공유",
        "기능 검수 결과 확인",
        "최종 검수 일정 확정",
        "서비스 공개 준비",
    }

    convertedTitleSet = {
        toTaskModel({"taskNo": index, "dataNm": originalTitle})["title"]
        for index, (originalTitle, *_ignoredCopy) in enumerate(PUBLIC_TASK_COPY_OVERRIDES, start=1)
    }

    assert convertedTitleSet == expectedTitleSet
    assert set(findStoredTaskTitlesForPublicSearch("서비스 공개")) == {
        "공개 화면 이동 경로 점검",
        "미들웨어 공개 경로 점검",
        "고객 상담용 샘플 시나리오 작성",
        "숨고/크몽 샘플 시나리오 작성",
    }
    assert "대시보드 통계 API 점검" in findStoredTaskTitlesForPublicSearch("제안서")


def testLegacyAdminRowsAndSettingsUsePublicSampleDefaults():
    adminUser = toAdminUserModel({
        "userNo": 1,
        "userNm": "김관리",
        "userEml": "admin@demo.demo",
        "roleCd": "admin",
        "statCd": "active",
    })

    assert adminUser["name"] == "김민지"
    assert adminUser["email"] == "minji.kim@example.com"
    assert readStoredAdminEmailCandidates("minji.kim@example.com") == [
        "minji.kim@example.com",
        "admin@demo.demo",
    ]
    assert readDefaultAdminSetting()["siteName"] == "Web Sample"
    assert applyPublicAdminSetting({
        "siteName": "MyWebTemplate",
        "adminEmail": "admin@demo.demo",
        "sessionTimeout": 60,
    }) == {
        "siteName": "Web Sample",
        "adminEmail": "admin@example.com",
        "sessionTimeout": 60,
    }


def testCustomAdminSettingsArePreserved():
    customSetting = {
        "siteName": "고객 운영 포털",
        "adminEmail": "ops@customer.example",
        "maintenanceMode": True,
    }

    assert applyPublicAdminSetting(customSetting) == customSetting


def testTaskSearchIncludesLegacyRowsMatchingPublicCopy(monkeypatch):
    capturedBindMap = {}

    class FakeDb:
        async def fetchAllQuery(self, queryName, bind):
            assert queryName == "sample.taskList"
            capturedBindMap.update(bind)
            return [{
                "taskNo": 12,
                "dataNm": "고객 상담용 샘플 시나리오 작성",
                "dataDesc": "상담 전 확인할 샘플 화면 안내 흐름 정리",
                "ownerNm": "기획팀",
                "statCd": "pending",
                "amt": 460000,
                "attachNm": "sample_guide.docx",
                "regDt": "2026-02-22",
            }]

        async def fetchOneQuery(self, queryName, bind=None):
            assert queryName == "sample.taskListCount"
            assert {
                key: value
                for key, value in bind.items()
                if key.startswith("publicTitleMatch")
            } == {
                key: value
                for key, value in capturedBindMap.items()
                if key.startswith("publicTitleMatch")
            }
            return {"totalCount": 1}

    async def skipBootstrap():
        return None

    monkeypatch.setattr(SampleService, "ensureBootstrap", skipBootstrap)
    monkeypatch.setattr(SampleService, "ensureDbManager", lambda: FakeDb())
    monkeypatch.setattr(SampleService, "getConfig", lambda: {})

    result = asyncio.run(SampleService.listSampleTasks(q="서비스 공개", page=1, size=10))

    assert {
        value
        for key, value in capturedBindMap.items()
        if key.startswith("publicTitleMatch") and value
    } == {
        "공개 화면 이동 경로 점검",
        "미들웨어 공개 경로 점검",
        "고객 상담용 샘플 시나리오 작성",
        "숨고/크몽 샘플 시나리오 작성",
    }
    assert result["sampleTaskList"][0]["title"] == "서비스 공개 준비"
