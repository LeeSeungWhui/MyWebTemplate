#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
RULE_GATE_PY="${RULE_GATE_PY:-/home/hwi/.codex/skills/myweb-rule-gate/scripts/rule_gate.py}"

if [[ ! -d "$ROOT/.git" ]]; then
  echo "[FAIL] git repository not found: $ROOT"
  exit 1
fi

if [[ ! -f "$RULE_GATE_PY" ]]; then
  echo "[FAIL] rule gate script not found: $RULE_GATE_PY"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "[FAIL] python3 is required"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
FIXTURE_REPO="$TMP_DIR/rule-gate-backend-fixture"
OUTPUT_FILE="$TMP_DIR/rule-gate-backend-output.log"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

mkdir -p "$FIXTURE_REPO"
git -C "$FIXTURE_REPO" init -q

mkdir -p \
  "$FIXTURE_REPO/docs/frontend-web" \
  "$FIXTURE_REPO/docs/frontend-app" \
  "$FIXTURE_REPO/docs/backend" \
  "$FIXTURE_REPO/backend/query" \
  "$FIXTURE_REPO/backend/service" \
  "$FIXTURE_REPO/backend/router" \
  "$FIXTURE_REPO/backend/lib"

cp "$ROOT/docs/frontend-web/codding-rules-frontend.md" "$FIXTURE_REPO/docs/frontend-web/codding-rules-frontend.md"
cp "$ROOT/docs/frontend-web/rule-gate-usestate-allowlist.txt" "$FIXTURE_REPO/docs/frontend-web/rule-gate-usestate-allowlist.txt"
cp "$ROOT/docs/frontend-app/codding-rules-rn.md" "$FIXTURE_REPO/docs/frontend-app/codding-rules-rn.md"
cp "$ROOT/docs/frontend-app/rule-gate-usestate-allowlist.txt" "$FIXTURE_REPO/docs/frontend-app/rule-gate-usestate-allowlist.txt"
cp "$ROOT/docs/backend/codding-rules-backend.md" "$FIXTURE_REPO/docs/backend/codding-rules-backend.md"
cp "$ROOT/docs/common-rules.md" "$FIXTURE_REPO/docs/common-rules.md"

cat > "$FIXTURE_REPO/backend/service/SqlInterpolationService.py" <<'EOF'
"""
파일명: backend/service/SqlInterpolationService.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 SQL 문자열 보간 fixture
"""


def buildUnsafeQuery(userId: str) -> str:
    """
    설명: f-string SQL 보간 금지 케이스를 생성한다.
    갱신일: 2026-02-27
    """
    return f"""
SELECT USER_NO
  FROM T_USER
 WHERE USER_ID = '{userId}'
"""


def buildUnsafeQueryWithFormat(userId: str) -> str:
    """
    설명: SQL .format 치환 금지 케이스를 생성한다.
    갱신일: 2026-02-27
    """
    return """
SELECT USER_NO
  FROM T_USER
 WHERE USER_ID = '{}'
""".format(userId)
EOF

cat > "$FIXTURE_REPO/backend/service/SafeTextService.py" <<'EOF'
"""
파일명: backend/service/SafeTextService.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 SQL 비해당 문자열 fixture
"""


def buildLogLine(userId: str) -> str:
    """
    설명: 일반 문자열 format은 SQL 보간 규칙 대상이 아니다.
    갱신일: 2026-02-27
    """
    return "user={}".format(userId)


def buildDebugText(userId: str) -> str:
    """
    설명: 일반 f-string은 SQL 보간 규칙 대상이 아니다.
    갱신일: 2026-02-27
    """
    return f"debug-user:{userId}"
EOF

cat > "$FIXTURE_REPO/backend/service/ResponseHandlingService.py" <<'EOF'
"""
파일명: backend/service/ResponseHandlingService.py
작성자: LSH
갱신일: 2026-03-06
설명: 회귀 검증용 서비스 레이어 Response 직접 처리 fixture
"""

from fastapi.responses import JSONResponse


def makeBadResponse():
    """
    설명: 서비스에서 JSONResponse를 직접 생성하는 위반 케이스.
    갱신일: 2026-03-06
    """
    return JSONResponse(status_code=200, content={"status": True})
EOF

cat > "$FIXTURE_REPO/backend/service/ResponseHandlingSafeService.py" <<'EOF'
"""
파일명: backend/service/ResponseHandlingSafeService.py
작성자: LSH
갱신일: 2026-03-06
설명: 회귀 검증용 서비스 레이어 응답 안전 fixture
"""


def makeDomainPayload() -> dict:
    """
    설명: 서비스는 도메인 payload만 반환하는 정상 케이스.
    갱신일: 2026-03-06
    """
    return {"status": True}
EOF

cat > "$FIXTURE_REPO/backend/router/AuthRouter.py" <<'EOF'
"""
파일명: backend/router/AuthRouter.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 no-store 누락 fixture
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/login")
async def login():
    """
    설명: no-store 누락 JSON 응답 케이스.
    갱신일: 2026-02-27
    """
    return JSONResponse(status_code=401, content={"status": False}, headers={"WWW-Authenticate": "Bearer"})


@router.post("/refresh")
async def refresh():
    """
    설명: no-store 포함 JSON 응답 케이스.
    갱신일: 2026-02-27
    """
    return JSONResponse(
        status_code=401,
        content={"status": False},
        headers={"WWW-Authenticate": "Bearer", "Cache-Control": "no-store"},
    )
EOF

cat > "$FIXTURE_REPO/backend/router/DirectDbRouter.py" <<'EOF'
"""
파일명: backend/router/DirectDbRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: 회귀 검증용 라우터 DB 직접 호출 fixture
"""

from fastapi import APIRouter

from lib.Database import fetchOneQuery

router = APIRouter(prefix="/api/v1/direct-db", tags=["direct-db"])


@router.get("/item")
async def getItem():
    """
    설명: 라우터에서 DB를 직접 조회하는 위반 케이스.
    갱신일: 2026-03-06
    """
    row = await fetchOneQuery("demo.select", {"id": 1})
    return {"status": True, "result": row}
EOF

cat > "$FIXTURE_REPO/backend/router/SafeRouter.py" <<'EOF'
"""
파일명: backend/router/SafeRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: 회귀 검증용 라우터 서비스 경유 fixture
"""

from fastapi import APIRouter

from service import DashboardService

router = APIRouter(prefix="/api/v1/safe", tags=["safe"])


@router.get("/item")
async def getItem():
    """
    설명: 라우터에서 서비스를 경유하는 정상 케이스.
    갱신일: 2026-03-06
    """
    result = await DashboardService.listDataTemplates(userId="demo", limit=1)
    return {"status": True, "result": result}
EOF

cat > "$FIXTURE_REPO/backend/router/TxControlRouter.py" <<'EOF'
"""
파일명: backend/router/TxControlRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-023 검출 fixture (router commit 제어 금지)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/tx-control", tags=["tx-control"])


@router.post("/bad")
async def badTxControl(db):
    """
    설명: router 계층 commit 제어 위반 케이스.
    갱신일: 2026-03-06
    """
    db.commit()
    return {"status": True}
EOF

cat > "$FIXTURE_REPO/backend/service/TransactionBoundaryBadService.py" <<'EOF'
"""
파일명: backend/service/TransactionBoundaryBadService.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-023 검출 fixture (service 다중 쓰기 트랜잭션 누락)
"""


async def createWithAudit(db, payload: dict):
    """
    설명: 쓰기 2건 이상을 트랜잭션 경계 없이 수행하는 위반 케이스.
    갱신일: 2026-03-06
    """
    await db.fetchOneQuery("dashboard.create", {"title": payload.get("title", "")})
    await db.executeQuery("audit.insert", {"event": "dashboard.create"})
    return {"ok": True}
EOF

cat > "$FIXTURE_REPO/backend/service/TransactionBoundaryGoodService.py" <<'EOF'
"""
파일명: backend/service/TransactionBoundaryGoodService.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-023 오탐 방지 fixture (service 트랜잭션 경계 적용)
"""


async def createWithAudit(db, payload: dict):
    """
    설명: 다중 쓰기 작업을 단일 트랜잭션으로 묶는 정상 케이스.
    갱신일: 2026-03-06
    """
    async with db.transaction():
        await db.fetchOneQuery("dashboard.create", {"title": payload.get("title", "")})
        await db.executeQuery("audit.insert", {"event": "dashboard.create"})
    return {"ok": True}
EOF

cat > "$FIXTURE_REPO/backend/router/IdempotencyBadRouter.py" <<'EOF'
"""
파일명: backend/router/IdempotencyBadRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-024 검출 fixture (고위험 mutation idempotency 누락)
"""

from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])


@router.post("/create")
async def createPayment(payload: dict):
    """
    설명: idempotency 계약 없이 생성 mutation을 수행하는 위반 케이스.
    갱신일: 2026-03-06
    """
    return {"status": True, "result": payload}
EOF

cat > "$FIXTURE_REPO/backend/router/IdempotencyGoodRouter.py" <<'EOF'
"""
파일명: backend/router/IdempotencyGoodRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-024 오탐 방지 fixture (idempotency 계약 명시)
"""

from fastapi import APIRouter, Header

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])


@router.post("/create")
async def createPayment(payload: dict, idempotencyKey: str = Header(alias="Idempotency-Key")):
    """
    설명: Idempotency-Key 수집/검증을 포함한 정상 케이스.
    갱신일: 2026-03-06
    """
    return {"status": True, "idempotencyKey": idempotencyKey, "result": payload}
EOF

cat > "$FIXTURE_REPO/backend/service/ExternalIoBadService.py" <<'EOF'
"""
파일명: backend/service/ExternalIoBadService.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-025 검출 fixture (외부 HTTP timeout 누락)
"""

import requests
import httpx


async def loadExternalData(url: str) -> dict:
    """
    설명: timeout 없이 외부 호출하는 위반 케이스.
    갱신일: 2026-03-06
    """
    requests.get(url)
    async with httpx.AsyncClient() as client:
        await client.get(url)
    return {"ok": True}
EOF

cat > "$FIXTURE_REPO/backend/service/ExternalIoGoodService.py" <<'EOF'
"""
파일명: backend/service/ExternalIoGoodService.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-025 오탐 방지 fixture (외부 HTTP timeout 명시)
"""

import requests
import httpx


async def loadExternalData(url: str) -> dict:
    """
    설명: timeout을 명시한 외부 호출 정상 케이스.
    갱신일: 2026-03-06
    """
    requests.get(url, timeout=5)
    async with httpx.AsyncClient(timeout=5) as client:
        await client.get(url)
    return {"ok": True}
EOF

cat > "$FIXTURE_REPO/backend/router/PageSizeBadRouter.py" <<'EOF'
"""
파일명: backend/router/PageSizeBadRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-026 검출 fixture (목록 size clamp 누락)
"""

from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.get("/list")
async def listTasks(page: int = Query(default=1), size: int = Query(default=20)):
    """
    설명: size 상한 clamp 없이 목록을 반환하는 위반 케이스.
    갱신일: 2026-03-06
    """
    return {"page": page, "size": size}
EOF

cat > "$FIXTURE_REPO/backend/router/PageSizeGoodRouter.py" <<'EOF'
"""
파일명: backend/router/PageSizeGoodRouter.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-026 오탐 방지 fixture (목록 size clamp 적용)
"""

from fastapi import APIRouter, Query

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.get("/list")
async def listTasks(page: int = Query(default=1), size: int = Query(default=20)):
    """
    설명: size 상한 clamp를 적용하는 정상 케이스.
    갱신일: 2026-03-06
    """
    listSizeMax = 100
    safeSize = min(size, listSizeMax)
    return {"page": page, "size": safeSize}
EOF

cat > "$FIXTURE_REPO/backend/router/ProfileRouter.py" <<'EOF'
"""
파일명: backend/router/ProfileRouter.py
작성자: LSH
갱신일: 2026-03-02
설명: 회귀 검증용 인증 필요 라우터 no-store 누락 fixture
"""

from fastapi import APIRouter, Depends

from lib.Auth import getCurrentUser
from lib.Response import successResponse

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])


@router.get("/me")
async def getMyProfile(user=Depends(getCurrentUser)):
    """
    설명: 인증 필요 응답에서 no-store가 누락된 케이스.
    갱신일: 2026-03-02
    """
    return successResponse(result={"userId": "demo@demo.demo"})
EOF

cat > "$FIXTURE_REPO/backend/router/DashboardRouter.py" <<'EOF'
"""
파일명: backend/router/DashboardRouter.py
작성자: LSH
갱신일: 2026-03-02
설명: 회귀 검증용 인증 필요 라우터 no-store/소유권 누락 fixture
"""

from fastapi import APIRouter, Depends

from lib.Auth import getCurrentUser
from lib.Response import successResponse
from service import DashboardService

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("")
async def listDashboard(user=Depends(getCurrentUser)):
    """
    설명: 인증 필요 응답에서 no-store와 userId 바인딩이 누락된 케이스.
    갱신일: 2026-03-02
    """
    result = await DashboardService.listDataTemplates(limit=10)
    return successResponse(result=result)
EOF

cat > "$FIXTURE_REPO/backend/service/DashboardService.py" <<'EOF'
"""
파일명: backend/service/DashboardService.py
작성자: LSH
갱신일: 2026-03-02
설명: 회귀 검증용 Dashboard 서비스 소유권 시그니처 누락 fixture
"""


async def listDataTemplates(limit: int = 50):
    """
    설명: userId 인자 누락 회귀 검증 케이스.
    갱신일: 2026-03-02
    """
    return [{"id": 1, "limit": limit}]
EOF

cat > "$FIXTURE_REPO/backend/server.py" <<'EOF'
"""
파일명: backend/server.py
작성자: LSH
갱신일: 2026-03-02
설명: 회귀 검증용 글로벌 예외 핸들러 no-store 누락 fixture
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from lib.Response import errorResponse

app = FastAPI()


@app.exception_handler(Exception)
async def globalExceptionHandler(request: Request, exc: Exception):
    """
    설명: 글로벌 500 표준 에러 응답 no-store 누락 케이스.
    갱신일: 2026-03-02
    """
    return JSONResponse(
        status_code=500,
        content=errorResponse(
            message="internal server error",
            result={"path": request.url.path},
            code="HTTP_500_INTERNAL",
        ),
    )


@app.exception_handler(RequestValidationError)
async def requestValidationExceptionHandler(request: Request, exc: RequestValidationError):
    """
    설명: 422 표준 에러 응답 no-store 누락 케이스.
    갱신일: 2026-03-02
    """
    return JSONResponse(
        status_code=422,
        content=errorResponse(
            message="invalid request",
            result={"path": request.url.path},
            code="VALID_422_REQUEST",
        ),
    )
EOF

cat > "$FIXTURE_REPO/backend/lib/Auth.py" <<'EOF'
"""
파일명: backend/lib/Auth.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 함수 헤더 날짜 형식 fixture
"""


def createAccessToken() -> dict:
    """
    설명: 날짜 형식 위반을 검증한다.
    갱신일: 2026-02-XX
    """
    return {"token": "demo"}
EOF

cat > "$FIXTURE_REPO/backend/lib/NoDocInit.py" <<'EOF'
"""
파일명: backend/lib/NoDocInit.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 __init__ 함수 헤더 누락 fixture
"""


class NoDocInit:
    def __init__(self, value: str):
        self.value = value
EOF

cat > "$FIXTURE_REPO/backend/service/ImportIntegrityBad.py" <<'EOF'
"""
파일명: backend/service/ImportIntegrityBad.py
작성자: LSH
갱신일: 2026-02-27
설명: 선행 실행문 이후 import 재등장 위반 fixture
"""

import os

SERVICE_VERSION = "v1"
from datetime import datetime


def currentStamp() -> str:
    """
    설명: import 블록 오염 검증용 현재 시각 문자열을 반환한다.
    갱신일: 2026-02-27
    """
    return datetime.now(tz=None).isoformat()
EOF

cat > "$FIXTURE_REPO/backend/lib/ImportIntegrityGood.py" <<'EOF'
"""
파일명: backend/lib/ImportIntegrityGood.py
작성자: LSH
갱신일: 2026-02-27
설명: TYPE_CHECKING/try fallback 포함 import 블록 정상 fixture
"""

from typing import TYPE_CHECKING
import logging

if TYPE_CHECKING:
    from typing import Any

try:
    import bcrypt
except Exception:
    bcrypt = None

LOGGER = logging.getLogger(__name__)
EOF

cat > "$FIXTURE_REPO/backend/lib/Database.py" <<'EOF'
"""
파일명: backend/lib/Database.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 SQL 리터럴 마스킹 가드 누락 fixture
"""

import os


class DatabaseManager:
    def shouldRevealSqlLiteralValues(self) -> bool:
        """
        설명: SQL 로그 리터럴 노출 여부를 반환한다.
        갱신일: 2026-02-27
        """
        raw = str(os.getenv("SQL_LOG_LITERAL_VALUES", "")).strip().lower()
        return raw in {"1", "true", "yes", "on"}

    def toSqlLiteralForLog(self, value, revealLiteral: bool) -> str:
        """
        설명: 파라미터 값을 SQL 리터럴 문자열로 변환한다.
        갱신일: 2026-02-27
        """
        if not revealLiteral:
            return "'***'"
        if value is None:
            return "NULL"
        return f"'{value}'"

    def renderQueryForLog(self, normalizedQuery: str, values: dict, revealLiteral: bool) -> str:
        """
        설명: 플레이스홀더를 리터럴로 치환해 SQL 로그 문자열을 만든다.
        갱신일: 2026-02-27
        """
        params = values or {}
        return normalizedQuery.replace(":password", self.toSqlLiteralForLog(params.get("password"), revealLiteral))
EOF

cat > "$FIXTURE_REPO/backend/service/EnglishCommentService.py" <<'EOF'
"""
파일명: backend/service/EnglishCommentService.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 영문 인라인 주석 fixture
"""


def testCommentRule() -> str:
    """
    설명: 주석 한글 규칙 위반 케이스를 만든다.
    갱신일: 2026-02-27
    """
    # Intentionally trigger english inline comment for regression.
    return "ok"
EOF

cat > "$FIXTURE_REPO/backend/service/CommentSpacingBadService.py" <<'EOF'
"""
파일명: backend/service/CommentSpacingBadService.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-022 검출 fixture (독립 주석 윗줄 공백 누락)
"""


def useCommentSpacingBad() -> str:
    """
    설명: 독립 주석 윗줄 공백 규칙 위반 케이스.
    갱신일: 2026-03-06
    """
    defaultRole = "viewer"
    # 주석 윗줄 공백 1줄 누락
    nextRole = f"{defaultRole}-next"
    return nextRole
EOF

cat > "$FIXTURE_REPO/backend/service/CommentSpacingGoodService.py" <<'EOF'
"""
파일명: backend/service/CommentSpacingGoodService.py
작성자: LSH
갱신일: 2026-03-06
설명: BE-A-022 오탐 방지 fixture (독립 주석 윗줄 공백 1줄 준수)
"""


def useCommentSpacingGood() -> str:
    """
    설명: 독립 주석 윗줄 공백 규칙 준수 케이스.
    갱신일: 2026-03-06
    """
    defaultRole = "viewer"

    # 주석 윗줄 공백 1줄 준수
    nextRole = f"{defaultRole}-next"
    return nextRole
EOF

cat > "$FIXTURE_REPO/backend/lib/DocQualityBad.py" <<'EOF'
"""
파일명: backend/lib/DocQualityBad.py
작성자: LSH
갱신일: 2026-02-27
설명: 회귀 검증용 docstring 상세도 부족 fixture
"""


def validateEmail() -> str:
    """
    설명: validate 로직을 수행한다.
    갱신일: 2026-02-27
    """
    return "ok"
EOF

cat > "$FIXTURE_REPO/backend/query/bad_naming.sql" <<'EOF'
-- name: badNaming.select
SELECT VALUE
  FROM TEST_TRANSACTION;
EOF

cat > "$FIXTURE_REPO/backend/query/dashboard.sql" <<'EOF'
-- name: dashboard.list
SELECT DATA_NO AS ID
  FROM T_DATA
 WHERE STAT_CD = :status;

-- name: dashboard.listCount
SELECT COUNT(*) AS TOTAL_COUNT
  FROM T_DATA
 WHERE STAT_CD = :status;

-- name: dashboard.detail
SELECT DATA_NO AS ID
  FROM T_DATA
 WHERE DATA_NO = :id;

-- name: dashboard.create
INSERT INTO T_DATA
     ( DATA_NM
     , STAT_CD
     )
VALUES ( :title
       , :status
       );

-- name: dashboard.findCreatedCandidate
SELECT DATA_NO AS ID
  FROM T_DATA
 WHERE DATA_NM = :title;

-- name: dashboard.update
UPDATE T_DATA
   SET DATA_NM = :title
 WHERE DATA_NO = :id;

-- name: dashboard.delete
DELETE
  FROM T_DATA
 WHERE DATA_NO = :id;

-- name: dashboard.statusSummary
SELECT STAT_CD AS STATUS
     , COUNT(*) AS COUNT
  FROM T_DATA
 GROUP BY STAT_CD;
EOF

git -C "$FIXTURE_REPO" add .

set +e
python3 "$RULE_GATE_PY" "$FIXTURE_REPO" --all > "$OUTPUT_FILE"
RULE_GATE_EXIT_CODE=$?
set -e

if [[ $RULE_GATE_EXIT_CODE -eq 0 ]]; then
  echo "[FAIL] backend regression fixture expected non-zero exit (BE-A-002 ERROR) but got 0"
  echo "[INFO] output file: $OUTPUT_FILE"
  cat "$OUTPUT_FILE"
  exit 1
fi

assert_contains() {
  local pattern="$1"
  if ! grep -Fq -- "$pattern" "$OUTPUT_FILE"; then
    echo "[FAIL] expected pattern not found: $pattern"
    echo "[INFO] output file: $OUTPUT_FILE"
    cat "$OUTPUT_FILE"
    exit 1
  fi
}

assert_not_contains() {
  local pattern="$1"
  if grep -Fq -- "$pattern" "$OUTPUT_FILE"; then
    echo "[FAIL] unexpected pattern found: $pattern"
    echo "[INFO] output file: $OUTPUT_FILE"
    cat "$OUTPUT_FILE"
    exit 1
  fi
}

assert_count_at_least() {
  local pattern="$1"
  local expected_count="$2"
  local actual_count
  actual_count="$(grep -Fo -- "$pattern" "$OUTPUT_FILE" | wc -l | tr -d ' ')"
  if (( actual_count < expected_count )); then
    echo "[FAIL] expected at least $expected_count matches but found $actual_count: $pattern"
    echo "[INFO] output file: $OUTPUT_FILE"
    cat "$OUTPUT_FILE"
    exit 1
  fi
}

# Must Catch
assert_count_at_least "SQL 문자열 보간/치환 금지. 바인드 파라미터 사용 backend/service/SqlInterpolationService.py" 2
assert_contains "BE-A-002 (BE 8 DB/SQL 규칙)"
assert_contains "서비스 레이어에서 Response/쿠키 직접 처리 금지 backend/service/ResponseHandlingService.py"
assert_contains "라우터에서 DB 직접 호출 지양. 서비스 경유 권장 backend/router/DirectDbRouter.py"
assert_contains "인증/세션 JSON 응답은 Cache-Control: no-store 권장 backend/router/AuthRouter.py"
assert_contains "인증 필요 라우터 응답은 Cache-Control: no-store 권장 backend/router/ProfileRouter.py"
assert_contains "인증 필요 라우터 응답은 Cache-Control: no-store 권장 backend/router/DashboardRouter.py"
assert_contains "글로벌 500 표준 에러 응답에 Cache-Control: no-store 권장 backend/server.py"
assert_contains "422 표준 에러 응답에 Cache-Control: no-store 권장 backend/server.py"
assert_contains "함수 'createAccessToken' docstring 갱신일은 YYYY-MM-DD 형식 권장(현재: 2026-02-XX) backend/lib/Auth.py"
assert_contains "함수 '__init__' docstring(설명/갱신일) 권장 backend/lib/NoDocInit.py"
assert_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) backend/service/EnglishCommentService.py"
assert_contains "독립 주석(\`#\`) 위에는 빈 줄을 정확히 1줄 둬야 함 backend/service/CommentSpacingBadService.py"
assert_contains "router/lib 계층에서 commit/rollback 제어 금지. 트랜잭션 경계는 service에서 관리해야 함 backend/router/TxControlRouter.py"
assert_contains "service 함수 'createWithAudit'에서 쓰기 작업 2건 감지. 단일 트랜잭션 경계(runInTransaction/with transaction)로 묶어야 함 backend/service/TransactionBoundaryBadService.py"
assert_contains "mutation 라우트 'createPayment'는 Idempotency-Key 계약(수집/검증/중복방지) 필요 backend/router/IdempotencyBadRouter.py"
assert_contains "외부 HTTP 호출에는 timeout 명시가 필요함(requests/httpx) backend/service/ExternalIoBadService.py"
assert_contains "목록/검색 함수 'listTasks'에서 size 상한 clamp 누락 가능성. config(API_POLICY) 기반 max 적용 필요 backend/router/PageSizeBadRouter.py"
assert_contains "DB 오브젝트명 prefix는 T_/V_ 권장(현재: TEST_TRANSACTION) backend/query/bad_naming.sql"
assert_contains "SQL_LOG_LITERAL_VALUES 활성화 경로에서는 민감 파라미터(PII/시크릿) 마스킹 가드를 함께 구현해야 함 backend/lib/Database.py"
assert_contains "SQL 로그 리터럴 노출 경로에서는 list/dict 중첩 문자열 민감값도 마스킹해야 함 backend/lib/Database.py"
assert_contains "import 블록 오염: 선행 실행문 이후 import 선언 금지 backend/service/ImportIntegrityBad.py"
assert_contains "함수 'validateEmail' docstring 설명 품질 개선 권장 (템플릿 문구 '로직을 수행한다' 사용) backend/lib/DocQualityBad.py"
assert_contains "함수 'validateEmail' docstring 상세도 부족: 처리 규칙/실패 동작/부작용/반환값 의미 중 1개 이상 권장 backend/lib/DocQualityBad.py"
assert_contains "DashboardRouter에서 DashboardService.listDataTemplates 호출 시 userId=user.username 바인딩을 전달해야 함 backend/router/DashboardRouter.py"
assert_contains "DashboardService.listDataTemplates 시그니처에 userId 인자를 포함해야 함 backend/service/DashboardService.py"
assert_contains "dashboard.list 쿼리는 USER_ID = :userId 소유권 조건을 포함해야 함 backend/query/dashboard.sql"
assert_contains "dashboard.create는 INSERT 컬럼 목록에 USER_ID를 포함해야 함 backend/query/dashboard.sql"
assert_contains "dashboard.create는 VALUES 바인딩에 :userId를 포함해야 함 backend/query/dashboard.sql"

# Must Ignore
assert_not_contains "SQL 문자열 보간/치환 금지. 바인드 파라미터 사용 backend/service/SafeTextService.py"
assert_not_contains "서비스 레이어에서 Response/쿠키 직접 처리 금지 backend/service/ResponseHandlingSafeService.py"
assert_not_contains "라우터에서 DB 직접 호출 지양. 서비스 경유 권장 backend/router/SafeRouter.py"
assert_not_contains "import 블록 오염: 선행 실행문 이후 import 선언 금지 backend/lib/ImportIntegrityGood.py"
assert_not_contains "독립 주석(\`#\`) 위에는 빈 줄을 정확히 1줄 둬야 함 backend/service/CommentSpacingGoodService.py"
assert_not_contains "service 함수 'createWithAudit'에서 쓰기 작업 2건 감지. 단일 트랜잭션 경계(runInTransaction/with transaction)로 묶어야 함 backend/service/TransactionBoundaryGoodService.py"
assert_not_contains "mutation 라우트 'createPayment'는 Idempotency-Key 계약(수집/검증/중복방지) 필요 backend/router/IdempotencyGoodRouter.py"
assert_not_contains "외부 HTTP 호출에는 timeout 명시가 필요함(requests/httpx) backend/service/ExternalIoGoodService.py"
assert_not_contains "목록/검색 함수 'listTasks'에서 size 상한 clamp 누락 가능성. config(API_POLICY) 기반 max 적용 필요 backend/router/PageSizeGoodRouter.py"

echo "[PASS] backend rule-gate regression fixtures passed"
