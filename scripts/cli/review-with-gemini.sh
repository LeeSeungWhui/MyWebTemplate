#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -f "$ROOT_DIR/env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env.sh" >/dev/null 2>&1 || true
fi
# shellcheck source=/dev/null
source "$ROOT_DIR/scripts/cli/lib/rules-context.sh"

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage:
  scripts/cli/review-with-gemini.sh [<project-path>]

Examples:
  scripts/cli/review-with-gemini.sh
  scripts/cli/review-with-gemini.sh .
  scripts/cli/review-with-gemini.sh cvfit-service-frontend

Behavior:
  - Reviews local project files directly (no git dependency).
  - Default target path is ROOT_DIR.
  - Always writes a review log to output/gemini by default.

Optional env:
  GEMINI_REVIEW_LOG_DIR=<custom-log-dir>
  GEMINI_REVIEW_TIMEOUT_SEC=<seconds>                   (default: 300)
EOF
  exit 0
fi

"$ROOT_DIR/scripts/cli/bootstrap-agent-tools.sh"

resolve_repo_path() {
  local input="$1"
  if [[ -z "$input" ]]; then
    printf '%s\n' "$ROOT_DIR"
    return
  fi
  if [[ "$input" = /* ]]; then
    printf '%s\n' "$input"
  else
    printf '%s\n' "$ROOT_DIR/$input"
  fi
}

TARGET_PATH="$(resolve_repo_path "${1:-$ROOT_DIR}")"
if [[ ! -d "$TARGET_PATH" ]]; then
  echo "[gemini-review] Not a directory: $TARGET_PATH" >&2
  exit 2
fi

resolve_target_label() {
  local target="$1"
  local rel="$target"
  if [[ "$target" == "$ROOT_DIR" ]]; then
    rel="root"
  elif [[ "$target" == "$ROOT_DIR/"* ]]; then
    rel="${target#$ROOT_DIR/}"
  fi
  rel="${rel#./}"
  rel="$(printf '%s' "$rel" | tr '/ ' '__' | tr -cd '[:alnum:]_.-')"
  if [[ -z "$rel" ]]; then
    rel="target"
  fi
  printf '%s\n' "$rel"
}

LOG_DIR="${GEMINI_REVIEW_LOG_DIR:-$ROOT_DIR/output/gemini}"
mkdir -p "$LOG_DIR"
TARGET_LABEL="$(resolve_target_label "$TARGET_PATH")"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/gemini_review_${TARGET_LABEL}_${TIMESTAMP}.md"
MODEL="gemini-3-flash-preview"
TIMEOUT_SEC_RAW="${GEMINI_REVIEW_TIMEOUT_SEC:-300}"
if [[ "$TIMEOUT_SEC_RAW" =~ ^[0-9]+$ ]] && [[ "$TIMEOUT_SEC_RAW" -gt 0 ]]; then
  TIMEOUT_SEC="$TIMEOUT_SEC_RAW"
else
  TIMEOUT_SEC="300"
fi

resolve_timeout_cmd() {
  if command -v timeout >/dev/null 2>&1; then
    printf 'timeout\n'
    return
  fi
  if command -v gtimeout >/dev/null 2>&1; then
    printf 'gtimeout\n'
    return
  fi
  printf '\n'
}
TIMEOUT_CMD="$(resolve_timeout_cmd)"

RULES_CONTEXT="$(build_rule_context "$ROOT_DIR" "$TARGET_PATH" "review")"

read -r -d '' REVIEW_PROMPT <<'EOF' || true
You are reviewing a local project workspace for production quality.
Target project path: __TARGET_PATH__

Follow `AGENTS_REVIEW.md` as the primary review policy.
Output requirements:
1) Findings first, ordered by severity.
2) Each finding must include: severity(P0/P1/P2), file path, concise risk, and suggested fix.
3) Focus on bugs, regressions, security, performance, access control, and missing tests.
4) If no findings, state "No critical findings" and list residual risks/testing gaps.
5) Keep output concise and actionable.
6) Actively inspect files under target path. Do not assume git diff exists.
EOF
REVIEW_PROMPT="${REVIEW_PROMPT/__TARGET_PATH__/$TARGET_PATH}"

TMP_FILE="$(mktemp)"
printf '%s\n\n%s\n' "$RULES_CONTEXT" "$REVIEW_PROMPT" > "$TMP_FILE"

trap 'rm -f "$TMP_FILE"' EXIT

echo "[gemini-review] log file: $LOG_FILE" >&2
echo "[gemini-review] model: $MODEL" >&2
echo "[gemini-review] timeout(sec): $TIMEOUT_SEC" >&2

PROMPT_TEXT="$(cat "$TMP_FILE")"

INCLUDE_ARGS=(--include-directories "$TARGET_PATH")
if [[ "$TARGET_PATH" != "$ROOT_DIR" ]]; then
  INCLUDE_ARGS=(--include-directories "$ROOT_DIR" --include-directories "$TARGET_PATH")
fi

run_once() {
  {
    printf '# Gemini Review Log\n'
    printf -- '- timestamp: %s\n' "$(date -Iseconds)"
    printf -- '- target: `%s`\n' "$TARGET_PATH"
    printf -- '- policy: `AGENTS_REVIEW.md` (primary)\n'
    printf -- '- model: `%s`\n' "$MODEL"
    printf -- '- timeout-sec: `%s`\n\n' "$TIMEOUT_SEC"
    if [[ -n "$TIMEOUT_CMD" ]]; then
      "$TIMEOUT_CMD" --foreground "${TIMEOUT_SEC}s" gemini --approval-mode yolo -m "$MODEL" "${INCLUDE_ARGS[@]}" -p "$PROMPT_TEXT" --output-format text
    else
      echo "[gemini-review][warn] timeout command not found; running without timeout." >&2
      gemini --approval-mode yolo -m "$MODEL" "${INCLUDE_ARGS[@]}" -p "$PROMPT_TEXT" --output-format text
    fi
  } 2>&1 | tee "$LOG_FILE"
  return "${PIPESTATUS[0]}"
}

if run_once; then
  exit 0
fi
status=$?
if [[ "$status" -eq 124 ]]; then
  echo "[gemini-review] timed out after ${TIMEOUT_SEC}s." >&2
fi
exit "$status"
