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
FIXTURE_REPO="$TMP_DIR/rule-gate-fixture"
OUTPUT_FILE="$TMP_DIR/rule-gate-output.log"

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
  "$FIXTURE_REPO/frontend-web/app/common/layout" \
  "$FIXTURE_REPO/frontend-web/app/lib/component" \
  "$FIXTURE_REPO/frontend-web/app/lib/runtime" \
  "$FIXTURE_REPO/frontend-web/app/dashboard" \
  "$FIXTURE_REPO/frontend-web/app/login" \
  "$FIXTURE_REPO/frontend-web/app/sample" \
  "$FIXTURE_REPO/frontend-web/app/sample/list-naming" \
  "$FIXTURE_REPO/frontend-web/app/sample/state-adapter" \
  "$FIXTURE_REPO/frontend-web/app/sample/api-model" \
  "$FIXTURE_REPO/frontend-web/app/sample/api-model-good"

cp "$ROOT/docs/frontend-web/codding-rules-frontend.md" "$FIXTURE_REPO/docs/frontend-web/codding-rules-frontend.md"
cp "$ROOT/docs/frontend-web/rule-gate-usestate-allowlist.txt" "$FIXTURE_REPO/docs/frontend-web/rule-gate-usestate-allowlist.txt"
cp "$ROOT/docs/frontend-app/codding-rules-rn.md" "$FIXTURE_REPO/docs/frontend-app/codding-rules-rn.md"
cp "$ROOT/docs/frontend-app/rule-gate-usestate-allowlist.txt" "$FIXTURE_REPO/docs/frontend-app/rule-gate-usestate-allowlist.txt"
cp "$ROOT/docs/backend/codding-rules-backend.md" "$FIXTURE_REPO/docs/backend/codding-rules-backend.md"
cp "$ROOT/docs/common-rules.md" "$FIXTURE_REPO/docs/common-rules.md"

cat > "$FIXTURE_REPO/frontend-web/app/common/layout/Header.jsx" <<'EOF'
"use client";
/**
 * 파일명: common/layout/Header.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 회귀 검증용 Header fixture
 */

const Header = ({ title = "Dashboard" }) => {
  return <h1>{title}</h1>;
};

export default Header;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/EasyTable.jsx" <<'EOF'
/**
 * 파일명: lib/component/EasyTable.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 회귀 검증용 EasyTable fixture
 */

const EasyTable = ({ loading, errorText }) => {
  if (loading) {
    return <div>Loading...</div>;
  }
  return <div>{errorText || "Error"}</div>;
};

export default EasyTable;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/dashboard/DashboardLayoutClient.jsx" <<'EOF'
"use client";
/**
 * 파일명: dashboard/DashboardLayoutClient.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 회귀 검증용 DashboardLayoutClient fixture
 */

import { useMemo } from "react";

const resolveDashboardLayoutMeta = ({ pathname, searchParams }) => ({ pathname, searchParams });

const DashboardLayoutClient = ({ pathname, searchParams }) => {
  const layoutMeta = useMemo(
    () => resolveDashboardLayoutMeta({ pathname, searchParams }),
    [pathname, searchParams?.toString()],
  );
  return <div>{layoutMeta.pathname}</div>;
};

export default DashboardLayoutClient;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/login/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: login/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: FE-A-033 회귀 검증 fixture (EasyObj + useMemo literal)
 */

import { useMemo } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";

const LoginView = () => {
  const loginObj = EasyObj(
    useMemo(
      () => ({
        email: "",
        password: "",
        rememberMe: false,
        errors: { email: "", password: "" },
      }),
      [],
    ),
  );
  return <div>{String(!!loginObj.email)}</div>;
};

export default LoginView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: FE-A-034 회귀 검증 fixture (useEasyList + useMemo)
 */

import { useMemo } from "react";
import { useEasyList } from "@/app/lib/dataset/EasyList";

const SampleView = () => {
  const rowList = useEasyList(useMemo(() => [{ id: "1", name: "alpha" }], []));
  return <div>{rowList.size ? rowList.size() : 0}</div>;
};

export default SampleView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/state-adapter/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/state-adapter/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: FE-A-035 회귀 검증 fixture
 */

import EasyObj from "@/app/lib/dataset/EasyObj";

const StateAdapterView = () => {
  const state = EasyObj({
    resumeReady: false,
    resumeId: "",
    loading: false,
    saving: false,
  });

  const { resumeReady, resumeId, loading, saving } = state;

  const applyState = (key, nextValue) => {
    state[key] = typeof nextValue === "function" ? nextValue(state[key]) : nextValue;
  };

  applyState("loading", (prev) => !prev);
  return <div>{String(resumeReady)}-{resumeId}-{String(loading)}-{String(saving)}</div>;
};

export default StateAdapterView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/list-naming/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/list-naming/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: FE-A-036 회귀 검증 fixture
 */

import EasyList from "@/app/lib/dataset/EasyList";

const ListNamingView = () => {
  const list = EasyList([{ id: "1", name: "alpha" }]);
  return <div>{list.size ? list.size() : 0}</div>;
};

export default ListNamingView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/api-model/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/api-model/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: FE-A-038 회귀 검증 fixture (apiJSON result -> ui 직접 대입 금지)
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import { apiJSON } from "@/app/lib/runtime/api";

const ApiModelView = () => {
  const ui = EasyObj({
    rows: [],
  });

  const load = async () => {
    const response = await apiJSON("/api/v1/sample");
    const result = response?.result || [];
    ui.rows = result;
  };

  return <button onClick={load}>load</button>;
};

export default ApiModelView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/api-model-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/api-model-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: FE-A-038 오탐 방지 fixture (apiJSON result -> apiNameList.copy)
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import { useEasyList } from "@/app/lib/dataset/EasyList";
import { apiJSON } from "@/app/lib/runtime/api";

const ApiModelGoodView = () => {
  const ui = EasyObj({
    loading: false,
  });
  const resultDetailList = useEasyList([]);

  const load = async () => {
    ui.loading = true;
    const response = await apiJSON("/api/v1/sample");
    resultDetailList.copy(response?.result || []);
    ui.loading = false;
  };

  return <button onClick={load}>load</button>;
};

export default ApiModelGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/ImportIntegrityBad.jsx" <<'EOF'
"use client";
/**
 * 파일명: lib/component/ImportIntegrityBad.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 실행문 뒤 import 재선언 위반 fixture
 */

import { useMemo } from "react";

const badgeLabel = "ok";
import { useEffect } from "react";

const ImportIntegrityBad = () => {
  useEffect(() => {
    // no-op
  }, []);
  return useMemo(() => badgeLabel, []);
};

export default ImportIntegrityBad;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/ImportIntegrityGood.jsx" <<'EOF'
"use client";
/**
 * 파일명: lib/component/ImportIntegrityGood.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: import 블록 무결성 정상 fixture
 */

import { useEffect } from "react";
import { useMemo } from "react";

const ImportIntegrityGood = () => {
  useEffect(() => {
    // no-op
  }, []);
  return useMemo(() => null, []);
};

export default ImportIntegrityGood;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/SyntaxErrorBad.js" <<'EOF'
/**
 * 파일명: lib/runtime/SyntaxErrorBad.js
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: JS 파싱 실패 회귀 검증 fixture
 */

const SyntaxErrorBad = () => {
  return /^https?:\/\// 한글설명: i.test("https://example.com");
};

export default SyntaxErrorBad;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/RegexLiteralCommentSafe.js" <<'EOF'
/**
 * 파일명: lib/runtime/RegexLiteralCommentSafe.js
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 정규식 리터럴 내부 // 패턴 오탐 방지 fixture
 */

const isAbsoluteUrl = (input) => typeof input === "string" && /^https?:\/\//i.test(input);
const sanitizeSlash = (raw) => String(raw || "").replace(/\//g, "_");

export { isAbsoluteUrl, sanitizeSlash };
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/CommentEnglishBad.jsx" <<'EOF'
/**
 * 파일명: lib/component/CommentEnglishBad.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 영문 주석 검출 fixture
 */

const CommentEnglishBad = () => {
  // english comment should be detected by rule gate
  return <div>ok</div>;
};

export default CommentEnglishBad;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/CommentKoreanGood.jsx" <<'EOF'
/**
 * 파일명: lib/component/CommentKoreanGood.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 한글 주석 허용 fixture
 */

const CommentKoreanGood = () => {
  // 이 주석은 한글 기준 규칙을 만족한다.
  return <div>ok</div>;
};

export default CommentKoreanGood;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/Combobox.jsx" <<'EOF'
/**
 * 파일명: lib/component/Combobox.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 회귀 검증용 Combobox fixture
 */

const STATUS_PRESETS = {
  default: {
    message: "text-gray-600",
  },
};

const Combobox = ({ messageText }) => {
  const statusMeta = STATUS_PRESETS.default;
  const className = messageText ? statusMeta.message : "sr-only";
  return <div className={className} />;
};

export default Combobox;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/NumberInput.jsx" <<'EOF'
/**
 * 파일명: lib/component/NumberInput.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 회귀 검증용 NumberInput fixture
 */

const NumberInput = () => {
  return (
    <button type="button" aria-label="increment">
      +
    </button>
  );
};

export default NumberInput;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/Drawer.jsx" <<'EOF'
/**
 * 파일명: lib/component/Drawer.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: 회귀 검증용 Drawer fixture
 */

const Drawer = () => {
  return <button type="button" aria-label="collapse">x</button>;
};

export default Drawer;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/CommentQualityBad.jsx" <<'EOF'
/**
 * 파일명: lib/component/CommentQualityBad.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: JSDoc 상세도/재진술형 설명 검출 fixture
 */

/**
 * @description validate email 로직을 수행한다.
 */
const CommentQualityBad = () => {
  return <div className="w-[320px]">bad</div>;
};

export default CommentQualityBad;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/RemUnitBad.jsx" <<'EOF'
/**
 * 파일명: lib/component/RemUnitBad.jsx
 * 작성자: LSH
 * 갱신일: 2026-02-27
 * 설명: rem 단위 검출 fixture
 */

/**
 * @description rem 단위 사용 위반 케이스를 재현한다.
 * 처리 규칙: Tailwind arbitrary value에서 rem 단위를 사용한다.
 */
const RemUnitBad = () => {
  return <div className="w-[10rem]">rem</div>;
};

export default RemUnitBad;
EOF

git -C "$FIXTURE_REPO" add .

set +e
python3 "$RULE_GATE_PY" "$FIXTURE_REPO" --all > "$OUTPUT_FILE"
RULE_GATE_EXIT_CODE=$?
set -e

if [[ $RULE_GATE_EXIT_CODE -eq 0 ]]; then
  echo "[FAIL] frontend regression fixture expected non-zero exit (FE-A-030 ERROR) but got 0"
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

assert_contains_any() {
  local matched=0
  for pattern in "$@"; do
    if grep -Fq -- "$pattern" "$OUTPUT_FILE"; then
      matched=1
      break
    fi
  done
  if [[ $matched -eq 0 ]]; then
    echo "[FAIL] expected one of patterns not found: $*"
    echo "[INFO] output file: $OUTPUT_FILE"
    cat "$OUTPUT_FILE"
    exit 1
  fi
}

# Must Catch
assert_contains "컴포넌트 문구 하드코딩 지양: 'Dashboard' frontend-web/app/common/layout/Header.jsx"
assert_contains "컴포넌트 문구 하드코딩 지양: 'Loading...' frontend-web/app/lib/component/EasyTable.jsx"
assert_contains "컴포넌트 문구 하드코딩 지양: 'Error' frontend-web/app/lib/component/EasyTable.jsx"
assert_contains "EasyObj 초기 모델은 EasyObj({ ... })로 직접 선언해야 한다."
assert_contains "frontend-web/app/login/view.jsx"
assert_contains "리스트 초기 모델은 EasyList([...])/useEasyList([])로 직접 선언해야 한다."
assert_contains "frontend-web/app/sample/view.jsx"
assert_contains "EasyObj 구조분해 지양:"
assert_contains "EasyObj 동적 키 대입 지양:"
assert_contains "EasyObj 변수명 규칙 위반: 'state'"
assert_contains "frontend-web/app/sample/state-adapter/view.jsx"
assert_contains "EasyList 변수명 규칙 위반:"
assert_contains "frontend-web/app/sample/list-naming/view.jsx"
assert_contains "apiJSON 응답 데이터의 ui.rows 직접 대입 지양."
assert_contains "frontend-web/app/sample/api-model/view.jsx"
assert_contains "불필요한 useMemo 가능성: 'layoutMeta'"
assert_contains "import 블록 오염: 실행문 이후 import 선언 금지 frontend-web/app/lib/component/ImportIntegrityBad.jsx"
assert_contains_any "JS/JSX 문법 오류:" "node 실행 파일이 없어 프론트 문법 파싱 검사를 생략"
assert_contains_any "frontend-web/app/lib/runtime/SyntaxErrorBad.js" "frontend-web/app/common/layout/Header.jsx"
assert_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) frontend-web/app/lib/component/CommentEnglishBad.jsx"
assert_contains "JSDoc 상세도 부족: 처리 규칙/실패 동작/반환값/제약 등 구체 정보 최소 1개 포함 권장 frontend-web/app/lib/component/CommentQualityBad.jsx"
assert_contains "JSDoc 설명 품질 개선 권장 (템플릿 문구 '로직을 수행한다' 사용) frontend-web/app/lib/component/CommentQualityBad.jsx"
assert_contains "rem 단위 사용 지양. px 단위 사용 frontend-web/app/lib/component/RemUnitBad.jsx"

# Must Ignore
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'text-gray-600' frontend-web/app/lib/component/Combobox.jsx"
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'sr-only' frontend-web/app/lib/component/Combobox.jsx"
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'increment' frontend-web/app/lib/component/NumberInput.jsx"
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'collapse' frontend-web/app/lib/component/Drawer.jsx"
assert_not_contains "import 블록 오염: 실행문 이후 import 선언 금지 frontend-web/app/lib/component/ImportIntegrityGood.jsx"
assert_not_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) frontend-web/app/lib/component/CommentKoreanGood.jsx"
assert_not_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) frontend-web/app/lib/runtime/RegexLiteralCommentSafe.js"
assert_not_contains "apiJSON 응답 데이터의 ui.loading 직접 대입 지양. frontend-web/app/sample/api-model-good/view.jsx"

echo "[PASS] rule-gate regression fixtures passed"
