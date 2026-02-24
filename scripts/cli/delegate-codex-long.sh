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
  scripts/cli/delegate-codex-long.sh "<task prompt>"
  echo "<task prompt>" | scripts/cli/delegate-codex-long.sh

Description:
  Runs long-task delegation via codex CLI with proactive tool setup policy.
EOF
  exit 0
fi

"$ROOT_DIR/scripts/cli/bootstrap-agent-tools.sh"

if [[ "$#" -gt 0 ]]; then
  TASK_PROMPT="$*"
elif [[ ! -t 0 ]]; then
  TASK_PROMPT="$(cat)"
else
  echo "Usage: $0 \"<task prompt>\"  (or pass prompt via stdin)" >&2
  exit 2
fi

if [[ -z "${TASK_PROMPT// }" ]]; then
  echo "Usage: $0 \"<task prompt>\"  (or pass prompt via stdin)" >&2
  exit 2
fi

RULES_CONTEXT="$(build_rule_context "$ROOT_DIR" "$TASK_PROMPT" "dev")"

read -r -d '' PREAMBLE <<'EOF' || true
Execution policy:
- Treat this as a long-running implementation task.
- Proactively detect missing tools needed for the task (tests, lint, playwright, build).
- Install missing tools when possible in user scope without destructive operations.
- If a tool cannot be installed automatically, report exact command to install and continue with best fallback.
- Keep command logs concise and prioritize completion over planning.
EOF

FULL_PROMPT="${PREAMBLE}

${RULES_CONTEXT}

Task:
${TASK_PROMPT}"

exec codex exec -C "$ROOT_DIR" "$FULL_PROMPT"
