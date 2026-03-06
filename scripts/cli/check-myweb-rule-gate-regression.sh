#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-$(pwd)}"
RULE_GATE_PY="${RULE_GATE_PY:-/home/hwi/.codex/skills/myweb-rule-gate/scripts/rule_gate.py}"
ROOT="$(cd "$ROOT" && pwd)"

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
  "$FIXTURE_REPO/frontend-web/app/api/bff/[...path]" \
  "$FIXTURE_REPO/frontend-web/app/lib/component" \
  "$FIXTURE_REPO/frontend-web/app/lib/runtime" \
  "$FIXTURE_REPO/frontend-web/app/dashboard" \
  "$FIXTURE_REPO/frontend-web/app/login" \
  "$FIXTURE_REPO/frontend-web/app/sample" \
  "$FIXTURE_REPO/frontend-web/app/sample/page-data-noop" \
  "$FIXTURE_REPO/frontend-web/app/sample/init-api-coverage-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/init-api-coverage-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/list-naming" \
  "$FIXTURE_REPO/frontend-web/app/sample/state-adapter" \
  "$FIXTURE_REPO/frontend-web/app/sample/api-model" \
  "$FIXTURE_REPO/frontend-web/app/sample/api-model-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/binding-props-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/binding-props-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/binding-props-allowed" \
  "$FIXTURE_REPO/frontend-web/app/sample/file-input-reason-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/file-input-reason-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/helper-order-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/helper-order-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/section-block-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/section-block-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/section-block-conflict-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/section-block-conflict-variant-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/section-block-internal-noncomponent-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/section-block-placement-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/nested-ternary-multiline-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/nested-ternary-multiline-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-evasion-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-evasion-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/sync-obj-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/sync-obj-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/trivial-wrapper-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/trivial-wrapper-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/layout-metadata-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/layout-metadata-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/shallow-alias-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/view-helper-import-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/view-helper-import-good" \
  "$FIXTURE_REPO/frontend-web/app/sample/api-policy-bypass-bad" \
  "$FIXTURE_REPO/frontend-web/app/sample/api-policy-bypass-good"

# AST 파서 강제 모드: fixture에도 parser 해석 경로를 연결한다.
if [[ -d "$ROOT/frontend-web/node_modules" ]]; then
  mkdir -p "$FIXTURE_REPO/frontend-web"
  ln -s "$ROOT/frontend-web/node_modules" "$FIXTURE_REPO/frontend-web/node_modules"
fi
if [[ -d "$ROOT/frontend-app/node_modules" ]]; then
  mkdir -p "$FIXTURE_REPO/frontend-app"
  ln -s "$ROOT/frontend-app/node_modules" "$FIXTURE_REPO/frontend-app/node_modules"
fi

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

cat > "$FIXTURE_REPO/frontend-web/app/sample/binding-props-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/binding-props-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-064 회귀 검증 fixture (수동 value/onChange 지양)
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import Input from "@/app/lib/component/Input";

const BindingPropsBadView = () => {
  const formObj = EasyObj({
    email: "",
  });

  return (
    <Input
      value={formObj.email}
      onChange={(event) => {
        formObj.email = event.target.value;
      }}
    />
  );
};

export default BindingPropsBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/binding-props-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/binding-props-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-064 오탐 방지 fixture (dataObj/dataKey 기본 바인딩)
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import Input from "@/app/lib/component/Input";

const BindingPropsGoodView = () => {
  const formObj = EasyObj({
    email: "",
  });

  return <Input dataObj={formObj} dataKey="email" />;
};

export default BindingPropsGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/binding-props-allowed/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/binding-props-allowed/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-064 오탐 방지 fixture (controlled 예외 마커)
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import Input from "@/app/lib/component/Input";

const BindingPropsAllowedView = () => {
  const formObj = EasyObj({
    masked: "",
  });

  // rule-gate: allow-controlled-binding - 외부 마스킹 라이브러리 연동 예외
  return (
    <Input
      value={formObj.masked}
      onChange={(event) => {
        formObj.masked = event.target.value;
      }}
    />
  );
};

export default BindingPropsAllowedView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/file-input-reason-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/file-input-reason-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-065 회귀 검증 fixture (raw file input 사유 누락)
 */

const FileInputReasonBadView = () => {
  return (
    <input
      type="file"
      onChange={() => {
        // noop
      }}
    />
  );
};

export default FileInputReasonBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/file-input-reason-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/file-input-reason-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-065 오탐 방지 fixture (raw file input 예외 사유 주석)
 */

const FileInputReasonGoodView = () => {
  return (
    <>
      {/* 예외 사유: lib/component에 동등 업로드 컴포넌트가 없어 raw file input을 사용한다 */}
      <input
        type="file"
        onChange={() => {
          // noop
        }}
      />
    </>
  );
};

export default FileInputReasonGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/helper-order-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/helper-order-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-068 회귀 검증 fixture (const 화살표 선언 전 직접 호출)
 */

const HelperOrderBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  const summary = toSummaryText(3);

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  const toSummaryText = (count) => `${count}`;

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{summary}</div>;
};

export default HelperOrderBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/helper-order-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/helper-order-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-066/068 오탐 방지 fixture (섹션 주석 유지 + 콜백 참조)
 */

const HelperOrderGoodView = () => {
  /* 1. 상수 ======================================================================================================================= */
  const buttonLabel = "RUN";

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  const handleClick = () => toSummaryForClick(3);
  const toSummaryForClick = (count) => `${count}`;

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <button onClick={handleClick}>{buttonLabel}</button>;
};

export default HelperOrderGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/section-block-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/section-block-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-066 회귀 검증 fixture (섹션 주석 형식/빈 블록 표기 누락)
 */

const SectionBlockBadView = () => {
  /* 1. 상수 */
  /* 2. 데이터 */
  /* 3. UI */
  /* 4. 팝업 */
  /* 5. 기타 */
  /* 6. 커스텀 훅 */
  /* 7. 함수 */
  /* 8. useEffect */
  /* 9. 내부 컴포넌트 */
  /* 10. 렌더링 */
  const title = "bad";
  return <div>{title}</div>;
};

export default SectionBlockBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/section-block-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/section-block-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-066 오탐 방지 fixture (섹션 형식 + 빈 블록 // 없음)
 */

const SectionBlockGoodView = () => {
  /* 1. 상수 ======================================================================================================================= */
  const title = "good";

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{title}</div>;
};

export default SectionBlockGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/section-block-conflict-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/section-block-conflict-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-066 회귀 검증 fixture (빈 섹션 // 없음 + 실행 코드 충돌)
 */

const SectionBlockConflictBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음
  const shouldNotBeHere = true;

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{String(shouldNotBeHere)}</div>;
};

export default SectionBlockConflictBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/section-block-conflict-variant-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/section-block-conflict-variant-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-066 회귀 검증 fixture (빈 섹션 변형 표기 + 실행 코드 충돌)
 */

const SectionBlockConflictVariantBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 내부 컴포넌트 선언 없음
  const shouldAlsoBeCaught = true;

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{String(shouldAlsoBeCaught)}</div>;
};

export default SectionBlockConflictVariantBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/section-block-internal-noncomponent-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/section-block-internal-noncomponent-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-066 회귀 검증 fixture (9번 섹션에 내부 컴포넌트 외 코드 배치)
 */

const SectionBlockInternalNonComponentBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  const invalidPlacement = true;

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{String(invalidPlacement)}</div>;
};

export default SectionBlockInternalNonComponentBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/section-block-placement-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/section-block-placement-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-066 회귀 검증 fixture (7/8 섹션 // 없음 우회 배치 금지)
 */

import { useEffect } from "react";
import EasyObj from "@/app/lib/dataset/EasyObj";

const SectionBlockPlacementBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  const ui = EasyObj({ keyword: "" });
  const resetKeyword = () => {
    ui.keyword = "";
  };
  useEffect(() => {
    resetKeyword();
  }, []);

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{ui.keyword}</div>;
};

export default SectionBlockPlacementBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/nested-ternary-multiline-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/nested-ternary-multiline-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-008 회귀 검증 fixture (view.jsx 멀티라인 중첩 삼항)
 */

const NestedTernaryMultilineBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  const flag = true;
  const subFlag = true;
  const label = flag
    ? subFlag
      ? "A"
      : "B"
    : "C";

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{label}</div>;
};

export default NestedTernaryMultilineBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/nested-ternary-multiline-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/nested-ternary-multiline-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-008 오탐 방지 fixture (view.jsx 단일 삼항)
 */

const NestedTernaryMultilineGoodView = () => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  const flag = true;
  const label = flag
    ? "A"
    : "B";

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{label}</div>;
};

export default NestedTernaryMultilineGoodView;
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

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/StylePropBad.jsx" <<'EOF'
/**
 * 파일명: lib/component/StylePropBad.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: JSX style prop 금지 검출 fixture
 */

const StylePropBad = () => {
  const badgeStyle = { color: "#111827" };
  return <div style={badgeStyle}>inline-style</div>;
};

export default StylePropBad;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/StylePropGood.jsx" <<'EOF'
/**
 * 파일명: lib/component/StylePropGood.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: JSX style prop 오탐 방지 fixture
 */

const StylePropGood = () => {
  const style = "text-gray-900";
  return <div className={style}>no-inline-style</div>;
};

export default StylePropGood;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/StylePropBypassBad.jsx" <<'EOF'
/**
 * 파일명: lib/component/StylePropBypassBad.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-075 검출 fixture (style spread 우회 금지)
 */

const StylePropBypassBad = () => {
  const styleProps = { style: { color: "#111827" }, title: "bad" };
  return <div {...styleProps}>style-bypass</div>;
};

export default StylePropBypassBad;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/component/StylePropBypassGood.jsx" <<'EOF'
/**
 * 파일명: lib/component/StylePropBypassGood.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-075 오탐 방지 fixture (style 키 미사용 spread)
 */

const StylePropBypassGood = () => {
  const viewProps = { title: "good" };
  return <div {...viewProps}>no-style-bypass</div>;
};

export default StylePropBypassGood;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/backend-type-guard-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-070 검출 fixture (백엔드 응답 타입 재검증 금지)
 */

const BackendTypeGuardBadView = ({ response }) => {
  const itemList = Array.isArray(response?.result?.items) ? response.result.items : [];
  return <div>{itemList.length}</div>;
};

export default BackendTypeGuardBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/backend-type-guard-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-070 오탐 방지 fixture (API 계약 fallback)
 */

const BackendTypeGuardGoodView = ({ response }) => {
  const itemList = response?.result?.items || [];
  return <div>{itemList.length}</div>;
};

export default BackendTypeGuardGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-evasion-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/backend-type-guard-evasion-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-075 검출 fixture (타입가드 alias 조건식 위장)
 */

const BackendTypeGuardEvasionBadView = () => {
  const response = { result: { items: [] } };
  const result = response?.result || {};
  const isArrayGuard = Array.isArray;
  const itemList = isArrayGuard(result.items) ? result.items : [];

  return <div>{itemList.length}</div>;
};

export default BackendTypeGuardEvasionBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/backend-type-guard-evasion-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/backend-type-guard-evasion-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-075 오탐 방지 fixture (백엔드 응답 타입가드 우회 없음)
 */

const BackendTypeGuardEvasionGoodView = () => {
  const response = { result: { items: [] } };
  const result = response?.result || {};
  const itemList = result.items || [];

  return <div>{itemList.length}</div>;
};

export default BackendTypeGuardEvasionGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/sync-obj-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/sync-obj-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-071/072/073 검출 fixture
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import { apiJSON } from "@/app/lib/runtime/api";

const SyncObjBadView = () => {
  const ui = EasyObj({ isLoading: false, rows: [] });
  const loadingSyncObj = EasyObj({ loading: false });

  const load = async () => {
    const payload = await apiJSON("/api/v1/sample/list");
    const listSyncObj = payload.result;
    ui.rows = ui.rows || [];
    if (listSyncObj) {
      ui.rows = listSyncObj.items || [];
    }
    loadingSyncObj.loading = false;
  };

  return <button onClick={load}>load</button>;
};

export default SyncObjBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/sync-obj-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/sync-obj-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-071/072/073 오탐 방지 fixture
 */

import EasyObj from "@/app/lib/dataset/EasyObj";
import { apiJSON } from "@/app/lib/runtime/api";

const SyncObjGoodView = () => {
  const ui = EasyObj({ isLoading: false });
  const resultDetailObj = EasyObj({});

  const load = async () => {
    ui.isLoading = true;
    const payload = await apiJSON("/api/v1/sample/detail");
    resultDetailObj.copy(payload.result || {});
    ui.isLoading = false;
  };

  return <button onClick={load}>load</button>;
};

export default SyncObjGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/trivial-wrapper-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/trivial-wrapper-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-074 검출 fixture (군더더기 1줄 wrapper)
 */

const TrivialWrapperBadView = ({ text }) => {
  const normalizeText = (value) => value.trim();
  const mapLabel = (value, suffix) => formatLabel(value, suffix);
  const normalizeNoParen = value => String(value).trim();
  const normalizeBlock = (value) => {
    return String(value).trim();
  };
  return <div>{normalizeText(text || "")}</div>;
};

export default TrivialWrapperBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/trivial-wrapper-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/trivial-wrapper-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-074 오탐 방지 fixture (명시 예외 주석)
 */

const TrivialWrapperGoodView = ({ text }) => {
  // rule-gate: allow-trivial-wrapper 외부 폼 어댑터 시그니처와 함수 레퍼런스 계약 고정
  const normalizeText = (value) => value.trim();
  const outputText = String(text || "").trim();
  return <div>{normalizeText(outputText)}</div>;
};

export default TrivialWrapperGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/TrivialWrapperRuntimeBad.js" <<'EOF'
/**
 * 파일명: lib/runtime/TrivialWrapperRuntimeBad.js
 * 작성자: LSH
 * 갱신일: 2026-03-05
 * 설명: FE-A-074 검출 fixture (view 외 런타임 wrapper)
 */

export const normalizeRuntimeText = (value) => String(value).trim();
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/TrivialWrapperRuntimeGood.js" <<'EOF'
/**
 * 파일명: lib/runtime/TrivialWrapperRuntimeGood.js
 * 작성자: LSH
 * 갱신일: 2026-03-05
 * 설명: FE-A-074 오탐 방지 fixture (view 외 런타임 allow marker)
 */

// rule-gate: allow-trivial-wrapper 외부 라이브러리 콜백 시그니처 계약
export const normalizeRuntimeText = (value) => String(value).trim();
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/CommentSpacingBad.js" <<'EOF'
/**
 * 파일명: lib/runtime/CommentSpacingBad.js
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-078 검출 fixture (독립 주석 윗줄 공백 누락)
 */

const LOCAL_DRAFT_KEY = "cvfit.resume.opt.uploadDraft";
// 주석 윗줄 공백 1줄 누락
const uploadMode = "manual";

export { LOCAL_DRAFT_KEY, uploadMode };
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/CommentSpacingGood.js" <<'EOF'
/**
 * 파일명: lib/runtime/CommentSpacingGood.js
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-078 오탐 방지 fixture (독립 주석 윗줄 공백 1줄 준수)
 */

const LOCAL_DRAFT_KEY = "cvfit.resume.opt.uploadDraft";

// 주석 윗줄 공백 1줄 준수
const uploadMode = "manual";

export { LOCAL_DRAFT_KEY, uploadMode };
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/api-policy-bypass-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/api-policy-bypass-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-079 검출 fixture (timeout/retry/sizeMax 직접 전달 금지)
 */

import { apiJSON } from "@/app/lib/runtime/api";

const ApiPolicyBypassBadView = async () => {
  await apiJSON("/api/v1/sample/list", {
    method: "GET",
    timeout: 5000,
    retry: 3,
    sizeMax: 500,
  });

  return <div>bad</div>;
};

export default ApiPolicyBypassBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/api-policy-bypass-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/api-policy-bypass-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-079 오탐 방지 fixture (일반 API 옵션 전달)
 */

import { apiJSON } from "@/app/lib/runtime/api";

const ApiPolicyBypassGoodView = async () => {
  await apiJSON("/api/v1/sample/list", {
    method: "GET",
    body: { page: 1, size: 20 },
  });

  return <div>good</div>;
};

export default ApiPolicyBypassGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/layout-metadata-bad/layout.jsx" <<'EOF'
/**
 * 파일명: sample/layout-metadata-bad/layout.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-05
 * 설명: FE-A-067 검출 fixture (layout metadata 하드코딩)
 */

export const metadata = {
  title: "Layout Metadata Bad",
  description: "Hardcoded layout metadata",
};

const LayoutMetadataBadLayout = ({ children }) => {
  return <div>{children}</div>;
};

export default LayoutMetadataBadLayout;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/layout-metadata-good/lang.ko.js" <<'EOF'
export const LANG_KO = {
  title: "레이아웃 메타데이터",
  description: "공통 리소스 기반 설명",
};
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/layout-metadata-good/layout.jsx" <<'EOF'
/**
 * 파일명: sample/layout-metadata-good/layout.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-05
 * 설명: FE-A-067 오탐 방지 fixture (layout metadata 리소스 참조)
 */
import { LANG_KO } from "./lang.ko";

export const metadata = {
  title: LANG_KO.title,
  description: LANG_KO.description,
};

const LayoutMetadataGoodLayout = ({ children }) => {
  return <div>{children}</div>;
};

export default LayoutMetadataGoodLayout;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/shallow-alias-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/shallow-alias-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-024 검출 fixture (식별자 얕은 별칭)
 */

const ShallowAliasBadView = () => {
  /* 1. 상수 ======================================================================================================================= */
  const statList = [{ status: "ready", count: 1 }];
  const byStatus = statList;

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{byStatus.length}</div>;
};

export default ShallowAliasBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/view-helper-import-bad/viewHelper.js" <<'EOF'
/**
 * 파일명: sample/view-helper-import-bad/viewHelper.js
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-076 검출 fixture helper 모듈
 */

export const normalizeRows = (rows) => rows || [];
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/view-helper-import-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/view-helper-import-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-076 검출 fixture (view.jsx 로컬 helper import)
 */

import { normalizeRows } from "./viewHelper";

const ViewHelperImportBadView = ({ initialDataObj = {} }) => {
  /* 1. 상수 ======================================================================================================================= */
  // 없음

  /* 2. 데이터 ======================================================================================================================= */
  const rowList = normalizeRows(initialDataObj?.rows);

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <div>{rowList.length}</div>;
};

export default ViewHelperImportBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/view-helper-import-good/SectionCard.jsx" <<'EOF'
/**
 * 파일명: sample/view-helper-import-good/SectionCard.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-076 오탐 방지 fixture 로컬 컴포넌트
 */

const SectionCard = ({ text }) => {
  return <div>{text}</div>;
};

export default SectionCard;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/view-helper-import-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/view-helper-import-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-04
 * 설명: FE-A-076 오탐 방지 fixture (일반 로컬 컴포넌트 import)
 */

import SectionCard from "./SectionCard";

const ViewHelperImportGoodView = () => {
  /* 1. 상수 ======================================================================================================================= */
  const text = "ok";

  /* 2. 데이터 ======================================================================================================================= */
  // 없음

  /* 3. UI ========================================================================================================================= */
  // 없음

  /* 4. 팝업 ======================================================================================================================= */
  // 없음

  /* 5. 기타 ======================================================================================================================= */
  // 없음

  /* 6. 커스텀 훅 =================================================================================================================== */
  // 없음

  /* 7. 함수 ======================================================================================================================= */
  // 없음

  /* 8. useEffect ================================================================================================================== */
  // 없음

  /* 9. 내부 컴포넌트 ============================================================================================================== */
  // 없음

  /* 10. 렌더링 ==================================================================================================================== */
  return <SectionCard text={text} />;
};

export default ViewHelperImportGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/page-data-noop/initData.jsx" <<'EOF'
/**
 * 파일명: sample/page-data-noop/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-047 회귀 검증 fixture (usePageData 반환값 미사용 호출)
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  API: {
    list: "/api/v1/sample/list",
  },
};
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/page-data-noop/page.jsx" <<'EOF'
/**
 * 파일명: sample/page-data-noop/page.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-047 회귀 검증 fixture (page 템플릿 준수)
 */

import View from "./view";
import { PAGE_CONFIG } from "./initData";
import { loadServerPageData } from "@/app/lib/runtime/pageData";

export const metadata = {
  title: "Sample Noop | MyWebTemplate",
  description: "Page data noop fixture",
};

const Page = async () => {
  const { dataObj: initialDataObj, errorObj: initialErrorObj } = await loadServerPageData({
    pageConfig: PAGE_CONFIG,
  });
  return <View initialDataObj={initialDataObj} initialErrorObj={initialErrorObj} />;
};

export default Page;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/page-data-noop/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/page-data-noop/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-047 회귀 검증 fixture (auto:false + 반환값 미사용)
 */

import { usePageData } from "@/app/lib/hooks/usePageData";
import { PAGE_CONFIG } from "./initData";

const PageDataNoopView = ({ initialDataObj = {}, initialErrorObj = {} }) => {
  usePageData({
    pageConfig: PAGE_CONFIG,
    initialDataObj,
    initialErrorObj,
    auto: false,
  });
  return <div>noop</div>;
};

export default PageDataNoopView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/init-api-coverage-bad/initData.jsx" <<'EOF'
/**
 * 파일명: sample/init-api-coverage-bad/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-048 회귀 검증 fixture (INIT_API 경로/API 키 불일치)
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  INIT_API: {
    submit: {
      path: "/api/v1/user/create",
      method: "POST",
    },
    initOnly: "/api/v1/init-only",
  },
  API: {
    list: "/api/v1/sample/list",
  },
};
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/init-api-coverage-bad/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/init-api-coverage-bad/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-048 회귀 검증 fixture (PAGE_CONFIG.API 미선언 키 호출)
 */

import { apiJSON } from "@/app/lib/runtime/api";
import { PAGE_CONFIG } from "./initData";

const InitApiCoverageBadView = () => {
  apiJSON(PAGE_CONFIG.API.submitAction, { method: "POST" });
  return <div>bad</div>;
};

export default InitApiCoverageBadView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/init-api-coverage-good/initData.jsx" <<'EOF'
/**
 * 파일명: sample/init-api-coverage-good/initData.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-048 회귀 검증 fixture (INIT_API/API 정합)
 */

export const PAGE_CONFIG = {
  MODE: "CSR",
  INIT_API: {
    list: {
      path: "/api/v1/sample/list",
      method: "GET",
    },
  },
  API: {
    list: {
      path: "/api/v1/sample/list",
      method: "GET",
    },
    submitAction: {
      path: "/api/v1/sample/submit",
      method: "POST",
    },
  },
};
EOF

cat > "$FIXTURE_REPO/frontend-web/app/sample/init-api-coverage-good/view.jsx" <<'EOF'
"use client";
/**
 * 파일명: sample/init-api-coverage-good/view.jsx
 * 작성자: LSH
 * 갱신일: 2026-03-06
 * 설명: FE-A-048 회귀 검증 fixture (PAGE_CONFIG.API 선언 키 호출)
 */

import { apiJSON } from "@/app/lib/runtime/api";
import { PAGE_CONFIG } from "./initData";

const InitApiCoverageGoodView = () => {
  apiJSON(PAGE_CONFIG.API.submitAction, { body: { sampleId: "ok" } });
  return <div>ok</div>;
};

export default InitApiCoverageGoodView;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/PageDataLegacyBad.js" <<'EOF'
/**
 * 파일명: lib/runtime/PageDataLegacyBad.js
 * 작성자: LSH
 * 갱신일: 2026-03-02
 * 설명: FE-A-060 회귀 검증 fixture (레거시 API 스키마 호환 금지)
 */

const resolveLegacyEndpoint = (pageConfig, endpoint, initConfig = {}) => {
  const apiMap = pageConfig?.API ?? pageConfig?.endPoints ?? {};
  const path = endpoint.path ?? endpoint.url ?? endpoint.endpoint ?? initConfig.path ?? "";
  if (endpoint.enabled === false) return null;
  return { apiMap, path };
};

export default resolveLegacyEndpoint;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/lib/runtime/api.js" <<'EOF'
/**
 * 파일명: lib/runtime/api.js
 * 작성자: LSH
 * 갱신일: 2026-03-02
 * 설명: FE-A-061 회귀 검증 fixture (apiRequest 레거시 csrf/auth 호환 금지)
 */

const normalizeArgs = (a2) => {
  const isLegacyOptionOnlyInit = (value) => {
    const keys = Object.keys(value || {});
    return keys.every((key) => key === "csrf" || key === "auth");
  };

  const init = isLegacyOptionOnlyInit(a2) ? { ...a2 } : {};
  if ("csrf" in init) delete init.csrf;
  if ("auth" in init) delete init.auth;
  return init;
};

export default normalizeArgs;
EOF

cat > "$FIXTURE_REPO/frontend-web/app/api/bff/[...path]/route.js" <<'EOF'
/**
 * 파일명: app/api/bff/[...path]/route.js
 * 작성자: LSH
 * 갱신일: 2026-03-03
 * 설명: FE-A-062 회귀 검증 fixture (refresh 경로 Origin/Referer 보강 누락)
 */

const cloneRequestHeaders = (req) => {
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    headers.set(key, value);
  });
  return headers;
};

async function refreshOnce(req, backendHost) {
  const refreshUrl = new URL("/api/v1/auth/refresh", backendHost);
  const headers = cloneRequestHeaders(req);
  headers.delete("authorization");
  return fetch(refreshUrl, {
    method: "POST",
    headers,
    redirect: "manual",
    cache: "no-store",
  });
}

export { refreshOnce };
EOF

git -C "$FIXTURE_REPO" add .

set +e
python3 "$RULE_GATE_PY" "$FIXTURE_REPO" --all --limit-per-rule 5000 > "$OUTPUT_FILE"
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
assert_contains "Input 수동 제어(value/checked + onChange) 지양."
assert_contains "frontend-web/app/sample/binding-props-bad/view.jsx"
assert_contains "raw <input type=\"file\"> 사용 시 예외 사유 주석 필수."
assert_contains "frontend-web/app/sample/file-input-reason-bad/view.jsx"
assert_contains "view.jsx 섹션 주석 고정 순서(1~10) 누락:"
assert_contains "frontend-web/app/login/view.jsx"
assert_contains "view.jsx 섹션 주석 형식 위반:"
assert_contains "frontend-web/app/sample/section-block-bad/view.jsx"
assert_contains "view.jsx 빈 섹션 표기 누락:"
assert_contains "view.jsx 빈 섹션 표기 충돌:"
assert_contains "frontend-web/app/sample/section-block-conflict-bad/view.jsx"
assert_contains "frontend-web/app/sample/section-block-conflict-variant-bad/view.jsx"
assert_contains "view.jsx 내부 컴포넌트 섹션 위반:"
assert_contains "frontend-web/app/sample/section-block-internal-noncomponent-bad/view.jsx"
assert_contains "view.jsx 섹션 배치 위반:"
assert_contains "frontend-web/app/sample/section-block-placement-bad/view.jsx"
assert_contains "view.jsx 렌더링 섹션 위반:"
assert_contains "page.jsx metadata.title 문자열 하드코딩 지양: 'Sample Noop | MyWebTemplate'"
assert_contains "frontend-web/app/sample/page-data-noop/page.jsx"
assert_contains "중첩 삼항 지양. if/else 분리 권장 frontend-web/app/sample/nested-ternary-multiline-bad/view.jsx"
assert_contains "const 화살표 헬퍼 'toSummaryText' 선언 전 직접 호출 감지"
assert_contains "frontend-web/app/sample/helper-order-bad/view.jsx"
assert_contains "불필요한 useMemo 가능성: 'layoutMeta'"
assert_contains "import 블록 오염: 실행문 이후 import 선언 금지 frontend-web/app/lib/component/ImportIntegrityBad.jsx"
assert_contains_any "JS/JSX 문법 오류:" "node 실행 파일이 없어 프론트 문법 파싱 검사를 생략"
assert_contains_any "frontend-web/app/lib/runtime/SyntaxErrorBad.js" "frontend-web/app/common/layout/Header.jsx"
assert_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) frontend-web/app/lib/component/CommentEnglishBad.jsx"
assert_contains "JSDoc 상세도 부족: 처리 규칙/실패 동작/반환값/제약 등 구체 정보 최소 1개 포함 권장 frontend-web/app/lib/component/CommentQualityBad.jsx"
assert_contains "JSDoc 설명 품질 개선 권장 (템플릿 문구 '로직을 수행한다' 사용) frontend-web/app/lib/component/CommentQualityBad.jsx"
assert_contains "rem 단위 사용 지양. px 단위 사용 frontend-web/app/lib/component/RemUnitBad.jsx"
assert_contains "JSX style 속성(style=...) 사용 금지. Tailwind 유틸 클래스 + CSS 모듈 조합으로 구현해야 한다 frontend-web/app/lib/component/StylePropBad.jsx"
assert_contains "룰게이트 회피형 수정 금지: style prop 포함 객체 'styleProps'를 JSX spread로 우회 전달 감지. 의미 동일 + 형태 변경 회피 대신 Tailwind + CSS 모듈로 수정해야 한다 frontend-web/app/lib/component/StylePropBypassBad.jsx"
assert_contains "백엔드 응답(payload/result/response) 타입 재검증 지양. 프론트 뷰 레이어에서는 API 계약 스키마 + 기본 fallback(??, ||)을 우선 사용해야 한다 frontend-web/app/sample/backend-type-guard-bad/view.jsx"
assert_contains "룰게이트 회피형 수정 금지: 타입가드 alias/래퍼 'isArrayGuard'로 조건식 위장 감지. 코드 우회 대신 룰게이트를 수정해야 한다 frontend-web/app/sample/backend-type-guard-evasion-bad/view.jsx"
assert_contains "별도 EasyObj 'loadingSyncObj' 선언 금지. UI 플래그는 ui 내부 필드(isLoading/isSaving 등)로 통합해야 한다 frontend-web/app/sample/sync-obj-bad/view.jsx"
assert_contains "fallback 재초기화 금지: 'ui.rows = ui.rows || ...' 패턴 사용 지양 frontend-web/app/sample/sync-obj-bad/view.jsx"
assert_contains "중간복사 변수 'listSyncObj' 사용 금지. API 응답은 <apiName>Obj/<apiName>List.copy(payload.result)로 직접 동기화해야 한다 frontend-web/app/sample/sync-obj-bad/view.jsx"
assert_contains "apiJSON 응답 'payload' 처리 시 result 직동기화 누락."
assert_contains "화면 보정이 필요하면 별도 helper 분리 대신 apiJSON 직후 <apiName>Obj/<apiName>List를 바로 수정해야 한다 frontend-web/app/sample/sync-obj-bad/view.jsx"
assert_contains "군더더기 1줄 wrapper 함수 'normalizeText' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/sample/trivial-wrapper-bad/view.jsx"
assert_contains "군더더기 1줄 wrapper 함수 'mapLabel' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/sample/trivial-wrapper-bad/view.jsx"
assert_contains "군더더기 1줄 wrapper 함수 'normalizeNoParen' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/sample/trivial-wrapper-bad/view.jsx"
assert_contains "군더더기 1줄 wrapper 함수 'normalizeBlock' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/sample/trivial-wrapper-bad/view.jsx"
assert_contains "군더더기 1줄 wrapper 함수 'normalizeRuntimeText' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/lib/runtime/TrivialWrapperRuntimeBad.js"
assert_contains "독립 주석(\`//\`, \`/*\`) 위에는 빈 줄을 정확히 1줄 둬야 함 frontend-web/app/lib/runtime/CommentSpacingBad.js"
assert_contains "API 실행 정책 키 'timeout'를 프론트 호출 옵션으로 직접 전달하지 말아야 함. timeout/retry/size max 정책은 서버 config.ini(API_POLICY)에서 관리해야 함 frontend-web/app/sample/api-policy-bypass-bad/view.jsx"
assert_contains "layout.jsx metadata.title 문자열 하드코딩 지양: 'Layout Metadata Bad'"
assert_contains "frontend-web/app/sample/layout-metadata-bad/layout.jsx"
assert_contains "얕은 별칭 지양: 'byStatus = statList' frontend-web/app/sample/shallow-alias-bad/view.jsx"
assert_contains "view.jsx 로컬 helper/util import 지양: './viewHelper'."
assert_contains "frontend-web/app/sample/view-helper-import-bad/view.jsx"
assert_contains "usePageData 반환값 미사용 + auto:false 호출 지양."
assert_contains "frontend-web/app/sample/page-data-noop/view.jsx"
assert_contains "initData.jsx의 PAGE_CONFIG.INIT_API 'initOnly' 경로 '/api/v1/init-only'는 PAGE_CONFIG.API에도 동일하게 선언해야 한다 frontend-web/app/sample/init-api-coverage-bad/initData.jsx"
assert_contains "initData.jsx의 PAGE_CONFIG.INIT_API 'submit'는 초기 자동 로딩용 조회 API로 제한해야 한다. 사용자 액션 API는 PAGE_CONFIG.API에서 view.jsx 직접 호출로 분리해야 한다 frontend-web/app/sample/init-api-coverage-bad/initData.jsx"
assert_contains "view.jsx에서 참조한 PAGE_CONFIG.API.submitAction 선언이 initData.jsx에 없다. page/view에서 호출하는 API는 PAGE_CONFIG.API에 먼저 선언해야 한다 frontend-web/app/sample/init-api-coverage-bad/view.jsx"
assert_contains "레거시 API 스키마 호환 금지: 레거시 API 키 'endPoints' 사용 감지. PAGE_CONFIG.INIT_API/PAGE_CONFIG.API + { path, method?, authless?, body?, init?, fetchInit? } 형식으로 통일해야 한다 frontend-web/app/lib/runtime/PageDataLegacyBad.js"
assert_contains "apiRequest 레거시 csrf/auth 호환(shim) 금지: 레거시 옵션 판별 함수. 호출 규약은 PAGE_CONFIG/API 표준 옵션으로만 해석해야 한다 frontend-web/app/lib/runtime/api.js"
assert_contains "apiRequest 레거시 csrf/auth 호환(shim) 금지: csrf 키 무음 제거. 호출 규약은 PAGE_CONFIG/API 표준 옵션으로만 해석해야 한다 frontend-web/app/lib/runtime/api.js"
assert_contains "BFF refresh 프록시는 Origin/Referer 헤더 보강(set) 로직을 포함해야 한다. frontend-web/app/api/bff/[...path]/route.js"

# Must Ignore
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'text-gray-600' frontend-web/app/lib/component/Combobox.jsx"
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'sr-only' frontend-web/app/lib/component/Combobox.jsx"
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'increment' frontend-web/app/lib/component/NumberInput.jsx"
assert_not_contains "컴포넌트 문구 하드코딩 지양: 'collapse' frontend-web/app/lib/component/Drawer.jsx"
assert_not_contains "import 블록 오염: 실행문 이후 import 선언 금지 frontend-web/app/lib/component/ImportIntegrityGood.jsx"
assert_not_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) frontend-web/app/lib/component/CommentKoreanGood.jsx"
assert_not_contains "주석/문구는 한글 기준 권장(예외: 라이브러리/헤더/코드값) frontend-web/app/lib/runtime/RegexLiteralCommentSafe.js"
assert_not_contains "JSX style 속성(style=...) 사용 금지. Tailwind 유틸 클래스 + CSS 모듈 조합으로 구현해야 한다 frontend-web/app/lib/component/StylePropGood.jsx"
assert_not_contains "룰게이트 회피형 수정 금지: style prop 포함 객체 'viewProps'를 JSX spread로 우회 전달 감지. 의미 동일 + 형태 변경 회피 대신 Tailwind + CSS 모듈로 수정해야 한다 frontend-web/app/lib/component/StylePropBypassGood.jsx"
assert_not_contains "백엔드 응답(payload/result/response) 타입 재검증 지양. 프론트 뷰 레이어에서는 API 계약 스키마 + 기본 fallback(??, ||)을 우선 사용해야 한다 frontend-web/app/sample/backend-type-guard-good/view.jsx"
assert_not_contains "룰게이트 회피형 수정 금지: 타입가드 alias/래퍼 'isArrayGuard'로 조건식 위장 감지. 코드 우회 대신 룰게이트를 수정해야 한다 frontend-web/app/sample/backend-type-guard-evasion-good/view.jsx"
assert_not_contains "별도 EasyObj 'resultDetailObjSyncObj' 선언 금지. UI 플래그는 ui 내부 필드(isLoading/isSaving 등)로 통합해야 한다 frontend-web/app/sample/sync-obj-good/view.jsx"
assert_not_contains "fallback 재초기화 금지: 'resultDetailObj.rows = resultDetailObj.rows || ...' 패턴 사용 지양 frontend-web/app/sample/sync-obj-good/view.jsx"
assert_not_contains "중간복사 변수 'resultSyncObj' 사용 금지. API 응답은 <apiName>Obj/<apiName>List.copy(payload.result)로 직접 동기화해야 한다 frontend-web/app/sample/sync-obj-good/view.jsx"
assert_not_contains "apiJSON 응답 'payload' 처리 시 result 직동기화 누락. 화면 보정이 필요하면 별도 helper 분리 대신 apiJSON 직후 <apiName>Obj/<apiName>List를 바로 수정해야 한다 frontend-web/app/sample/sync-obj-good/view.jsx"
assert_not_contains "군더더기 1줄 wrapper 함수 'normalizeText' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/sample/trivial-wrapper-good/view.jsx"
assert_not_contains "군더더기 1줄 wrapper 함수 'normalizeRuntimeText' 지양. 호출 지점에서 직접 처리하거나, 정말 필요하면 인접 주석에 'rule-gate: allow-trivial-wrapper' 사유를 명시해야 한다 frontend-web/app/lib/runtime/TrivialWrapperRuntimeGood.js"
assert_not_contains "독립 주석(\`//\`, \`/*\`) 위에는 빈 줄을 정확히 1줄 둬야 함 frontend-web/app/lib/runtime/CommentSpacingGood.js"
assert_not_contains "API 실행 정책 키 'timeout'를 프론트 호출 옵션으로 직접 전달하지 말아야 함. timeout/retry/size max 정책은 서버 config.ini(API_POLICY)에서 관리해야 함 frontend-web/app/sample/api-policy-bypass-good/view.jsx"
assert_not_contains "layout.jsx metadata.title 문자열 하드코딩 지양: '레이아웃 메타데이터' frontend-web/app/sample/layout-metadata-good/layout.jsx"
assert_not_contains "view.jsx 로컬 helper/util import 지양: './SectionCard'. 뷰 전용 보정/헬퍼 로직은 view.jsx 내부로 유지하고, 정말 필요한 예외면 인접 주석에 'rule-gate: allow-view-helper-import' 사유를 명시해야 한다 frontend-web/app/sample/view-helper-import-good/view.jsx"
assert_not_contains "apiJSON 응답 데이터의 ui.loading 직접 대입 지양. frontend-web/app/sample/api-model-good/view.jsx"
assert_not_contains "Input 수동 제어(value/checked + onChange) 지양. 컴포넌트 바인딩 props(dataObj/dataKey, dataList 등)를 우선 사용하고, 예외가 필요하면 인접 주석에 'rule-gate: allow-controlled-binding' 사유를 남겨야 한다 frontend-web/app/sample/binding-props-good/view.jsx"
assert_not_contains "Input 수동 제어(value/checked + onChange) 지양. 컴포넌트 바인딩 props(dataObj/dataKey, dataList 등)를 우선 사용하고, 예외가 필요하면 인접 주석에 'rule-gate: allow-controlled-binding' 사유를 남겨야 한다 frontend-web/app/sample/binding-props-allowed/view.jsx"
assert_not_contains "initData.jsx의 PAGE_CONFIG.INIT_API 'list' 경로 '/api/v1/sample/list'는 PAGE_CONFIG.API에도 동일하게 선언해야 한다 frontend-web/app/sample/init-api-coverage-good/initData.jsx"
assert_not_contains "view.jsx에서 참조한 PAGE_CONFIG.API.submitAction 선언이 initData.jsx에 없다. page/view에서 호출하는 API는 PAGE_CONFIG.API에 먼저 선언해야 한다 frontend-web/app/sample/init-api-coverage-good/view.jsx"
assert_not_contains "raw <input type=\"file\"> 사용 시 예외 사유 주석 필수. lib/component 우선 사용 원칙에 따라 인접 주석/JSDoc에 대체 불가 사유를 남겨야 한다 frontend-web/app/sample/file-input-reason-good/view.jsx"
assert_not_contains "view.jsx 섹션 주석 고정 순서(1~10) 누락: 1. 상수, 2. 데이터, 3. UI, 4. 팝업, 5. 기타, 6. 커스텀 훅, 7. 함수, 8. useEffect, 9. 내부 컴포넌트, 10. 렌더링. 사용하지 않는 섹션도 주석과 '// 없음'을 유지해야 한다 frontend-web/app/sample/helper-order-good/view.jsx"
assert_not_contains 'view.jsx 섹션 주석 형식 위반: '\''1. 상수'\'' 주석은 `/* n. ... === */` 형식을 사용해야 한다 frontend-web/app/sample/section-block-good/view.jsx'
assert_not_contains 'view.jsx 빈 섹션 표기 누락: '\''2. 데이터'\'' 섹션이 비어 있으므로 `// 없음`을 명시해야 한다 frontend-web/app/sample/section-block-good/view.jsx'
assert_not_contains "view.jsx 렌더링 섹션 위반: '10. 렌더링' 블록에서는 선언문(const/let/function)보다 return JSX를 우선 배치해야 한다 frontend-web/app/sample/section-block-good/view.jsx"
assert_not_contains "중첩 삼항 지양. if/else 분리 권장 frontend-web/app/sample/nested-ternary-multiline-good/view.jsx"
assert_not_contains "const 화살표 헬퍼 'toSummaryForClick' 선언 전 직접 호출 감지"

echo "[PASS] rule-gate regression fixtures passed"
