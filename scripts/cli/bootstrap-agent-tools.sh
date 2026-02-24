#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -f "$ROOT_DIR/env.sh" ]]; then
  # shellcheck source=/dev/null
  source "$ROOT_DIR/env.sh" >/dev/null 2>&1 || true
fi

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage:
  scripts/cli/bootstrap-agent-tools.sh

Optional env:
  AGENT_EXTRA_TOOLS="playwright rg jq"
EOF
  exit 0
fi

log() {
  printf '[bootstrap] %s\n' "$*"
}

warn() {
  printf '[bootstrap][warn] %s\n' "$*" >&2
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

ensure_node_and_npm() {
  if ! need_cmd node || ! need_cmd npm; then
    warn "node/npm not found. Run './env.sh' first or install Node.js."
    return 1
  fi
  return 0
}

ensure_npm_pkg_for_cmd() {
  local cmd="$1"
  local pkg="$2"
  if need_cmd "$cmd"; then
    return 0
  fi
  log "Installing $pkg for missing command '$cmd'..."
  npm install -g "$pkg" >/dev/null
}

ensure_core() {
  ensure_node_and_npm
  ensure_npm_pkg_for_cmd codex "@openai/codex"
  ensure_npm_pkg_for_cmd gemini "@google/gemini-cli"
}

ensure_optional() {
  local tool="$1"
  case "$tool" in
    playwright)
      ensure_npm_pkg_for_cmd playwright "@playwright/test"
      ;;
    rg|ripgrep)
      if ! need_cmd rg; then
        warn "ripgrep(rg) missing. Install via OS package manager (e.g. apt install ripgrep)."
      fi
      ;;
    jq)
      if ! need_cmd jq; then
        warn "jq missing. Install via OS package manager (e.g. apt install jq)."
      fi
      ;;
    *)
      warn "Unknown optional tool '$tool' (skipped)."
      ;;
  esac
}

main() {
  ensure_core
  local extras="${AGENT_EXTRA_TOOLS:-}"
  if [[ -n "$extras" ]]; then
    # shellcheck disable=SC2086
    for tool in $extras; do
      ensure_optional "$tool"
    done
  fi

  log "Ready:"
  log "node: $(node -v)"
  log "npm:  $(npm -v)"
  log "codex: $(codex --version)"
  log "gemini: $(gemini --version)"
}

main "$@"
