"""
Service orchestration and lifecycle management
"""
import subprocess
import sys
import os
from pathlib import Path

def start_service(host: str = "127.0.0.1", port: int = 8000):
    """Start the ML service as a subprocess"""
    service_dir = Path(__file__).parent
    main_py = service_dir / "main.py"
    
    # Start uvicorn server
    cmd = [
        sys.executable,
        "-m", "uvicorn",
        "main:app",
        "--host", host,
        "--port", str(port)
    ]
    
    process = subprocess.Popen(
        cmd,
        cwd=str(service_dir),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    return process

if __name__ == "__main__":
    # Run service directly
    from main import app
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
