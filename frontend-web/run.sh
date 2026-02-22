#!/usr/bin/env bash
# 파일명: frontend-web/run.sh
# 작성자: Codex
# 설명: Next.js 프론트엔드 prod/dev 실행/중지/상태 확인/재시작 스크립트

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

CONFIG_FILE="$SCRIPT_DIR/config.ini"
PID_FILE_PROD="$LOG_DIR/frontend.pid"
PID_FILE_DEV="$LOG_DIR/frontend-dev.pid"
OUT_FILE_PROD="$LOG_DIR/frontend.out"
ERR_FILE_PROD="$LOG_DIR/frontend.err"
OUT_FILE_DEV="$LOG_DIR/frontend-dev.out"
ERR_FILE_DEV="$LOG_DIR/frontend-dev.err"

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

PROD_PORT="$(parse_port)"
PROD_PORT="${PROD_PORT:-4000}"
DEV_PORT="${FRONTEND_DEV_PORT:-3000}"

ensure_build_for_prod() {
  if [[ ! -f "$SCRIPT_DIR/.next/BUILD_ID" ]]; then
    echo "프론트엔드(prod) 빌드 없음. pnpm build 실행..."
    (cd "$SCRIPT_DIR" && pnpm build)
  fi
}

start_mode() {
  local mode="${1:-prod}"
  local pid_file="$PID_FILE_PROD"
  local out_file="$OUT_FILE_PROD"
  local err_file="$ERR_FILE_PROD"
  local port="$PROD_PORT"
  local cmd=("pnpm" "start" "--" "--port" "$port")

  if [[ "$mode" == "dev" ]]; then
    pid_file="$PID_FILE_DEV"
    out_file="$OUT_FILE_DEV"
    err_file="$ERR_FILE_DEV"
    port="$DEV_PORT"
    cmd=("pnpm" "dev" "--" "--port" "$port")
  else
    ensure_build_for_prod
  fi

  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "프론트엔드($mode) 이미 실행 중 (PID $(cat "$pid_file"))"
    return
  fi
  echo "프론트엔드($mode) 시작... (port=$port)"
  (
    cd "$SCRIPT_DIR"
    "${cmd[@]}" >>"$out_file" 2>>"$err_file" &
    echo $! >"$pid_file"
  )
  echo "프론트엔드($mode) 시작됨 (PID $(cat "$pid_file"))"
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
      echo "프론트엔드($mode) 종료 (PID $pid)"
      kill "$pid"
    fi
    rm -f "$pid_file"
  else
    echo "프론트엔드($mode) 실행 기록 없음"
  fi
}

status_mode() {
  local mode="${1:-prod}"
  local pid_file="$PID_FILE_PROD"
  if [[ "$mode" == "dev" ]]; then
    pid_file="$PID_FILE_DEV"
  fi
  if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
    echo "프론트엔드($mode) 실행 중 (PID $(cat "$pid_file"))"
  else
    echo "프론트엔드($mode) 정지"
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
