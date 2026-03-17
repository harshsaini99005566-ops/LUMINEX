#!/usr/bin/env powershell
# LUMINEX startup script for local development.

$ErrorActionPreference = "Stop"

function Test-HttpOk {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$TimeoutSec = 5
    )

    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSec -UseBasicParsing
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    } catch {
        return $false
    }
}

function Wait-ForHttp {
    param(
        [Parameter(Mandatory = $true)][string]$Url,
        [int]$MaxAttempts = 25,
        [int]$DelaySeconds = 2
    )

    for ($i = 1; $i -le $MaxAttempts; $i++) {
        if (Test-HttpOk -Url $Url) {
            return $true
        }
        Start-Sleep -Seconds $DelaySeconds
    }

    return $false
}

Write-Host "================================" -ForegroundColor Green
Write-Host "LUMINEX Server Startup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

$rootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $rootPath "backend"
$frontendPath = Join-Path $rootPath "frontend"
$mongoDataPath = Join-Path $rootPath "mongodb-data"
$mongoLogDir = Join-Path $rootPath "mongodb-log"
$mongoLogPath = Join-Path $mongoLogDir "mongod.log"

if (-not (Test-Path $backendPath) -or -not (Test-Path $frontendPath)) {
    throw "Could not find backend/frontend folders under $rootPath"
}

if (-not (Test-Path $mongoDataPath)) {
    New-Item -ItemType Directory -Path $mongoDataPath | Out-Null
}

if (-not (Test-Path $mongoLogDir)) {
    New-Item -ItemType Directory -Path $mongoLogDir | Out-Null
}

Write-Host "[1/6] Ensuring MongoDB is available on 127.0.0.1:27017..." -ForegroundColor Yellow
$mongoListening = (Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
if (-not $mongoListening) {
    $mongodExe = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
    if (-not (Test-Path $mongodExe)) {
        throw "MongoDB is not listening and mongod.exe was not found at '$mongodExe'."
    }

    $mongoArgs = @(
        "--dbpath", "`"$mongoDataPath`"",
        "--bind_ip", "127.0.0.1",
        "--port", "27017",
        "--logpath", "`"$mongoLogPath`"",
        "--logappend"
    )

    $mongoProc = Start-Process -FilePath $mongodExe -ArgumentList $mongoArgs -PassThru
    Write-Host "  Started mongod (PID: $($mongoProc.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

$mongoListening = (Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1)
if (-not $mongoListening) {
    throw "MongoDB did not start on port 27017. Check $mongoLogPath"
}
Write-Host "  MongoDB listening on port 27017" -ForegroundColor Green

Write-Host "[2/6] Checking backend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
    Push-Location $backendPath
    try {
        npm install
    } finally {
        Pop-Location
    }
}

Write-Host "[3/6] Checking frontend dependencies..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $frontendPath "node_modules"))) {
    Push-Location $frontendPath
    try {
        npm install
    } finally {
        Pop-Location
    }
}

Write-Host "[4/6] Starting backend (npm run dev)..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $backendPath -PassThru
Write-Host "  Backend PID: $($backendProc.Id)" -ForegroundColor Green

Write-Host "[5/6] Waiting for backend health endpoint..." -ForegroundColor Yellow
if (-not (Wait-ForHttp -Url "http://localhost:5001/health" -MaxAttempts 30 -DelaySeconds 2)) {
    throw "Backend did not become healthy at http://localhost:5001/health"
}

$healthResponse = Invoke-WebRequest -Uri "http://localhost:5001/health" -Method Get -TimeoutSec 5 -UseBasicParsing
$healthJson = $healthResponse.Content | ConvertFrom-Json
Write-Host "  Backend healthy on port 5001" -ForegroundColor Green
Write-Host "  DB connected: $($healthJson.database.connected)" -ForegroundColor Green

Write-Host "[6/6] Starting frontend (npm run dev)..." -ForegroundColor Cyan
$frontendProc = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $frontendPath -PassThru
Write-Host "  Frontend PID: $($frontendProc.Id)" -ForegroundColor Green

if (-not (Wait-ForHttp -Url "http://localhost:3000" -MaxAttempts 30 -DelaySeconds 2)) {
    throw "Frontend did not respond on http://localhost:3000"
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "SERVERS STARTED" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5001" -ForegroundColor Cyan
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Health:      http://localhost:5001/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Stop node servers:   taskkill /IM node.exe /F" -ForegroundColor Yellow
Write-Host "Stop mongod server:  taskkill /IM mongod.exe /F" -ForegroundColor Yellow
Write-Host ""
