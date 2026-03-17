@echo off
setlocal
set SCRIPT_DIR=%~dp0

echo ================================================
echo LUMINEX Startup Launcher
echo ================================================
echo Running PowerShell startup script from:
echo %SCRIPT_DIR%
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%START_SERVERS.ps1"

if errorlevel 1 (
    echo.
    echo Startup failed. Review the error output above.
    exit /b 1
)

echo.
echo Startup complete.
exit /b 0
