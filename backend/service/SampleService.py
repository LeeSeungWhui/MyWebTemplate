"""
파일명: backend/service/SampleService.py
작성자: LSH
갱신일: 2026-04-08
설명: 공개 sample 페이지용 DB 부트스트랩/조회/CRUD 서비스 로직
"""

import asyncio
import json
import re
from datetime import date, timedelta
from types import MappingProxyType
from typing import Any

from lib import Database as DB
from lib.Casing import convertKeysToCamelCase
from lib.Config import getConfig
from lib.Idempotency import beginIdempotencyRequest, completeIdempotencyRequest, discardIdempotencyReservation
from lib.ServiceError import ServiceError
from lib.Transaction import transaction

SAMPLE_TASK_STATUS_ORDER = ("ready", "pending", "running", "done", "failed")
ALLOWED_TASK_STATUS = frozenset(SAMPLE_TASK_STATUS_ORDER)
SAMPLE_ADMIN_ROLE_ORDER = ("admin", "editor", "user")
ALLOWED_ADMIN_ROLE = frozenset(SAMPLE_ADMIN_ROLE_ORDER)
SAMPLE_ADMIN_STATUS_ORDER = ("active", "inactive")
ALLOWED_ADMIN_STATUS = frozenset(SAMPLE_ADMIN_STATUS_ORDER)
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")

SAMPLE_CONFIG_KEY = MappingProxyType({
    "BOOTSTRAP_VERSION": "sample.bootstrap.version",
    "ADMIN_SETTING": "sample.admin.setting",
    "ROLE_PERMISSION_MAP": "sample.admin.rolePermissionMap",
    "FORM_CATEGORY_CODE_LIST": "sample.form.categoryCodeList",
    "FORM_FEATURE_CODE_LIST": "sample.form.featureCodeList",
})
DEFAULT_ADMIN_SETTING = MappingProxyType({
    "siteName": "Web Sample",
    "adminEmail": "admin@example.com",
    "maintenanceMode": False,
    "sessionTimeout": 60,
    "maxUploadMb": 30,
})
DEFAULT_ROLE_PERMISSION_MAP = MappingProxyType({
    "admin": MappingProxyType({
        "manageUser": True,
        "editContent": True,
        "changeSetting": True,
        "viewLog": True,
        "deleteData": True,
    }),
    "editor": MappingProxyType({
        "manageUser": False,
        "editContent": True,
        "changeSetting": False,
        "viewLog": True,
        "deleteData": False,
    }),
    "user": MappingProxyType({
        "manageUser": False,
        "editContent": False,
        "changeSetting": False,
        "viewLog": False,
        "deleteData": False,
    }),
})
DEFAULT_FORM_CATEGORY_CODE_LIST = ("web", "app", "api", "etc")
DEFAULT_FORM_FEATURE_CODE_LIST = ("login", "board", "payment", "chart", "admin")
SAMPLE_TASK_SEED_DAY_OFFSET_LIST = (12, 10, 8, 6, 5, 5, 4, 4, 3, 2, 1, 0)
BOOTSTRAP_LOCK = asyncio.Lock()


def readDefaultAdminSetting() -> dict[str, Any]:
    """
    설명: immutable 기본 관리자 설정을 JSON/응답용 dict 복사본으로 변환
    반환값: 기본 관리자 설정 dict
    갱신일: 2026-06-04
    """
    return dict(DEFAULT_ADMIN_SETTING)


def readDefaultRolePermissionMap() -> dict[str, dict[str, bool]]:
    """
    설명: immutable 기본 역할 권한 맵을 JSON/응답용 중첩 dict 복사본으로 변환
    반환값: 역할별 권한 dict
    갱신일: 2026-06-04
    """
    return {role: dict(permissionMap) for role, permissionMap in DEFAULT_ROLE_PERMISSION_MAP.items()}


def buildSampleTaskSeedDateBind(referenceDate: date | None = None) -> dict[str, date]:
    """
    설명: 샘플 업무 시드 날짜를 초기화 기준일에 맞춘 상대 날짜 바인딩으로 생성
    반환값: taskDate01~taskDate12 date 바인딩 dict
    갱신일: 2026-07-13
    """
    baseDate = referenceDate or date.today()
    return {
        f"taskDate{index:02d}": baseDate - timedelta(days=dayOffset)
        for index, dayOffset in enumerate(SAMPLE_TASK_SEED_DAY_OFFSET_LIST, start=1)
    }


def readTotalCount(row: dict[str, Any] | None) -> int:
    """
    설명: COUNT 행(dict)에서 totalCount 값을 안전하게 읽어 정수로 변환
    반환값: totalCount 정수값, 누락/파싱 실패 시 0
    갱신일: 2026-03-12
    """
    rawMap: Any = row or {}
    if not isinstance(rawMap, dict):
        try:
            rawMap = dict(rawMap)
        except Exception:
            rawMap = {}
    countMap = convertKeysToCamelCase(rawMap)
    try:
        return int(countMap.get("totalCount") or 0)
    except Exception:
        return 0


def ensureDbManager():
    """
    설명: 공개 sample API에서 사용할 기본 DB 매니저 확보
    실패 동작: 매니저가 없으면 ServiceError("DB_NOT_READY") 발생
    반환값: 초기화된 DB 매니저 인스턴스
    갱신일: 2026-03-06
    """
    db = DB.getManager()
    if not db:
        raise ServiceError("DB_NOT_READY")
    return db


def normalizeText(rawValue: Any, *, required: bool = False, maxLength: int = 255) -> str:
    """
    설명: 일반 문자열 입력을 trim/maxLength 기준으로 정규화
    실패 동작: required 위반 또는 최대 길이 초과 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 공백 제거된 문자열
    갱신일: 2026-03-06
    """
    if rawValue is None:
        if required:
            raise ServiceError("SAMPLE_422_INVALID_INPUT")
        return ""
    if not isinstance(rawValue, str):
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    value = rawValue.strip()
    if required and not value:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    if len(value) > maxLength:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def normalizeEmail(rawValue: Any) -> str:
    """
    설명: 이메일 문자열 형식 검증/정규화
    실패 동작: 문자열이 아니거나 이메일 패턴 불일치 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 소문자 이메일 문자열
    갱신일: 2026-03-06
    """
    value = normalizeText(rawValue, required=True, maxLength=120).lower()
    if not EMAIL_PATTERN.fullmatch(value):
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def normalizeDateText(rawValue: Any, *, required: bool = False) -> str:
    """
    설명: YYYY-MM-DD 날짜 문자열 검증/정규화
    실패 동작: required 위반 또는 날짜 패턴 불일치 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 빈 문자열 또는 YYYY-MM-DD 문자열
    갱신일: 2026-03-06
    """
    value = normalizeText(rawValue, required=required, maxLength=10)
    if not value:
        return ""
    if not DATE_PATTERN.fullmatch(value):
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def parseSqlDateBound(value: str) -> date | None:
    """
    설명: 검증된 YYYY-MM-DD 문자열을 SQL 바인딩용 date로 변환
    실패 동작: 빈 값은 None, 파싱 실패는 SAMPLE_422_INVALID_INPUT
    반환값: date 또는 None
    갱신일: 2026-06-04
    """
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except Exception as exc:
        raise ServiceError("SAMPLE_422_INVALID_INPUT") from exc


def normalizeTaskStatus(rawValue: Any) -> str:
    """
    설명: 공개 sample 업무 상태값을 허용 목록으로 정규화
    실패 동작: 허용되지 않은 상태 입력이면 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 허용된 상태 문자열
    갱신일: 2026-03-06
    """
    value = normalizeText(rawValue, required=True, maxLength=20).lower()
    if value not in ALLOWED_TASK_STATUS:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def normalizeAdminRole(rawValue: Any) -> str:
    """
    설명: 공개 sample 관리자 역할값을 허용 목록으로 정규화
    실패 동작: 허용되지 않은 역할 입력이면 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 허용된 역할 문자열
    갱신일: 2026-03-06
    """
    value = normalizeText(rawValue, required=True, maxLength=20).lower()
    if value not in ALLOWED_ADMIN_ROLE:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def normalizeAdminStatus(rawValue: Any) -> str:
    """
    설명: 공개 sample 관리자 상태값을 허용 목록으로 정규화
    실패 동작: 허용되지 않은 상태 입력이면 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 허용된 활성 상태 문자열
    갱신일: 2026-03-06
    """
    value = normalizeText(rawValue, required=True, maxLength=20).lower()
    if value not in ALLOWED_ADMIN_STATUS:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def normalizeAmount(rawValue: Any) -> float:
    """
    설명: 금액 입력을 float으로 보정
    실패 동작: 수치 변환 실패 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: float 금액값
    갱신일: 2026-03-06
    """
    if rawValue in (None, ""):
        return 0.0
    try:
        return float(rawValue)
    except Exception as exc:
        raise ServiceError("SAMPLE_422_INVALID_INPUT") from exc


def normalizeBool(rawValue: Any) -> bool:
    """
    설명: bool/0/1 입력을 불리언으로 정규화
    실패 동작: 해석 불가능한 값은 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: bool 값
    갱신일: 2026-03-06
    """
    if isinstance(rawValue, bool):
        return rawValue
    if rawValue in (0, 1):
        return bool(rawValue)
    if rawValue in (None, ""):
        return False
    raise ServiceError("SAMPLE_422_INVALID_INPUT")


def normalizePage(rawValue: Any, *, defaultValue: int = 1, maxValue: int = 100) -> int:
    """
    설명: 페이지 번호 입력을 최소/최대 범위 기준으로 보정
    실패 동작: 숫자 변환 실패 시 기본값 사용
    반환값: 1 이상 maxValue 이하 정수 페이지 번호
    갱신일: 2026-03-06
    """
    try:
        value = int(rawValue)
    except Exception:
        value = defaultValue
    return max(1, min(value, maxValue))


def normalizeId(rawValue: Any) -> int:
    """
    설명: 공개 sample 엔티티 ID를 양의 정수로 정규화
    실패 동작: 1 미만이거나 숫자 변환 실패 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 1 이상 정수 ID
    갱신일: 2026-03-06
    """
    try:
        value = int(rawValue)
    except Exception as exc:
        raise ServiceError("SAMPLE_422_INVALID_INPUT") from exc
    if value < 1:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return value


def normalizeJsonCodeList(rawValue: Any, *, allowedSet: set[str] | None = None) -> list[str]:
    """
    설명: JSON 배열/리스트 입력을 코드 문자열 목록으로 정규화
    실패 동작: 배열이 아니거나 허용되지 않은 코드 포함 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 공백 제거된 문자열 리스트
    갱신일: 2026-03-06
    """
    if rawValue is None:
        return []
    source = rawValue
    if isinstance(rawValue, str):
        try:
            source = json.loads(rawValue)
        except Exception as exc:
            raise ServiceError("SAMPLE_422_INVALID_INPUT") from exc
    if not isinstance(source, list):
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    out = []
    for item in source:
        value = normalizeText(item, required=True, maxLength=60)
        if allowedSet and value not in allowedSet:
            raise ServiceError("SAMPLE_422_INVALID_INPUT")
        out.append(value)
    return out


def toTaskPayload(payload: dict[str, Any], currentRow: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 업무 생성/수정 입력을 DB 바인딩 포맷으로 정규화
    실패 동작: 필수값 누락 또는 상태/금액 제약 위반 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: title/description/owner/status/amount/attachmentName 바인딩 dict
    갱신일: 2026-03-06
    """
    current = currentRow or {}
    titleRaw = payload.get("title") if "title" in payload else current.get("title")
    statusRaw = payload.get("status") if "status" in payload else current.get("status")
    descriptionRaw = payload.get("description") if "description" in payload else current.get("description")
    ownerRaw = payload.get("owner") if "owner" in payload else current.get("owner")
    amountRaw = payload.get("amount") if "amount" in payload else current.get("amount")
    attachmentRaw = payload.get("attachmentName") if "attachmentName" in payload else current.get("attachmentName")
    if not current and ("title" not in payload or "status" not in payload):
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    if current and not any(key in payload for key in ("title", "description", "owner", "status", "amount", "attachmentName")):
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return {
        "title": normalizeText(titleRaw, required=True, maxLength=200),
        "description": normalizeText(descriptionRaw, maxLength=1000),
        "owner": normalizeText(ownerRaw, maxLength=80),
        "status": normalizeTaskStatus(statusRaw),
        "amount": normalizeAmount(amountRaw),
        "attachmentName": normalizeText(attachmentRaw, maxLength=255),
    }


def toAdminUserPayload(payload: dict[str, Any], currentRow: dict[str, Any] | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 사용자 생성/수정 입력을 DB 바인딩 포맷으로 정규화
    실패 동작: 필수값 누락 또는 이메일/역할/상태 규칙 위반 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: name/email/role/status/notify*/profileImageUrl 바인딩 dict
    갱신일: 2026-03-06
    """
    current = currentRow or {}
    if current:
        if not any(key in payload for key in ("name", "email", "role", "status", "notifyEmail", "notifySms", "notifyPush", "profileImageUrl")):
            raise ServiceError("SAMPLE_422_INVALID_INPUT")
    else:
        if "name" not in payload or "email" not in payload or "role" not in payload or "status" not in payload:
            raise ServiceError("SAMPLE_422_INVALID_INPUT")
    return {
        "name": normalizeText(
            payload.get("name") if "name" in payload else current.get("name"),
            required=True,
            maxLength=80,
        ),
        "email": normalizeEmail(payload.get("email") if "email" in payload else current.get("email")),
        "role": normalizeAdminRole(payload.get("role") if "role" in payload else current.get("role")),
        "status": normalizeAdminStatus(payload.get("status") if "status" in payload else current.get("status")),
        "notifyEmail": 1 if normalizeBool(payload.get("notifyEmail") if "notifyEmail" in payload else current.get("notifyEmail")) else 0,
        "notifySms": 1 if normalizeBool(payload.get("notifySms") if "notifySms" in payload else current.get("notifySms")) else 0,
        "notifyPush": 1 if normalizeBool(payload.get("notifyPush") if "notifyPush" in payload else current.get("notifyPush")) else 0,
        "profileImageUrl": normalizeText(
            payload.get("profileImageUrl") if "profileImageUrl" in payload else current.get("profileImageUrl"),
            maxLength=255,
        ),
    }


def toFormPayload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 공개 sample 폼 제출 입력을 DB 저장 포맷으로 정규화
    실패 동작: Step1 필수값/날짜 범위/코드 목록 규칙 위반 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 폼 제출 insert 바인딩용 dict
    갱신일: 2026-03-06
    """
    startDate = normalizeDateText(payload.get("startDate"), required=True)
    endDate = normalizeDateText(payload.get("endDate"), required=True)
    if startDate > endDate:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    selectedFeatures = normalizeJsonCodeList(
        payload.get("selectedFeatures"),
        allowedSet=set(DEFAULT_FORM_FEATURE_CODE_LIST),
    )
    return {
        "name": normalizeText(payload.get("name"), required=True, maxLength=80),
        "email": normalizeEmail(payload.get("email")),
        "phone": normalizeText(payload.get("phone"), required=True, maxLength=40),
        "category": normalizeText(payload.get("category"), required=True, maxLength=40),
        "startDate": startDate,
        "endDate": endDate,
        "budgetRange": normalizeText(payload.get("budgetRange"), required=True, maxLength=80),
        "requirement": normalizeText(payload.get("requirement"), maxLength=2000),
        "selectedFeatures": json.dumps(selectedFeatures, ensure_ascii=False),
        "referenceUrl": normalizeText(payload.get("referenceUrl"), maxLength=500),
        "attachmentName": normalizeText(payload.get("attachmentName"), maxLength=255),
    }


def parseConfigRow(row: dict[str, Any] | None, defaultValue: Any) -> Any:
    """
    설명: CONFIG_JSON 행을 JSON 파싱해 기본값 폴백까지 수행
    실패 동작: 파싱 실패 또는 빈 행이면 defaultValue 그대로 반환
    반환값: JSON 파싱 결과 또는 기본값
    갱신일: 2026-03-06
    """
    rawMap: Any = row or {}
    if not isinstance(rawMap, dict):
        try:
            rawMap = dict(rawMap)
        except Exception:
            rawMap = {}
    configMap = convertKeysToCamelCase(rawMap)
    configJson = configMap.get("configJson")
    if not configJson:
        return defaultValue
    try:
        return json.loads(configJson)
    except Exception:
        return defaultValue


def readModelValue(row: dict[str, Any], *keys: str, defaultValue: Any = None) -> Any:
    """
    설명: SQL source-key 모델과 API 응답 모델의 과도기 호환을 위해 후보 키 중 첫 값을 읽는다
    반환값: 첫 번째 non-None 값 또는 defaultValue
    갱신일: 2026-06-04
    """
    for key in keys:
        if key in row and row.get(key) is not None:
            return row.get(key)
    return defaultValue


PUBLIC_TASK_COPY_OVERRIDES = (
    ("랜딩 페이지 시안 확정", "신규 상담 요청 검토", "요청 목적과 필요한 주요 기능 정리", "상담팀", "프로젝트_요청서.pdf"),
    ("회원가입 폼 검증 규칙 반영", "요구사항 상세 정리", "화면 구성과 핵심 업무 범위 정리", "기획팀", "요구사항_정리본.docx"),
    ("로그 마스킹 정책 적용", "상담 일정 확정", "담당자와 온라인 미팅 일정 조율", "상담팀", "상담_일정.ics"),
    ("샘플 페이지 QA", "예상 일정 및 예산 검토", "개발 범위에 맞춘 일정과 예산 초안 작성", "기획팀", "일정_예산_초안.xlsx"),
    ("대시보드 통계 API 점검", "프로젝트 제안서 작성", "범위, 일정, 산출물을 정리한 제안서 준비", "기획팀", "프로젝트_제안서.pdf"),
    ("공개 GNB 모바일 드로어 개선", "계약 일정 조율", "착수 일정과 계약 진행 절차 안내", "운영팀", "계약_안내.pdf"),
    ("포트폴리오 섹션 리뉴얼", "디자인 시안 검토 요청", "주요 화면 시안 공유 및 의견 요청", "디자인팀", "화면_시안.pdf"),
    ("회원가입 중복 이메일 처리", "고객 피드백 반영", "검수 의견을 화면 구성과 문구에 반영", "디자인팀", "피드백_정리.xlsx"),
    ("프로필 설정 화면 구성", "개발 진행 상황 공유", "완료 기능과 다음 작업 일정 정리", "개발팀", "주간_진행보고.pdf"),
    ("고객 문의 데이터 정리", "기능 검수 결과 확인", "주요 사용 흐름과 수정 요청 사항 확인", "검수팀", "기능_검수표.xlsx"),
    ("T_DATA 샘플 데이터 정리", "기능 검수 결과 확인", "주요 사용 흐름과 수정 요청 사항 확인", "검수팀", "기능_검수표.xlsx"),
    ("공개 화면 이동 경로 점검", "최종 검수 일정 확정", "최종 확인 항목과 서비스 공개 일정 조율", "운영팀", "최종_검수_일정.pdf"),
    ("미들웨어 공개 경로 점검", "최종 검수 일정 확정", "최종 확인 항목과 서비스 공개 일정 조율", "운영팀", "최종_검수_일정.pdf"),
    ("고객 상담용 샘플 시나리오 작성", "서비스 공개 준비", "도메인, 안내 자료, 운영 체크리스트 정리", "운영팀", "서비스_공개_체크리스트.pdf"),
    ("숨고/크몽 샘플 시나리오 작성", "서비스 공개 준비", "도메인, 안내 자료, 운영 체크리스트 정리", "운영팀", "서비스_공개_체크리스트.pdf"),
)

ORIGINAL_SAMPLE_TASK_DATE_COMPATIBILITY_LIST = (
    (("신규 상담 요청 검토", "랜딩 페이지 시안 확정"), "2026-02-10", 12),
    (("요구사항 상세 정리", "회원가입 폼 검증 규칙 반영"), "2026-02-12", 10),
    (("상담 일정 확정", "로그 마스킹 정책 적용"), "2026-02-14", 8),
    (("예상 일정 및 예산 검토", "샘플 페이지 QA"), "2026-02-16", 6),
    (("프로젝트 제안서 작성", "대시보드 통계 API 점검"), "2026-02-17", 5),
    (("계약 일정 조율", "공개 GNB 모바일 드로어 개선"), "2026-02-17", 5),
    (("디자인 시안 검토 요청", "포트폴리오 섹션 리뉴얼"), "2026-02-18", 4),
    (("고객 피드백 반영", "회원가입 중복 이메일 처리"), "2026-02-18", 4),
    (("개발 진행 상황 공유", "프로필 설정 화면 구성"), "2026-02-19", 3),
    (("기능 검수 결과 확인", "고객 문의 데이터 정리", "T_DATA 샘플 데이터 정리"), "2026-02-20", 2),
    (("최종 검수 일정 확정", "공개 화면 이동 경로 점검", "미들웨어 공개 경로 점검"), "2026-02-21", 1),
    (("서비스 공개 준비", "고객 상담용 샘플 시나리오 작성", "숨고/크몽 샘플 시나리오 작성"), "2026-02-22", 0),
)

PUBLIC_ADMIN_USER_COPY_OVERRIDES = (
    ("admin@demo.demo", "김민지", "minji.kim@example.com"),
    ("editor@demo.demo", "박서준", "seojun.park@example.com"),
    ("user@demo.demo", "이하늘", "haneul.lee@example.com"),
)

PREVIOUS_ADMIN_SETTING_COPY = MappingProxyType({
    "siteName": "MyWebTemplate",
    "adminEmail": "admin@demo.demo",
})


def applyPublicTaskCopy(taskModel: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 기존 공개 샘플 시드의 개발 내부 용어를 고객용 표시 문구로 치환
    처리 규칙: DB 값을 직접 수정하지 않고 API 응답 모델의 표시 필드만 보정한다.
    반환값: 공개 sample 업무 표시 모델 dict
    갱신일: 2026-07-09
    """
    originalTitle = str(taskModel.get("title") or "")
    for originalTitleText, title, description, owner, attachmentName in PUBLIC_TASK_COPY_OVERRIDES:
        if originalTitle != originalTitleText:
            continue
        nextTaskModel = {**taskModel, "title": title, "description": description, "attachmentName": attachmentName}
        if owner:
            nextTaskModel["owner"] = owner
        return nextTaskModel
    return taskModel


def applyPublicRecentTaskDate(
    taskModel: dict[str, Any],
    storedRow: dict[str, Any],
    *,
    referenceDate: date | None = None,
) -> dict[str, Any]:
    """
    설명: 기존 고정 시드 업무의 최근 카드 날짜만 현재 기준 상대 날짜로 표시 보정
    처리 규칙: 저장 제목과 2026-02 원본 날짜가 모두 정확히 일치할 때만 응답 모델을 변경한다.
    반환값: 최근 카드용 공개 sample 업무 모델 dict
    갱신일: 2026-07-13
    """
    source = convertKeysToCamelCase(storedRow or {})
    storedTitle = str(readModelValue(source, "title", "dataNm", defaultValue="") or "")
    storedDateText = str(readModelValue(source, "createdAt", "regDt", defaultValue="") or "")[:10]
    baseDate = referenceDate or date.today()

    for storedTitleList, originalDateText, dayOffset in ORIGINAL_SAMPLE_TASK_DATE_COMPATIBILITY_LIST:
        if storedTitle in storedTitleList and storedDateText == originalDateText:
            return {
                **taskModel,
                "createdAt": (baseDate - timedelta(days=dayOffset)).isoformat(),
            }
    return taskModel


def findStoredTaskTitlesForPublicSearch(keyword: str) -> list[str]:
    """
    설명: 고객용 표시 문구 검색 시 함께 조회할 기존 시드 제목 목록 계산
    반환값: 고객용 제목/설명/담당자에 keyword가 포함된 기존 시드 제목 목록
    갱신일: 2026-07-10
    """
    keywordValue = str(keyword or "").strip().casefold()
    if not keywordValue:
        return []
    return [
        originalTitle
        for originalTitle, title, description, owner, _attachmentName in PUBLIC_TASK_COPY_OVERRIDES
        if keywordValue in f"{title} {description} {owner}".casefold()
    ]


def buildPublicTaskSearchBind(keyword: str) -> dict[str, str]:
    """
    설명: SQL array cast 없이 기존 시드 검색 호환값을 고정 바인딩 슬롯으로 변환
    반환값: publicTitleMatch01~15 문자열 바인딩 dict
    갱신일: 2026-07-10
    """
    matchedTitleList = findStoredTaskTitlesForPublicSearch(keyword)
    slotCount = len(PUBLIC_TASK_COPY_OVERRIDES)
    paddedTitleList = (matchedTitleList + ([""] * slotCount))[:slotCount]
    return {
        f"publicTitleMatch{index:02d}": title
        for index, title in enumerate(paddedTitleList, start=1)
    }


def applyPublicAdminUserCopy(userModel: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 기존 관리자 샘플 시드의 역할형 이름/도메인을 자연스러운 예시 데이터로 치환
    처리 규칙: DB 값을 직접 수정하지 않고 정확히 일치하는 기존 시드만 표시 보정한다.
    반환값: 공개 sample 관리자 사용자 표시 모델 dict
    갱신일: 2026-07-10
    """
    originalEmail = str(userModel.get("email") or "").lower()
    for storedEmail, name, email in PUBLIC_ADMIN_USER_COPY_OVERRIDES:
        if originalEmail == storedEmail:
            return {**userModel, "name": name, "email": email}
    return userModel


def readStoredAdminEmailCandidates(publicEmail: str) -> list[str]:
    """
    설명: 신규 관리자 이메일 중복 검사에 사용할 현재/기존 시드 이메일 후보 생성
    반환값: 정규화된 공개 이메일과 대응하는 기존 시드 이메일 목록
    갱신일: 2026-07-10
    """
    emailValue = str(publicEmail or "").lower()
    candidateList = [emailValue]
    for storedEmail, _displayName, email in PUBLIC_ADMIN_USER_COPY_OVERRIDES:
        if emailValue == email.lower():
            candidateList.append(storedEmail)
    return candidateList


def applyPublicAdminSetting(setting: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 기존 기본 관리자 설정만 현재 공개 샘플 기본값으로 표시 보정
    처리 규칙: 사용자가 저장한 다른 값은 유지하고 정확히 일치하는 옛 기본값만 치환한다.
    반환값: 공개 sample 관리자 설정 표시 모델 dict
    갱신일: 2026-07-10
    """
    if not isinstance(setting, dict):
        return readDefaultAdminSetting()
    result = dict(setting)
    if result.get("siteName") == PREVIOUS_ADMIN_SETTING_COPY["siteName"]:
        result["siteName"] = DEFAULT_ADMIN_SETTING["siteName"]
    if str(result.get("adminEmail") or "").lower() == PREVIOUS_ADMIN_SETTING_COPY["adminEmail"]:
        result["adminEmail"] = DEFAULT_ADMIN_SETTING["adminEmail"]
    return result


def toTaskModel(row: dict[str, Any]) -> dict[str, Any]:
    """
    설명: T_SAMPLE_TASK 조회 행을 프론트 응답용 camelCase 모델로 변환
    처리 규칙: amount는 float, createdAt은 문자열 그대로 유지
    반환값: 공개 sample 업무 모델 dict
    갱신일: 2026-03-06
    """
    source = convertKeysToCamelCase(row)
    return applyPublicTaskCopy({
        "id": readModelValue(source, "id", "taskNo"),
        "title": readModelValue(source, "title", "dataNm", defaultValue=""),
        "description": readModelValue(source, "description", "dataDesc", defaultValue=""),
        "owner": readModelValue(source, "owner", "ownerNm", defaultValue=""),
        "status": readModelValue(source, "status", "statCd", defaultValue=""),
        "amount": normalizeAmount(readModelValue(source, "amount", "amt")),
        "attachmentName": readModelValue(source, "attachmentName", "attachNm", defaultValue=""),
        "createdAt": readModelValue(source, "createdAt", "regDt"),
    })


def toAdminUserModel(row: dict[str, Any]) -> dict[str, Any]:
    """
    설명: T_SAMPLE_ADMIN_USER 조회 행을 프론트 응답용 camelCase 모델로 변환
    처리 규칙: notify 0/1 값을 bool로 치환하고 나머지 필드는 camelCase로 유지
    반환값: 공개 sample 관리자 사용자 모델 dict
    갱신일: 2026-03-06
    """
    source = convertKeysToCamelCase(row)
    return applyPublicAdminUserCopy({
        "id": readModelValue(source, "id", "userNo"),
        "name": readModelValue(source, "name", "userNm", defaultValue=""),
        "email": readModelValue(source, "email", "userEml", defaultValue=""),
        "role": readModelValue(source, "role", "roleCd", defaultValue=""),
        "status": readModelValue(source, "status", "statCd", defaultValue=""),
        "notifyEmail": bool(readModelValue(source, "notifyEmail", defaultValue=False)),
        "notifySms": bool(readModelValue(source, "notifySms", defaultValue=False)),
        "notifyPush": bool(readModelValue(source, "notifyPush", defaultValue=False)),
        "profileImageUrl": readModelValue(source, "profileImageUrl", "profileImgUrl", defaultValue=""),
        "createdAt": readModelValue(source, "createdAt", "regDt"),
    })


def toFormSubmissionModel(row: dict[str, Any] | None) -> dict[str, Any] | None:
    """
    설명: 공개 sample 폼 제출 행을 프론트 응답용 camelCase 모델로 변환
    실패 동작: 입력 행이 없으면 None 반환
    반환값: latest submission 응답용 dict 또는 None
    갱신일: 2026-03-06
    """
    if not row:
        return None
    source = convertKeysToCamelCase(row)
    result = {
        "id": readModelValue(source, "id", "formNo"),
        "name": readModelValue(source, "name", "userNm", defaultValue=""),
        "email": readModelValue(source, "email", "userEml", defaultValue=""),
        "phone": readModelValue(source, "phone", "phoneTxt", defaultValue=""),
        "category": readModelValue(source, "category", "categoryCd", defaultValue=""),
        "startDate": readModelValue(source, "startDate", "startDt", defaultValue=""),
        "endDate": readModelValue(source, "endDate", "endDt", defaultValue=""),
        "budgetRange": readModelValue(source, "budgetRange", "budgetRangeTxt", defaultValue=""),
        "requirement": readModelValue(source, "requirement", "requirementTxt", defaultValue=""),
        "selectedFeatures": readModelValue(source, "selectedFeatures", "featureJson"),
        "referenceUrl": readModelValue(source, "referenceUrl", "refUrl", defaultValue=""),
        "attachmentName": readModelValue(source, "attachmentName", "attachNm", defaultValue=""),
        "createdAt": readModelValue(source, "createdAt", "regDt"),
    }
    result["selectedFeatures"] = normalizeJsonCodeList(result.get("selectedFeatures"))
    return result


def toPublicFormSubmissionSummary(row: dict[str, Any] | None) -> dict[str, Any] | None:
    """
    설명: 공개 폼 메타에 노출 가능한 최근 제출 요약만 반환
    처리 규칙: 제출자 식별/연락처/요청 본문/첨부명 등 민감 필드는 제외한다.
    반환값: 공개 최신 제출 요약 dict 또는 None
    갱신일: 2026-06-04
    """
    submission = toFormSubmissionModel(row)
    if not submission:
        return None
    return {
        "id": submission.get("id"),
        "category": submission.get("category", ""),
        "selectedFeatures": submission.get("selectedFeatures", []),
        "createdAt": submission.get("createdAt"),
    }


@transaction("main_db")
async def saveConfigJson(configKey: str, value: Any) -> Any:
    """
    설명: T_SAMPLE_CONFIG에 JSON 값을 upsert 스타일로 저장
    처리 규칙: 기존 행 존재 시 update, 없으면 insert 수행
    반환값: 저장한 원본 value
    갱신일: 2026-03-06
    """
    db = ensureDbManager()
    configJson = json.dumps(value, ensure_ascii=False)
    existingRow = await db.fetchOneQuery("sample.configByKey", {"configKey": configKey})
    if existingRow:
        await db.executeQuery("sample.configUpdate", {"configKey": configKey, "configJson": configJson})
        return value
    await db.executeQuery("sample.configInsert", {"configKey": configKey, "configJson": configJson})
    return value


@transaction("main_db")
async def ensureBootstrapStorage() -> None:
    """
    설명: 공개 sample 전용 테이블/기본 시드/설정 JSON을 DB에 1회 보장
    처리 규칙: create table 후 bootstrap version 키 존재 여부로 시드 실행 결정
    부작용: T_SAMPLE_* 테이블 및 기본 데이터/설정 레코드 생성 가능
    갱신일: 2026-03-06
    """
    db = ensureDbManager()
    await db.executeQuery("sampleBootstrap.createConfigTable")
    await db.executeQuery("sampleBootstrap.createTaskTable")
    await db.executeQuery("sampleBootstrap.createFormTable")
    await db.executeQuery("sampleBootstrap.createAdminUserTable")
    versionRow = await db.fetchOneQuery(
        "sample.configByKey",
        {"configKey": SAMPLE_CONFIG_KEY["BOOTSTRAP_VERSION"]},
    )
    if versionRow:
        return
    await db.executeQuery("sampleBootstrap.seedTasks", buildSampleTaskSeedDateBind())
    await db.executeQuery("sampleBootstrap.seedAdminUsers")
    await db.executeQuery(
        "sample.configInsert",
        {
            "configKey": SAMPLE_CONFIG_KEY["ADMIN_SETTING"],
            "configJson": json.dumps(readDefaultAdminSetting(), ensure_ascii=False),
        },
    )
    await db.executeQuery(
        "sample.configInsert",
        {
            "configKey": SAMPLE_CONFIG_KEY["ROLE_PERMISSION_MAP"],
            "configJson": json.dumps(readDefaultRolePermissionMap(), ensure_ascii=False),
        },
    )
    await db.executeQuery(
        "sample.configInsert",
        {
            "configKey": SAMPLE_CONFIG_KEY["FORM_CATEGORY_CODE_LIST"],
            "configJson": json.dumps(list(DEFAULT_FORM_CATEGORY_CODE_LIST), ensure_ascii=False),
        },
    )
    await db.executeQuery(
        "sample.configInsert",
        {
            "configKey": SAMPLE_CONFIG_KEY["FORM_FEATURE_CODE_LIST"],
            "configJson": json.dumps(list(DEFAULT_FORM_FEATURE_CODE_LIST), ensure_ascii=False),
        },
    )
    await db.executeQuery(
        "sample.configInsert",
        {
            "configKey": SAMPLE_CONFIG_KEY["BOOTSTRAP_VERSION"],
            "configJson": json.dumps({"version": 1}, ensure_ascii=False),
        },
    )


async def ensureBootstrap() -> None:
    """
    설명: 공개 sample 전용 테이블/기본 시드/설정 JSON을 DB에 1회 보장
    처리 규칙: create table 후 bootstrap version 키 존재 여부로 시드 실행 결정
    부작용: T_SAMPLE_* 테이블 및 기본 데이터/설정 레코드 생성 가능
    갱신일: 2026-03-06
    """
    async with BOOTSTRAP_LOCK:
        await ensureBootstrapStorage()


async def getSampleOverview() -> dict[str, Any]:
    """
    설명: 공개 sample 허브/포트폴리오용 전체 카운트 요약 조회
    반환값: taskCount/adminUserCount/formSubmissionCount를 포함한 overview dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    row = await db.fetchOneQuery("sample.overview")
    result = convertKeysToCamelCase(row or {})
    result.setdefault("taskCount", 0)
    result.setdefault("adminUserCount", 0)
    result.setdefault("formSubmissionCount", 0)
    return result


async def getSampleDashboard() -> dict[str, Any]:
    """
    설명: 공개 sample 대시보드용 KPI/월별 추이/최근 업무 묶음 조회
    반환값: statusSummaryList/trendList/recentList를 담은 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    summaryRows = await db.fetchAllQuery("sample.dashboardStatusSummary")
    trendRows = await db.fetchAllQuery("sample.dashboardMonthlyTrend")
    recentRows = await db.fetchAllQuery("sample.dashboardRecent")
    summaryMap = {
        str(source.get("status") or source.get("statCd") or "").lower(): source
        for source in [convertKeysToCamelCase(row) for row in (summaryRows or [])]
    }
    statusSummaryList = []
    for statusCode in ("ready", "pending", "running", "done", "failed"):
        row = summaryMap.get(statusCode, {})
        statusSummaryList.append(
            {
                "status": statusCode,
                "count": int(readModelValue(row, "count", defaultValue=0) or 0),
                "amountSum": normalizeAmount(readModelValue(row, "amountSum")),
            }
        )
    trendList = []
    for row in trendRows or []:
        trendRow = convertKeysToCamelCase(row)
        monthKey = str(readModelValue(trendRow, "monthKey", defaultValue="") or "")
        monthParts = monthKey.split("-")
        label = monthKey
        if len(monthParts) == 2 and monthParts[1].isdigit():
            label = f"{int(monthParts[1])}월"
        trendList.append(
            {
                "label": label,
                "count": int(readModelValue(trendRow, "count", defaultValue=0) or 0),
                "amount": normalizeAmount(readModelValue(trendRow, "amountSum")),
            }
        )
    referenceDate = date.today()
    recentList = [
        applyPublicRecentTaskDate(toTaskModel(row), row, referenceDate=referenceDate)
        for row in (recentRows or [])
    ]
    return {
        "statusSummaryList": statusSummaryList,
        "trendList": trendList,
        "recentList": recentList,
    }


async def listSampleTasks(
    q: str | None = None,
    status: str | None = None,
    fromDate: str | None = None,
    toDate: str | None = None,
    page: int | None = None,
    size: int | None = None,
) -> dict[str, Any]:
    """
    설명: 공개 sample CRUD 목록을 검색/필터/페이지네이션 조건으로 조회
    반환값: sampleTaskList/total/page/size 구조의 목록 결과 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    config = getConfig()
    globalPolicy = config["API_POLICY"] if "API_POLICY" in config else None
    taskListPolicy = config["API_POLICY.sample.taskList"] if "API_POLICY.sample.taskList" in config else None
    absoluteListSizeCap = normalizePage(
        globalPolicy.get("absolute_list_size_cap") if globalPolicy else None,
        defaultValue=200,
        maxValue=500,
    )
    listSizeMax = normalizePage(
        taskListPolicy.get("list_size_max") if taskListPolicy else (globalPolicy.get("list_size_max") if globalPolicy else None),
        defaultValue=50,
        maxValue=absoluteListSizeCap,
    )
    keyword = normalizeText(q, maxLength=120)
    statusValue = normalizeText(status, maxLength=20).lower()
    if statusValue and statusValue not in ALLOWED_TASK_STATUS:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    fromDateValue = normalizeDateText(fromDate)
    toDateValue = normalizeDateText(toDate)
    if fromDateValue and toDateValue and fromDateValue > toDateValue:
        raise ServiceError("SAMPLE_422_INVALID_INPUT")
    fromDateBound = parseSqlDateBound(fromDateValue) or date(1, 1, 1)
    toDateBound = parseSqlDateBound(toDateValue)
    toDateExclusiveBound = toDateBound + timedelta(days=1) if toDateBound else date(9999, 12, 31)
    pageValue = normalizePage(page, defaultValue=1, maxValue=500)
    sizeValue = min(normalizePage(size, defaultValue=10, maxValue=absoluteListSizeCap), listSizeMax)
    bind = {
        "q": keyword,
        "qLike": f"%{keyword}%" if keyword else "",
        **buildPublicTaskSearchBind(keyword),
        "status": statusValue,
        "fromDate": fromDateBound,
        "toDateExclusive": toDateExclusiveBound,
        "limit": sizeValue,
        "offset": (pageValue - 1) * sizeValue,
    }
    rowList = await db.fetchAllQuery("sample.taskList", bind)
    countRow = await db.fetchOneQuery(
        "sample.taskListCount",
        {
            "q": bind["q"],
            "qLike": bind["qLike"],
            **{
                key: value
                for key, value in bind.items()
                if key.startswith("publicTitleMatch")
            },
            "status": bind["status"],
            "fromDate": bind["fromDate"],
            "toDateExclusive": bind["toDateExclusive"],
        },
    )
    return {
        "sampleTaskList": [toTaskModel(row) for row in (rowList or [])],
        "total": readTotalCount(countRow),
        "page": pageValue,
        "size": sizeValue,
        "q": keyword,
        "status": statusValue,
        "fromDate": fromDateValue,
        "toDate": toDateValue,
    }


async def getSampleTaskDetail(taskId: Any) -> dict[str, Any]:
    """
    설명: 공개 sample 업무 단건 상세 조회
    실패 동작: 대상 ID가 없으면 ServiceError("SAMPLE_404_NOT_FOUND") 발생
    반환값: 공개 sample 업무 상세 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    row = await db.fetchOneQuery("sample.taskDetail", {"id": normalizeId(taskId)})
    if not row:
        raise ServiceError("SAMPLE_404_NOT_FOUND")
    return toTaskModel(row)


@transaction("main_db")
async def createSampleTaskInTransaction(payload: dict[str, Any], idempotencyKey: str | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 업무 신규 생성
    실패 동작: 생성 후 조회 실패 시 ServiceError("SAMPLE_500_CREATE_FAILED") 발생
    반환값: 생성된 공개 sample 업무 dict
    갱신일: 2026-03-06
    """
    createPayload = toTaskPayload(payload)
    db = ensureDbManager()
    await db.executeQuery("sample.taskCreate", createPayload)
    createdRow = await db.fetchOneQuery("sample.taskFindCreatedCandidate", createPayload)
    if not createdRow:
        raise ServiceError("SAMPLE_500_CREATE_FAILED")
    return toTaskModel(createdRow)


async def createSampleTask(payload: dict[str, Any], idempotencyKey: str | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 업무 신규 생성
    실패 동작: 생성 후 조회 실패 시 ServiceError("SAMPLE_500_CREATE_FAILED") 발생
    반환값: 생성된 공개 sample 업무 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    scopeType = "sample.taskCreate"
    createPayload = toTaskPayload(payload)
    replay = await beginIdempotencyRequest(scopeType, idempotencyKey, createPayload)
    if replay.get("status") == "replay":
        return replay.get("result") or {}
    createdPendingEntry = replay.get("status") == "new"
    try:
        result = await createSampleTaskInTransaction(payload, idempotencyKey=None)
    except Exception:
        if createdPendingEntry:
            await discardIdempotencyReservation(scopeType, idempotencyKey)
        raise
    await completeIdempotencyRequest(scopeType, idempotencyKey, result)
    return result


async def updateSampleTask(taskId: Any, payload: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 공개 sample 업무 단건 수정
    실패 동작: 대상 ID가 없으면 ServiceError("SAMPLE_404_NOT_FOUND") 발생
    반환값: 수정 후 최신 공개 sample 업무 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    idValue = normalizeId(taskId)
    currentRow = await db.fetchOneQuery("sample.taskDetail", {"id": idValue})
    if not currentRow:
        raise ServiceError("SAMPLE_404_NOT_FOUND")
    taskModel = toTaskModel(currentRow)
    updatePayload = toTaskPayload(payload, taskModel)
    updatePayload["id"] = idValue
    await db.executeQuery("sample.taskUpdate", updatePayload)
    updatedRow = await db.fetchOneQuery("sample.taskDetail", {"id": idValue})
    if not updatedRow:
        raise ServiceError("SAMPLE_404_NOT_FOUND")
    return toTaskModel(updatedRow)


async def deleteSampleTask(taskId: Any) -> dict[str, Any]:
    """
    설명: 공개 sample 업무 단건 삭제
    실패 동작: 대상 ID가 없으면 ServiceError("SAMPLE_404_NOT_FOUND") 발생
    반환값: 삭제 완료된 ID 메타 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    idValue = normalizeId(taskId)
    currentRow = await db.fetchOneQuery("sample.taskDetail", {"id": idValue})
    if not currentRow:
        raise ServiceError("SAMPLE_404_NOT_FOUND")
    await db.executeQuery("sample.taskDelete", {"id": idValue})
    return {"id": idValue}


async def getSampleFormMeta() -> dict[str, Any]:
    """
    설명: 공개 sample 폼의 옵션 코드/제출 현황 메타를 함께 조회
    반환값: categoryCodeList/featureCodeList/submissionCount/latestSubmission dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    categoryRow = await db.fetchOneQuery("sample.configByKey", {"configKey": SAMPLE_CONFIG_KEY["FORM_CATEGORY_CODE_LIST"]})
    featureRow = await db.fetchOneQuery("sample.configByKey", {"configKey": SAMPLE_CONFIG_KEY["FORM_FEATURE_CODE_LIST"]})
    countRow = await db.fetchOneQuery("sample.formSubmitCount")
    latestRow = await db.fetchOneQuery("sample.formSubmitLatest")
    categoryCodeList = normalizeJsonCodeList(parseConfigRow(categoryRow, list(DEFAULT_FORM_CATEGORY_CODE_LIST)))
    featureCodeList = normalizeJsonCodeList(parseConfigRow(featureRow, list(DEFAULT_FORM_FEATURE_CODE_LIST)))
    return {
        "categoryCodeList": categoryCodeList,
        "featureCodeList": featureCodeList,
        "submissionCount": readTotalCount(countRow),
        "latestSubmission": toPublicFormSubmissionSummary(latestRow),
    }


@transaction("main_db")
async def submitSampleFormInTransaction(payload: dict[str, Any], idempotencyKey: str | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 복합 폼 제출값을 DB에 저장
    반환값: 저장된 최신 제출 행을 camelCase 모델로 반환
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    createPayload = toFormPayload(payload)
    await db.executeQuery("sample.formSubmitCreate", createPayload)
    latestRow = await db.fetchOneQuery("sample.formSubmitLatest")
    return toFormSubmissionModel(latestRow) or {}


async def submitSampleForm(payload: dict[str, Any], idempotencyKey: str | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 복합 폼 제출값 저장 전 idempotency replay를 선처리
    반환값: 저장된 최신 제출 행을 camelCase 모델로 반환
    갱신일: 2026-06-24
    """
    scopeType = "sample.formSubmit"
    createPayload = toFormPayload(payload)
    replay = await beginIdempotencyRequest(scopeType, idempotencyKey, createPayload)
    if replay.get("status") == "replay":
        return replay.get("result") or {}
    createdPendingEntry = replay.get("status") == "new"
    try:
        result = await submitSampleFormInTransaction(payload, idempotencyKey=None)
    except Exception:
        if createdPendingEntry:
            await discardIdempotencyReservation(scopeType, idempotencyKey)
        raise
    await completeIdempotencyRequest(scopeType, idempotencyKey, result)
    return result


async def listSampleAdminUsers(
    page: Any = None,
    size: Any = None,
) -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 사용자 목록을 페이지네이션 조건으로 조회
    반환값: sampleAdminUserList/total/page/size 구조의 목록 결과 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    config = getConfig()
    globalPolicy = config["API_POLICY"] if "API_POLICY" in config else None
    adminUserListPolicy = config["API_POLICY.sample.adminUserList"] if "API_POLICY.sample.adminUserList" in config else None
    absoluteListSizeCap = normalizePage(
        globalPolicy.get("absolute_list_size_cap") if globalPolicy else None,
        defaultValue=200,
        maxValue=500,
    )
    listSizeMax = normalizePage(
        adminUserListPolicy.get("list_size_max") if adminUserListPolicy else (globalPolicy.get("list_size_max") if globalPolicy else None),
        defaultValue=50,
        maxValue=absoluteListSizeCap,
    )
    pageValue = normalizePage(page, defaultValue=1, maxValue=500)
    sizeValue = min(normalizePage(size, defaultValue=50, maxValue=absoluteListSizeCap), listSizeMax)
    bind = {
        "limit": sizeValue,
        "offset": (pageValue - 1) * sizeValue,
    }
    rowList = await db.fetchAllQuery("sample.adminUserList", bind)
    countRow = await db.fetchOneQuery("sample.adminUserListCount")
    return {
        "sampleAdminUserList": [toAdminUserModel(row) for row in (rowList or [])],
        "total": readTotalCount(countRow),
        "page": pageValue,
        "size": sizeValue,
    }


@transaction("main_db")
async def createSampleAdminUserInTransaction(payload: dict[str, Any], idempotencyKey: str | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 사용자 신규 생성
    실패 동작: 이메일 중복 시 ServiceError("SAMPLE_409_ALREADY_EXISTS") 발생
    반환값: 생성된 사용자 모델 dict
    갱신일: 2026-03-06
    """
    createPayload = toAdminUserPayload(payload)
    db = ensureDbManager()
    for emailCandidate in readStoredAdminEmailCandidates(createPayload["email"]):
        duplicateRow = await db.fetchOneQuery("sample.adminUserExistsByEmail", {"email": emailCandidate})
        if duplicateRow:
            raise ServiceError("SAMPLE_409_ALREADY_EXISTS")
    await db.executeQuery("sample.adminUserCreate", createPayload)
    createdRow = await db.fetchOneQuery("sample.adminUserFindCreatedCandidate", {"email": createPayload["email"]})
    if not createdRow:
        raise ServiceError("SAMPLE_500_CREATE_FAILED")
    return toAdminUserModel(createdRow)


async def createSampleAdminUser(payload: dict[str, Any], idempotencyKey: str | None = None) -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 사용자 신규 생성
    실패 동작: 이메일 중복 시 ServiceError("SAMPLE_409_ALREADY_EXISTS") 발생
    반환값: 생성된 사용자 모델 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    scopeType = "sample.adminUserCreate"
    createPayload = toAdminUserPayload(payload)
    replay = await beginIdempotencyRequest(scopeType, idempotencyKey, createPayload)
    if replay.get("status") == "replay":
        return replay.get("result") or {}
    createdPendingEntry = replay.get("status") == "new"
    try:
        result = await createSampleAdminUserInTransaction(payload, idempotencyKey=None)
    except Exception:
        if createdPendingEntry:
            await discardIdempotencyReservation(scopeType, idempotencyKey)
        raise
    await completeIdempotencyRequest(scopeType, idempotencyKey, result)
    return result


async def updateSampleAdminUser(userId: Any, payload: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 사용자 단건 수정
    실패 동작: 대상 사용자가 없으면 ServiceError("SAMPLE_404_NOT_FOUND") 발생
    반환값: 수정된 사용자 모델 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    idValue = normalizeId(userId)
    currentRow = await db.fetchOneQuery("sample.adminUserDetail", {"id": idValue})
    if not currentRow:
        raise ServiceError("SAMPLE_404_NOT_FOUND")
    userModel = toAdminUserModel(currentRow)
    updatePayload = toAdminUserPayload(payload, userModel)
    duplicateRow = await db.fetchOneQuery(
        "sample.adminUserExistsByEmailExcludingId",
        {"id": idValue, "email": updatePayload["email"]},
    )
    if duplicateRow:
        raise ServiceError("SAMPLE_409_ALREADY_EXISTS")
    await db.executeQuery(
        "sample.adminUserUpdate",
        {
            "id": idValue,
            "name": updatePayload["name"],
            "email": updatePayload["email"],
            "role": updatePayload["role"],
            "status": updatePayload["status"],
            "notifyEmail": updatePayload["notifyEmail"],
            "notifySms": updatePayload["notifySms"],
            "notifyPush": updatePayload["notifyPush"],
            "profileImageUrl": updatePayload["profileImageUrl"],
        },
    )
    updatedRow = await db.fetchOneQuery("sample.adminUserDetail", {"id": idValue})
    if not updatedRow:
        raise ServiceError("SAMPLE_404_NOT_FOUND")
    return toAdminUserModel(updatedRow)


async def getSampleAdminSettings() -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 설정/권한 맵 JSON 조회
    반환값: systemSetting/rolePermissionMap를 담은 dict
    갱신일: 2026-03-06
    """
    await ensureBootstrap()
    db = ensureDbManager()
    systemRow = await db.fetchOneQuery("sample.configByKey", {"configKey": SAMPLE_CONFIG_KEY["ADMIN_SETTING"]})
    permissionRow = await db.fetchOneQuery("sample.configByKey", {"configKey": SAMPLE_CONFIG_KEY["ROLE_PERMISSION_MAP"]})
    return {
        "systemSetting": applyPublicAdminSetting(parseConfigRow(systemRow, readDefaultAdminSetting())),
        "rolePermissionMap": parseConfigRow(permissionRow, readDefaultRolePermissionMap()),
    }


async def updateSampleAdminSettings(payload: dict[str, Any]) -> dict[str, Any]:
    """
    설명: 공개 sample 관리자 시스템 설정 JSON 저장
    실패 동작: 필수값/숫자 제약 위반 시 ServiceError("SAMPLE_422_INVALID_INPUT") 발생
    반환값: 저장 후 최신 systemSetting/rolePermissionMap dict
    갱신일: 2026-03-06
    """
    nextSetting = {
        "siteName": normalizeText(payload.get("siteName"), required=True, maxLength=80),
        "adminEmail": normalizeEmail(payload.get("adminEmail")),
        "maintenanceMode": normalizeBool(payload.get("maintenanceMode")),
        "sessionTimeout": normalizePage(payload.get("sessionTimeout"), defaultValue=60, maxValue=1440),
        "maxUploadMb": normalizePage(payload.get("maxUploadMb"), defaultValue=30, maxValue=1000),
    }
    await saveConfigJson(SAMPLE_CONFIG_KEY["ADMIN_SETTING"], nextSetting)
    return await getSampleAdminSettings()
