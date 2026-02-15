@echo off
REM LUMINEX Server Startup Script
REM Starts both backend and frontend servers

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ┃          LUMINEX - Starting Servers                         ┃
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Kill any existing node processes (optional)
echo [1/4] Checking for existing processes...
tasklist | findstr "node.exe" >nul
if %errorlevel% equ 0 (
    echo Found existing node processes, terminating...
    taskkill /IM node.exe /F >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo [2/4] Starting Backend Server (port 5001)...
cd /d "d:\INSTA AUTOMATION\backend"
start "Backend Server" cmd /k npm run dev

echo [3/4] Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo [4/4] Starting Frontend Server (port 3000/3001)...
cd /d "d:\INSTA AUTOMATION\frontend"
start "Frontend Server" cmd /k npm run dev

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    SERVERS STARTING                        ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Backend:  http://localhost:5001                           ║
echo ║  Frontend: http://localhost:3000 (or 3001 if in use)       ║
echo ┃  MongoDB:  Connected to LUMINEX cluster                     ┃
echo ╠════════════════════════════════════════════════════════════╣
echo ║  Health Check:  curl http://localhost:5001/health          ║
echo ║  API Info:      curl http://localhost:5001/                ║
echo ║  Frontend:      Open browser to http://localhost:3000      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Check the two new command windows above for server output.
echo.
pause
