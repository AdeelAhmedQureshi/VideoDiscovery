#!/bin/bash

# ============================================================================
# VideoDiscovery Backend - Startup Script
# ============================================================================
# This script starts the FastAPI backend server for the VideoDiscovery project
# Choose your terminal type below for the best experience
# ============================================================================

echo "🚀 VideoDiscovery Backend Startup"
echo "=================================="
echo ""
echo "Choose your terminal type to run the appropriate command:"
echo ""
echo "1️⃣  POWERSHELL (Windows):"
echo "   cd \"D:\FYP Project\VideoDiscovery\Backend\" && venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2️⃣  GIT BASH (Windows):"
echo "   cd /d/FYP\\ Project/VideoDiscovery/Backend && ./venv/Scripts/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "3️⃣  CMD (Windows Command Prompt):"
echo "   cd \"D:\FYP Project\VideoDiscovery\Backend\" && venv\\Scripts\\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "4️⃣  LINUX/MAC (Unix-based):"
echo "   cd ~/FYP\\ Project/VideoDiscovery/Backend && source venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "=================================="
echo "Server will run on: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "=================================="
echo ""
echo "Starting server (using bash activation)..."
echo ""

# Activate virtual environment and start uvicorn
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port ${PORT:-8000}
