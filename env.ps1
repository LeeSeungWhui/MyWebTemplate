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
  (Join-Path $Base 'node-v22.19.0-win-x64')
) -join ';'
$env:Path = "$prepend;$($env:Path)"

# PowerShell / Git 경로 보장 (여러 번 호출해도 안전)
$psPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0'
$gitBin = 'C:\Program Files\Git\bin'
foreach ($p in @($psPath, $gitBin)) {
  if ($env:Path -notmatch [regex]::Escape($p)) { $env:Path = "$p;$($env:Path)" }
}