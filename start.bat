@echo off
REM ============================================================
REM VideoDiscovery — Start Script (CMD / Windows)
REM Starts both Backend and Frontend in separate windows.
REM Run from project root: start.bat
REM ============================================================

echo ==============================
echo  VideoDiscovery — Starting...
echo ==============================

set PROJECT_ROOT=%~dp0
set BACKEND_DIR=%PROJECT_ROOT%Backend
set FRONTEND_DIR=%PROJECT_ROOT%frontend

REM ── Backend (uses venv python directly for ML deps) ──
echo.
echo [Backend] Starting FastAPI server on port 8000...
start "VideoDiscovery-Backend" cmd /k "cd /d %BACKEND_DIR% && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

REM ── Frontend ──
echo.
echo [Frontend] Starting Vite dev server...
start "VideoDiscovery-Frontend" cmd /k "cd /d %FRONTEND_DIR% && npm run dev"

echo.
echo ==============================
echo  Both servers are starting!
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  Close the terminal windows to stop.
echo ==============================
