# Build SquadSpeak for Windows (NSIS installer + portable). Run on Windows 10/11.
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
Write-Host "Building SquadSpeak for Windows..."
python build_electron.py --platform win
Write-Host "Artifacts: electron-app\dist\ and .\dist\"
