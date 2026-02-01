"""
Test runner with retry logic and detailed reporting
"""

import sys
import subprocess
import time
import requests
from pathlib import Path

def check_ml_service(max_retries=5, delay=2):
    """Check if ML service is running, with retries"""
    for i in range(max_retries):
        try:
            response = requests.get("http://127.0.0.1:8000/health", timeout=2)
            if response.status_code == 200:
                return True
        except:
            pass
        
        if i < max_retries - 1:
            print(f"ML service not ready, retrying in {delay} seconds... ({i+1}/{max_retries})")
            time.sleep(delay)
    
    return False

def main():
    print("="*70)
    print("Integration Test Runner")
    print("="*70)
    print()
    
    # Check ML service
    print("Checking ML service...")
    if not check_ml_service():
        print("\nERROR: ML service is not running!")
        print("\nTo start the ML service:")
        print("  1. Activate virtual environment:")
        print("     .venv311\\Scripts\\Activate.ps1")
        print("  2. Navigate to ML service:")
        print("     cd tauri-app\\ml-service")
        print("  3. Start the service:")
        print("     python -m uvicorn main:app --host 127.0.0.1 --port 8000")
        print("\nThen run this test again.")
        return 1
    
    print("[OK] ML service is running")
    print()
    
    # Run tests
    test_file = Path(__file__).parent / "integration_test_suite.py"
    
    print("Running integration tests...")
    print("-"*70)
    
    result = subprocess.run(
        [sys.executable, str(test_file)],
        cwd=Path(__file__).parent.parent
    )
    
    return result.returncode

if __name__ == "__main__":
    exit(main())

