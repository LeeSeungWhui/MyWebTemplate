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
assert_contains "인증/세션 JSON 응답은 Cache-Control: no-store 권장 backend/router/AuthRouter.py"
assert_contains "함수 'createAccessToken' docstring 갱신일은 YYYY-MM-DD 형식 권장(현재: 2026-02-XX) backend/lib/Auth.py"
assert_contains "함수 '__init__' docstring(설명/갱신일) 권장 backend/lib/NoDocInit.py"
assert_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) backend/service/EnglishCommentService.py"
assert_contains "DB 오브젝트명 prefix는 T_/V_ 권장(현재: TEST_TRANSACTION) backend/query/bad_naming.sql"
assert_contains "SQL_LOG_LITERAL_VALUES 활성화 경로에서는 민감 파라미터(PII/시크릿) 마스킹 가드를 함께 구현해야 함 backend/lib/Database.py"
assert_contains "SQL 로그 리터럴 노출 경로에서는 list/dict 중첩 문자열 민감값도 마스킹해야 함 backend/lib/Database.py"
assert_contains "import 블록 오염: 선행 실행문 이후 import 선언 금지 backend/service/ImportIntegrityBad.py"
assert_contains "함수 'validateEmail' docstring 설명 품질 개선 권장 (템플릿 문구 '로직을 수행한다' 사용) backend/lib/DocQualityBad.py"
assert_contains "함수 'validateEmail' docstring 상세도 부족: 처리 규칙/실패 동작/부작용/반환값 의미 중 1개 이상 권장 backend/lib/DocQualityBad.py"

# Must Ignore
assert_not_contains "SQL 문자열 보간/치환 금지. 바인드 파라미터 사용 backend/service/SafeTextService.py"
assert_not_contains "import 블록 오염: 선행 실행문 이후 import 선언 금지 backend/lib/ImportIntegrityGood.py"

echo "[PASS] backend rule-gate regression fixtures passed"
