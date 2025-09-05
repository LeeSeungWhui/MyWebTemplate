@echo off
set "BASE=%~dp0..\..\.."  rem D:\Project\workspace

rem PATH는 기존 PATH 위에 내 파이썬/노드만 얹기
set "PATH=%BASE%\Python3.12.8\Scripts;%BASE%\Python3.12.8;%BASE%\node-v22.13.1-win-x64;%PATH%"
set "PATH=C:\Program Files\Git\bin;%SystemRoot%\System32\WindowsPowerShell\v1.0;%PATH%"

rem 중앙 도구 폴더
set MCP_TOOLS_DIR=D:\Project\workspace\My\mcpCODEX

rem ✅ 단일 루트만 지정 (멀티 매핑 불필요)
set MCP_ROOT=D:\Project\workspace

rem 기본 테스트 커맨드(필요 시 각 호출에서 덮어쓰기)
set MCP_TEST_CMD=npm test --silent

echo %PATH%