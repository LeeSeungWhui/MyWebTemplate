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
  scripts/cli/review-debate-with-gemini.sh <issues-file> [<project-path>]

Examples:
  scripts/cli/review-debate-with-gemini.sh logs/review/candidate-issues.md
  scripts/cli/review-debate-with-gemini.sh logs/review/candidate-issues.md cvfit-service-frontend

Behavior:
  - Validates candidate issues using AGENTS_REVIEW.md policy context.
  - Focuses only on issue items in the provided issues file.
  - Reviews local project files directly (no git dependency).
  - Writes a debate log to output/gemini by default.

Optional env:
  GEMINI_REVIEW_LOG_DIR=<custom-log-dir>
  GEMINI_REVIEW_TIMEOUT_SEC=<seconds>                   (default: 300)
EOF
  exit 0
fi

if [[ -z "${1:-}" ]]; then
  echo "[gemini-debate] Missing required <issues-file> argument." >&2
  echo "Try: scripts/cli/review-debate-with-gemini.sh --help" >&2
  exit 2
fi

"$ROOT_DIR/scripts/cli/bootstrap-agent-tools.sh"

resolve_path() {
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

ISSUES_FILE="$(resolve_path "$1")"
if [[ ! -f "$ISSUES_FILE" ]]; then
  echo "[gemini-debate] Not a file: $ISSUES_FILE" >&2
  exit 2
fi

TARGET_PATH="$(resolve_path "${2:-$ROOT_DIR}")"
if [[ ! -d "$TARGET_PATH" ]]; then
  echo "[gemini-debate] Not a directory: $TARGET_PATH" >&2
  exit 2
fi

LOG_DIR="${GEMINI_REVIEW_LOG_DIR:-$ROOT_DIR/output/gemini}"
mkdir -p "$LOG_DIR"
TARGET_LABEL="$(resolve_target_label "$TARGET_PATH")"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/gemini_debate_${TARGET_LABEL}_${TIMESTAMP}.md"
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

read -r -d '' DEBATE_PROMPT <<'EOF' || true
You are performing cross-review consensus validation for candidate issues.
Target project path: __TARGET_PATH__
Candidate issue file: __ISSUES_FILE__

Hard requirements:
1) Follow `AGENTS_REVIEW.md` as primary policy.
2) Validate only issue items from the candidate issue file.
3) Inspect relevant files under target path before each decision.
4) For each issue, output exactly:
   - 항목:
   - codex 주장:
   - gemini 반박:
   - 재검토(수긍/재반박):
   - 합의: ISSUE | DROP | 보류
   - 최종 심각도: P0 | P1 | P2 | NA
   - 근거: path:line
5) Put duplicated/common valid issues first, then single issues.
6) If code evidence is insufficient to resolve disagreement, mark `보류`.
7) Keep output concise and actionable.
EOF
DEBATE_PROMPT="${DEBATE_PROMPT/__TARGET_PATH__/$TARGET_PATH}"
DEBATE_PROMPT="${DEBATE_PROMPT/__ISSUES_FILE__/$ISSUES_FILE}"

TMP_FILE="$(mktemp)"
{
  printf '%s\n\n%s\n\n' "$RULES_CONTEXT" "$DEBATE_PROMPT"
  printf 'Candidate issues to validate:\n'
  printf -- '--- BEGIN ISSUE FILE: %s ---\n' "$ISSUES_FILE"
  cat "$ISSUES_FILE"
  printf '\n--- END ISSUE FILE ---\n'
} > "$TMP_FILE"

trap 'rm -f "$TMP_FILE"' EXIT

echo "[gemini-debate] log file: $LOG_FILE" >&2
echo "[gemini-debate] model: $MODEL" >&2
echo "[gemini-debate] timeout(sec): $TIMEOUT_SEC" >&2

PROMPT_TEXT="$(cat "$TMP_FILE")"

INCLUDE_ARGS=(--include-directories "$TARGET_PATH")
if [[ "$TARGET_PATH" != "$ROOT_DIR" ]]; then
  INCLUDE_ARGS=(--include-directories "$ROOT_DIR" --include-directories "$TARGET_PATH")
fi

run_once() {
  {
    printf '# Gemini Debate Log\n'
    printf -- '- timestamp: %s\n' "$(date -Iseconds)"
    printf -- '- target: `%s`\n' "$TARGET_PATH"
    printf -- '- issues-file: `%s`\n' "$ISSUES_FILE"
    printf -- '- policy: `AGENTS_REVIEW.md` (primary)\n'
    printf -- '- model: `%s`\n' "$MODEL"
    printf -- '- timeout-sec: `%s`\n\n' "$TIMEOUT_SEC"
    if [[ -n "$TIMEOUT_CMD" ]]; then
      "$TIMEOUT_CMD" --foreground "${TIMEOUT_SEC}s" gemini --approval-mode yolo -m "$MODEL" "${INCLUDE_ARGS[@]}" -p "$PROMPT_TEXT" --output-format text
    else
      echo "[gemini-debate][warn] timeout command not found; running without timeout." >&2
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
  echo "[gemini-debate] timed out after ${TIMEOUT_SEC}s." >&2
fi
exit "$status"
