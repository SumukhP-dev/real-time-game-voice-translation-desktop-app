# Start ML Service Script
# This script starts the ML service with the correct paths

$projectRoot = "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod"

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "$projectRoot\activate_venv311.ps1"

# Navigate to ML service directory
Set-Location "$projectRoot\tauri-app\ml-service"

# Start the service
Write-Host "Starting ML Service on port 8000..." -ForegroundColor Cyan
python -m uvicorn main:app --host 127.0.0.1 --port 8000

