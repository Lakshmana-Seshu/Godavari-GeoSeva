# Godavari GeoSeva 2027 All-in-One Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Godavari GeoSeva 2027 Full-Stack System" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Start MongoDB
Write-Host "[1/3] Starting MongoDB Database Engine..." -ForegroundColor Green
Start-Process "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" -ArgumentList "--dbpath `"d:\hackton2027\mongodb_data`"" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Start Backend API Server
Write-Host "[2/3] Starting API Server on Port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\hackton2027\server'; npm run dev"

Start-Sleep -Seconds 2

# 3. Start Frontend Client Dev Server
Write-Host "[3/3] Starting React + Vite Frontend on Port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\hackton2027\client'; npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  All services running! Opening http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

