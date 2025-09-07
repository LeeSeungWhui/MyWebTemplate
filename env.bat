@echo off
set "BASE=%~dp0..\..\.."  rem D:\Project\workspace

rem PATH는 기존 PATH 위에 내 파이썬/노드만 얹기
set "PATH=%BASE%\Python3.12.8\Scripts;%BASE%\Python3.12.8;%BASE%\node-v22.19.0-win-x64;%PATH%"
set "PATH=C:\Program Files\Git\bin;%SystemRoot%\System32\WindowsPowerShell\v1.0;%PATH%"

echo %PATH%