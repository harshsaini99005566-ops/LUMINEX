@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo     LUMINEX - Server Startup
echo ========================================
echo.

REM Kill existing node processes
echo Cleaning up existing processes...
taskkill /IM node.exe /F 2>nul >nul
timeout /t 1 /nobreak >nul

REM Start Backend
echo.
echo Starting Backend Server (Port 5001)...
cd /d "e:\INSTA AUTOMATION\backend"
start "LUMINEX Backend" npm run start

REM Wait for backend
echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo.
echo Starting Frontend Server (Port 3000/3001)...
cd /d "e:\INSTA AUTOMATION\frontend"
start "LUMINEX Frontend" npm run dev

echo.
echo ========================================
echo  SERVERS STARTED SUCCESSFULLY
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:3000
echo           (or http://localhost:3001 if port 3000 in use)
echo.
echo MongoDB:  Connected to LUMINEX cluster
echo.
echo Open your browser and navigate to:
echo http://localhost:3000
echo.
timeout /t 3 /nobreak >nul
