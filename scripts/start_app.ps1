# Start  App Script
# This script starts the  application

$projectRoot = "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod"

# Navigate to -app directory
Set-Location "$projectRoot\-app"

# Start the app
Write-Host "Starting  App..." -ForegroundColor Cyan
Write-Host "This may take a few minutes on first run (Rust compilation)..." -ForegroundColor Yellow
npm run  dev

