import subprocess
import sys
import os
import time

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "Backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    print("==============================")
    print(" VideoDiscovery — Starting...")
    print("==============================")

    # 1. Determine local Python executable paths based on OS
    venv_python = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        # Fallback for Linux/Mac
        venv_python = os.path.join(backend_dir, "venv", "bin", "python") 
        
    if not os.path.exists(venv_python):
        print(f"[Error] Virtual environment not found at {venv_python}")
        print("Please ensure you have created your venv inside the Backend folder.")
        sys.exit(1)

    # 2. Define Commands
    backend_cmd = [
        venv_python, "-m", "uvicorn", "app.main:app", 
        "--host", "127.0.0.1", "--port", "8000", "--reload"
    ]
    
    frontend_cmd = "npm run dev"

    try:
        print("\n[Backend] Starting FastAPI server on port 8000...")
        backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)
        
        print("\n[Frontend] Starting Vite dev server...")
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir, shell=True)

        print("\n==============================")
        print("  Both servers are starting cleanly!")
        print(" Backend:  http://localhost:8000")
        print(" Frontend: http://localhost:5173")
        print(" Press Ctrl+C to stop both servers.")
        print("==============================\n")

        # Keep main thread alive to catch Ctrl+C
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n Stop signal received. Shutting down servers gracefully...")
        try:
            backend_proc.terminate()
            frontend_proc.terminate()
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            # Force kill if they hang
            backend_proc.kill()
            frontend_proc.kill()
            
        print("All servers stopped successfully.")
        sys.exit(0)

if __name__ == "__main__":
    main()
