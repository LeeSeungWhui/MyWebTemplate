set "TEMP_ENV=%~dp0..\..\.."
set "TEMP_PATH=%SystemRoot%\system32;"
set "TEMP_PATH=%SystemRoot%;%TEMP_PATH%"
set "TEMP_PATH=%TEMP_ENV%\node-v22.13.1-win-x64;%TEMP_PATH%"
set "TEMP_PATH=%TEMP_ENV%\Python3.12.8;%TEMP_PATH%"

:: PATH를 TEMP_PATH로 대체한다.
set "PATH=%TEMP_PATH%"

:: 새 환경변수를 확인하기 위해 path를 출력해본다.
echo Updated path:
echo %PATH%
