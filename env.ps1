param(
  # 선택: 베이스 경로 지정 (기본값은 이 파일 기준 ..\..\..)
  [string]$Base = $null
)

$ErrorActionPreference = 'Stop'

# --- BASE 해석 (기본: ..\..\.. -> 예: D:\Project\workspace) ---
if (-not $Base) {
  $Base = Resolve-Path (Join-Path $PSScriptRoot '..\..\..')
}

# --- 기존 PATH 유지 + 내 파이썬/노드만 앞에 추가 ---
$prepend = @(
  (Join-Path $Base 'Python3.12.8\Scripts'),
  (Join-Path $Base 'Python3.12.8'),
  (Join-Path $Base 'node-v22.13.1-win-x64')
) -join ';'
$env:Path = "$prepend;$($env:Path)"

# PowerShell / Git 경로 보장 (여러 번 호출해도 안전)
$psPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0'
$gitBin = 'C:\Program Files\Git\bin'
foreach ($p in @($psPath, $gitBin)) {
  if ($env:Path -notmatch [regex]::Escape($p)) { $env:Path = "$p;$($env:Path)" }
}

# --- 중앙 도구 폴더(여기에 runmcp_multi.bat, server_multi_ws.py 있음) ---
$env:MCP_TOOLS_DIR = 'D:\Project\workspace\My\mcpCODEX'

# --- 단일 루트 모드 (루트 아래 모든 프로젝트 다룸) ---
$env:MCP_ROOT = 'D:\Project\workspace'

# --- 기본 테스트 커맨드 (필요시 호출 때 덮어쓰기) ---
$env:MCP_TEST_CMD = 'npm test --silent'

Write-Host "Updated PATH:"
Write-Host $env:Path
Write-Host "MCP_TOOLS_DIR = $($env:MCP_TOOLS_DIR)"
Write-Host "MCP_ROOT      = $($env:MCP_ROOT)"
Write-Host "MCP_TEST_CMD  = $($env:MCP_TEST_CMD)"