#!/usr/bin/env bash

SCRIPT_SOURCE="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd -L)"
SCRIPT_DIR_PHYSICAL="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd -P)"
CURRENT_DIR_PHYSICAL="$(pwd -P)"

declare -a CANDIDATE_BASES=()
add_candidate_base() {
  local candidate="$1"
  [ -n "$candidate" ] || return
  for base in "${CANDIDATE_BASES[@]}"; do
    [ "$base" = "$candidate" ] && return
  done
  CANDIDATE_BASES+=("$candidate")
}

if [ -n "$PWD" ] && [[ "$PWD" == *"/workspace/"* ]]; then
  add_candidate_base "${PWD%%/workspace/*}"
fi
if [ -n "$CURRENT_DIR_PHYSICAL" ] && [[ "$CURRENT_DIR_PHYSICAL" == *"/workspace/"* ]]; then
  add_candidate_base "${CURRENT_DIR_PHYSICAL%%/workspace/*}"
fi
if [ -n "$SCRIPT_DIR" ] && [[ "$SCRIPT_DIR" == *"/workspace/"* ]]; then
  add_candidate_base "${SCRIPT_DIR%%/workspace/*}"
fi
if [ -n "$SCRIPT_DIR_PHYSICAL" ] && [[ "$SCRIPT_DIR_PHYSICAL" == *"/workspace/"* ]]; then
  add_candidate_base "${SCRIPT_DIR_PHYSICAL%%/workspace/*}"
fi
add_candidate_base "/home/hwi/Project"
add_candidate_base "/data"

pick_tool_home() {
  local relative_path="$1"
  local candidate=""
  for candidate in "${CANDIDATE_BASES[@]}"; do
    if [ -d "$candidate/$relative_path" ]; then
      echo "$candidate/$relative_path"
      return 0
    fi
  done
  return 1
}

# JDK
if JAVA_HOME_PICKED="$(pick_tool_home "jdk-17.0.12")"; then
  export JAVA_HOME="$JAVA_HOME_PICKED"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

# Node
if NODE_HOME_PICKED="$(pick_tool_home "node-v24.11.0")"; then
  export NODE_HOME="$NODE_HOME_PICKED"
  export PATH="$NODE_HOME/bin:$PATH"
fi

# Python
if PY_HOME_PICKED="$(pick_tool_home "Python3.12.10")"; then
  export PY_HOME="$PY_HOME_PICKED"
  export PATH="$PY_HOME/bin:$PATH"
fi

# 필요하면 venv 자동 활성화
[ -d ".venv" ] && . ".venv/bin/activate"

# 현재 PATH 상태 확인용
echo -e "\n[env.sh] PATH 적용됨:\n$(echo "$PATH" | tr ':' '\n')\n"
