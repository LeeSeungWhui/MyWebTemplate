#!/usr/bin/env bash

BASE="$(cd ../../.. && pwd)"

# JDK
export JAVA_HOME="$BASE/jdk-17.0.12"
export PATH="$JAVA_HOME/bin:$PATH"

# Node
export NODE_HOME="$BASE/node-v24.11.0"
export PATH="$NODE_HOME/bin:$PATH"

# Python
export PY_HOME="$BASE/Python3.12.10"
export PATH="$PY_HOME/bin:$PATH"

# 필요하면 venv 자동 활성화
[ -d ".venv" ] && . ".venv/bin/activate"

# 현재 PATH 상태 확인용
echo -e "\n[env.sh] PATH 적용됨:\n$(echo "$PATH" | tr ':' '\n')\n"