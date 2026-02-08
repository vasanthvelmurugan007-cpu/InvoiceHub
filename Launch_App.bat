@echo off
echo ---------------------------------------------------
echo    STARTING INVOICE HUB - PRODUCTION MODE
echo ---------------------------------------------------
echo.
echo [1/2] Starting Local Server...
start http://localhost:5000
cd server
npm start
pause
