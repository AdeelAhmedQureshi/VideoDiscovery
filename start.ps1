g# ============================================================
# VideoDiscovery — Start Script (PowerShell)
# Starts both Backend and Frontend in separate windows.
# Run from project root: .\start.ps1
# ============================================================

Write-Host "=============================="
Write-Host " VideoDiscovery — Starting..."
Write-Host "=============================="

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "Backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"

# ── Backend (uses venv python directly for ML deps) ──
Write-Host ""
Write-Host "[Backend] Starting FastAPI server on port 8000..."

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$BackendDir'; .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
)

# ── Frontend ──
Write-Host ""
Write-Host "[Frontend] Starting Vite dev server..."

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "cd '$FrontendDir'; npm run dev"
)

Write-Host ""
Write-Host "=============================="
Write-Host " Both servers are starting!"
Write-Host " Backend:  http://localhost:8000"
Write-Host " Frontend: http://localhost:5173"
Write-Host " Close the spawned windows to stop."
Write-Host "=============================="
