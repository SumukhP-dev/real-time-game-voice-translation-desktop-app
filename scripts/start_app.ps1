# Start Tauri App Script
# This script starts the Tauri application

$projectRoot = "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod"

# Navigate to tauri-app directory
Set-Location "$projectRoot\tauri-app"

# Start the app
Write-Host "Starting Tauri App..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run (Rust compilation)..." -ForegroundColor Yellow
npm run tauri dev

