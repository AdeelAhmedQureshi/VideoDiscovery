#!/bin/bash
# ============================================================
# VideoDiscovery — Start Script (Git Bash / Linux / macOS)
# Starts both Backend (FastAPI) and Frontend (Vite) together.
# Run from the project root: bash Backend/start.sh
# ============================================================

echo "=============================="
echo " VideoDiscovery — Starting..."
echo "=============================="

# Resolve project root (parent of Backend/)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/Backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# ── Backend ──
echo ""
echo "[Backend] Starting FastAPI server on port 8000..."
cd "$BACKEND_DIR"

# Use venv python directly (required for ML dependencies)
if [ -f "venv/Scripts/python.exe" ]; then
    # Git Bash on Windows
    ./venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
elif [ -f "venv/bin/python" ]; then
    # Linux / macOS
    ./venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
else
    echo "[Backend] ERROR: venv not found! Run: python -m venv venv && pip install -r requirements.txt"
    exit 1
fi
BACKEND_PID=$!
echo "[Backend] PID: $BACKEND_PID"

# ── Frontend ──
echo ""
echo "[Frontend] Starting Vite dev server..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo "[Frontend] PID: $FRONTEND_PID"

# ── Wait ──
echo ""
echo "=============================="
echo " Both servers are running!"
echo " Backend:  http://localhost:8000"
echo " Frontend: http://localhost:5173"
echo " Press Ctrl+C to stop both."
echo "=============================="

trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
