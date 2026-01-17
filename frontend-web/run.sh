#!/usr/bin/env bash
# 파일명: frontend-web/run.sh
# 작성자: Codex
# 설명: Next.js 프론트엔드를 백그라운드로 실행/중지/상태 확인/재시작하는 스크립트

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

PID_FILE="$LOG_DIR/frontend.pid"
CONFIG_FILE="$SCRIPT_DIR/config.ini"

parse_ini_value() {
  local section="${1:-}"
  local key="${2:-}"
  if [[ -z "$section" || -z "$key" ]]; then
    return 0
  fi
  awk -F '=' -v sec="$section" -v want="$key" '
    BEGIN { in_sec=0; want_l=tolower(want) }
    $0 ~ "^\\[" sec "\\]" { in_sec=1; next }
    $0 ~ "^\\[" { in_sec=0 }
    in_sec {
      k=$1
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", k)
      if (tolower(k) != want_l) next
      v=$2
      sub(/^[[:space:]]+/, "", v)
      sub(/[[:space:]]+$/, "", v)
      print v
      exit
    }
  ' "$CONFIG_FILE"
}

is_port_number() {
  [[ "${1:-}" =~ ^[0-9]+$ ]]
}

extract_port_from_host() {
  local input="${1:-}"
  if [[ -z "$input" ]]; then
    return 0
  fi
  local hostport="$input"
  hostport="${hostport#*://}"
  hostport="${hostport%%/*}"

  # IPv6: http://[::1]:3000
  if [[ "$hostport" =~ ^\\[[^\\]]+\\]:(.+)$ ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi

  # IPv4/hostname: localhost:3000
  if [[ "$hostport" == *:* ]]; then
    echo "${hostport##*:}"
    return 0
  fi
}

parse_port() {
  if [[ -f "$CONFIG_FILE" ]]; then
    local port
    port="$(parse_ini_value "WEB" "port" || true)"
    if is_port_number "$port"; then
      echo "$port"
      return 0
    fi

    port="$(parse_ini_value "APP" "port" || true)"
    if is_port_number "$port"; then
      echo "$port"
      return 0
    fi

    local frontendHost
    frontendHost="$(parse_ini_value "APP" "frontendHost" || true)"
    port="$(extract_port_from_host "$frontendHost" || true)"
    if is_port_number "$port"; then
      echo "$port"
      return 0
    fi
  fi
}

DEV_PORT="$(parse_port)"
DEV_PORT="${DEV_PORT:-3000}"

start() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "프론트엔드가 이미 실행 중 (PID $(cat "$PID_FILE"))"
    return
  fi
  echo "프론트엔드 시작..."
  (
    cd "$SCRIPT_DIR"
    pnpm dev -- --port "$DEV_PORT" \
      >>"$LOG_DIR/frontend.out" 2>>"$LOG_DIR/frontend.err" &
    echo $! >"$PID_FILE"
  )
  echo "프론트엔드 시작됨 (PID $(cat "$PID_FILE"))"
}

stop() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      echo "프론트엔드 종료 (PID $pid)"
      kill "$pid"
    fi
    rm -f "$PID_FILE"
  else
    echo "프론트엔드 실행 기록 없음"
  fi
}

status() {
  if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    echo "프론트엔드 실행 중 (PID $(cat "$PID_FILE"))"
  else
    echo "프론트엔드 정지"
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
