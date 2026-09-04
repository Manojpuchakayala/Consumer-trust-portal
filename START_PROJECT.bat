@echo off
TITLE Consumer Trust Portal - Grievance Platform Launcher
COLOR 0B
echo ================================================================
echo    CONSUMER TRUST : NATIONAL GRIEVANCE REDRESSAL PLATFORM
echo    100%% Free WhatsApp Grievance Cards & 1-Tap Live Tracking
echo ================================================================
echo.
echo [1/2] Launching Backend API & MongoDB Atlas Cloud Connection...
start "Consumer Trust Backend API" cmd /k "cd backend && npm start"

echo [2/2] Launching React Frontend UI with Vite...
start "Consumer Trust Frontend Web" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:5173/

echo.
echo ================================================================
echo  All services launched successfully!
echo  Local Frontend UI:   http://localhost:5173/
echo  Local Backend API:   http://localhost:5000/api/health
echo  Production Frontend: https://consumer-trust-portal.vercel.app
echo  Production Backend:  https://consumer-trust-api.onrender.com/
echo ================================================================
pause
