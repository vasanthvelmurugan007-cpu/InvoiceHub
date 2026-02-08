@echo off
setlocal
cd /d "%~dp0"
echo Starting InvoiceHub...

:: Start Backend
echo Starting Backend...
start "InvoiceHub Server" /min cmd /c "cd server && npm start"

:: Wait briefly
timeout /t 2 /nobreak >nul

:: Start Frontend
echo Starting Frontend...
start "InvoiceHub Client" /min cmd /c "cd client && npm run dev"

:: Wait for servers to boot up
echo Waiting for servers to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

:: Open in Browser
start http://localhost:5173

echo InvoiceHub is running! You can minimize this window.
pause
