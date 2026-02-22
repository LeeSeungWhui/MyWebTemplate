#!/usr/bin/env bash
# 파일명: backend/run.sh
# 작성자: Codex
# 설명: FastAPI 백엔드를 백그라운드로 실행/중지/상태 확인/재시작하는 스크립트

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

PID_FILE="$LOG_DIR/backend.pid"
CONFIG_FILE="$SCRIPT_DIR/config.ini"

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

SERVER_PORT="$(parse_port)"
SERVER_PORT="${SERVER_PORT:-2000}"

start() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "백엔드가 이미 실행 중 (PID $(cat "$PID_FILE"))"
    return
  fi
  echo "백엔드 시작..."
  (
    cd "$SCRIPT_DIR"
    uvicorn server:app --host 0.0.0.0 --port "$SERVER_PORT" --reload \
      >>"$LOG_DIR/backend.out" 2>>"$LOG_DIR/backend.err" &
    echo $! >"$PID_FILE"
  )
  echo "백엔드 시작됨 (PID $(cat "$PID_FILE"))"
}

stop() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "백엔드 종료 (PID $pid)"
      kill "$pid"
    fi
    rm -f "$PID_FILE"
  else
    echo "백엔드 실행 기록 없음"
  fi
}

status() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "백엔드 실행 중 (PID $(cat "$PID_FILE"))"
  else
    echo "백엔드 정지"
  fi
}

restart() {
  stop
  start
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  restart) restart ;;
  *)
    echo "사용법: $0 {start|stop|status|restart}"
    exit 1
    ;;
esac
