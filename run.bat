@echo off
title Barangay Profiling System Starter

echo Starting Barangay Profiling System...

:: Check if backend/.env exists
if not exist "backend\.env" (
    echo Configuring backend environment...
    copy .envcopy backend\.env
)

:: Navigate to backend, install if needed, and start in a new command pane
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
)
echo Starting backend...
start "NestJS Backend" cmd /c "npm run start:dev"
cd ..

:: Start frontend static server in a new command pane
echo Starting frontend...
start "Frontend Server" cmd /c "npx serve -s frontend -l 5500"

:: Wait briefly and open the browser
timeout /t 2 >nul
start http://localhost:5500/residents.html

echo --------------------------------------------------
echo Backend is running at http://localhost:3000
echo Frontend is running at http://localhost:5500
echo Close the launched terminal windows to stop the servers.
echo --------------------------------------------------
pause
