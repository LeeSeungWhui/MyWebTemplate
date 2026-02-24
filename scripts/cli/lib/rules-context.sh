#!/usr/bin/env bash
set -euo pipefail

build_rule_context() {
  local root_dir="$1"
  local input_text="${2:-}"
  local mode="${3:-dev}"

  local -a docs=()
  local -a defaults=()
  if [[ "$mode" == "review" ]]; then
    defaults=(
      "AGENTS_REVIEW.md"
      "docs/common-rules.md"
      "docs/frontend-web/codding-rules-frontend.md"
      "docs/frontend-app/codding-rules-rn.md"
      "docs/backend/codding-rules-backend.md"
    )
  else
    defaults=(
      "AGENTS.md"
      "docs/common-rules.md"
      "docs/frontend-web/codding-rules-frontend.md"
      "docs/frontend-app/codding-rules-rn.md"
      "docs/backend/codding-rules-backend.md"
    )
  fi

  local path
  for path in "${defaults[@]}"; do
    [[ -f "$root_dir/$path" ]] && docs+=("$path")
  done

  # Auto-include docs paths that are explicitly referenced in the task/review text.
  if [[ -n "${input_text// }" ]]; then
    while IFS= read -r path; do
      [[ -n "$path" ]] || continue
      [[ -f "$root_dir/$path" ]] && docs+=("$path")
    done < <(printf '%s\n' "$input_text" | grep -oE 'docs/[A-Za-z0-9_./-]+\.md' | sort -u || true)
  fi

  # Optional explicit extensions (space or comma separated)
  if [[ -n "${AGENT_RULE_DOCS:-}" ]]; then
    local raw="${AGENT_RULE_DOCS//,/ }"
    for path in $raw; do
      [[ -f "$root_dir/$path" ]] && docs+=("$path")
    done
  fi

  # Unique while preserving order.
  local -A seen=()
  local -a uniq_docs=()
  for path in "${docs[@]}"; do
    [[ -n "${seen[$path]:-}" ]] && continue
    seen["$path"]=1
    uniq_docs+=("$path")
  done

  if [[ "$mode" == "review" ]]; then
    printf '%s\n' "Review policy precedence:"
    printf '%s\n' "- Primary: \`AGENTS_REVIEW.md\`"
    printf '%s\n' "- If there is any conflict with \`AGENTS.md\`, follow \`AGENTS_REVIEW.md\`."
  else
    printf '%s\n' "Development policy precedence:"
    printf '%s\n' "- Primary: \`AGENTS.md\`"
  fi
  printf '%s\n' "Policy documents to load and follow strictly:"
  if [[ "${#uniq_docs[@]}" -eq 0 ]]; then
    printf '%s\n' "- (No policy docs found in workspace; report this explicitly if it happens.)"
  else
    for path in "${uniq_docs[@]}"; do
      printf -- "- \`%s\`\n" "$path"
    done
  fi
  printf '%s\n' "If a referenced policy doc is missing, report it clearly before proceeding."
}
