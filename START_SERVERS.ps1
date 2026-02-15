#!/usr/bin/env powershell
# LUMINEX Server Startup Script
# Starts backend and frontend servers with proper error handling

Write-Host "================================" -ForegroundColor Green
Write-Host "LUMINEX Server Startup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Kill any existing node processes
Write-Host "[1/5] Cleaning up existing processes..." -ForegroundColor Yellow
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    Write-Host "  Found $(($nodeProcs | Measure-Object).Count) node process(es), terminating..."
    $nodeProcs | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Check backend
Write-Host "[2/5] Checking backend dependencies..." -ForegroundColor Yellow
$backendPath = "e:\INSTA AUTOMATION\backend"
if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "  Installing backend dependencies..."
    Push-Location $backendPath
    npm install
    Pop-Location
}

# Check frontend
Write-Host "[3/5] Checking frontend dependencies..." -ForegroundColor Yellow
$frontendPath = "e:\INSTA AUTOMATION\frontend"
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "  Installing frontend dependencies..."
    Push-Location $frontendPath
    npm install
    Pop-Location
}

# Start backend
Write-Host "[4/5] Starting Backend Server..." -ForegroundColor Cyan
Push-Location $backendPath
$backendProc = Start-Process -FilePath "node" -ArgumentList "src/server.js" -PassThru
Write-Host "  Backend PID: $($backendProc.Id)" -ForegroundColor Green
Pop-Location

# Wait for backend
Write-Host "[5/5] Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test backend
Write-Host ""
Write-Host "Testing Backend Connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:5001/health' -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend is responding on port 5001" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "  Database: $(if($healthData.database.connected) {'CONNECTED' } else { 'DISCONNECTED' })" -ForegroundColor Green
    }
} catch {
    Write-Host "  ❌ Backend failed to respond: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Try running: npm run dev in the backend folder manually"
}

# Start frontend
Write-Host ""
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
Push-Location $frontendPath
$frontendProc = Start-Process -FilePath "node" -ArgumentList "./node_modules/.bin/next", "dev" -PassThru
Write-Host "  Frontend PID: $($frontendProc.Id)" -ForegroundColor Green
Pop-Location

Start-Sleep -Seconds 4

# Test frontend
Write-Host ""
Write-Host "Testing Frontend Connection..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3000' -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Frontend is responding on port 3000" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Port 3000 may be in use, trying 3001..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri 'http://localhost:3001' -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Frontend is responding on port 3001" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ Frontend failed to respond" -ForegroundColor Red
    }
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "SERVERS STARTED" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend API:  http://localhost:5001" -ForegroundColor Cyan
Write-Host "📍 Frontend UI:  http://localhost:3000 or http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Green
Write-Host "   Health: curl http://localhost:5001/health" -ForegroundColor Gray
Write-Host "   API:    curl http://localhost:5001/" -ForegroundColor Gray
Write-Host ""
Write-Host "❌ To stop servers: taskkill /IM node.exe /F" -ForegroundColor Yellow
Write-Host ""
