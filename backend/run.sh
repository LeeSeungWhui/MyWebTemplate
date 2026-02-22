#!/usr/bin/env bash
# 파일명: backend/run.sh
# 작성자: Codex
# 설명: FastAPI 백엔드 prod/dev 실행/중지/상태 확인/재시작 스크립트

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

CONFIG_FILE="$SCRIPT_DIR/config.ini"
PID_FILE_PROD="$LOG_DIR/backend.pid"
PID_FILE_DEV="$LOG_DIR/backend-dev.pid"
OUT_FILE_PROD="$LOG_DIR/backend.out"
ERR_FILE_PROD="$LOG_DIR/backend.err"
OUT_FILE_DEV="$LOG_DIR/backend-dev.out"
ERR_FILE_DEV="$LOG_DIR/backend-dev.err"

parse_port() {
  if [[ -f "$CONFIG_FILE" ]]; then
    # INI 파싱: [SERVER] 섹션의 port 값을 가져온다.
    # 섹션 이후 첫 port= 라인 추출
    awk -F '=' '
      BEGIN { in_server=0 }
      /^\[SERVER\]/ { in_server=1; next }
      /^\[/ { in_server=0 }
      in_server && tolower($1) ~ /^port[[:space:]]*$/ { gsub(/[[:space:]]/, "", $2); print $2; exit }
    ' "$CONFIG_FILE"
  fi
}

SERVER_PORT_PROD="$(parse_port)"
SERVER_PORT_PROD="${SERVER_PORT_PROD:-2000}"
SERVER_PORT_DEV="${BACKEND_DEV_PORT:-2100}"

start_mode() {
  local mode="${1:-prod}"
  local pid_file="$PID_FILE_PROD"
  local out_file="$OUT_FILE_PROD"
  local err_file="$ERR_FILE_PROD"
  local port="$SERVER_PORT_PROD"
  local extra_args=()

  if [[ "$mode" == "dev" ]]; then
    pid_file="$PID_FILE_DEV"
    out_file="$OUT_FILE_DEV"
    err_file="$ERR_FILE_DEV"
    port="$SERVER_PORT_DEV"
    extra_args+=(--reload)
  fi

  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "백엔드($mode) 이미 실행 중 (PID $(cat "$pid_file"))"
    return
  fi
  echo "백엔드($mode) 시작... (port=$port)"
  (
    cd "$SCRIPT_DIR"
    uvicorn server:app --host 0.0.0.0 --port "$port" "${extra_args[@]}" \
      >>"$out_file" 2>>"$err_file" &
    echo $! >"$pid_file"
  )
  echo "백엔드($mode) 시작됨 (PID $(cat "$pid_file"))"
}

stop_mode() {
  local mode="${1:-prod}"
  local pid_file="$PID_FILE_PROD"
  if [[ "$mode" == "dev" ]]; then
    pid_file="$PID_FILE_DEV"
  fi
  if [[ -f "$pid_file" ]]; then
    local pid
    pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      echo "백엔드($mode) 종료 (PID $pid)"
      kill "$pid"
    fi
    rm -f "$pid_file"
  else
    echo "백엔드($mode) 실행 기록 없음"
  fi
}

status_mode() {
  local mode="${1:-prod}"
  local pid_file="$PID_FILE_PROD"
  if [[ "$mode" == "dev" ]]; then
    pid_file="$PID_FILE_DEV"
  fi
  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "백엔드($mode) 실행 중 (PID $(cat "$pid_file"))"
  else
    echo "백엔드($mode) 정지"
  fi
}

restart_mode() {
  local mode="${1:-prod}"
  stop_mode "$mode"
  start_mode "$mode"
}

case "${1:-}" in
  start) start_mode prod ;;
  stop) stop_mode prod ;;
  status) status_mode prod ;;
  restart) restart_mode prod ;;
  start-dev) start_mode dev ;;
  stop-dev) stop_mode dev ;;
  status-dev) status_mode dev ;;
  restart-dev) restart_mode dev ;;
  *)
    echo "사용법: $0 {start|stop|status|restart|start-dev|stop-dev|status-dev|restart-dev}"
    exit 1
    ;;
esac
