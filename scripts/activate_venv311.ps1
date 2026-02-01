# Activate Python 3.11 virtual environment (PowerShell)
Write-Host "Activating Python 3.11 virtual environment..." -ForegroundColor Cyan

if (-not (Test-Path .venv311)) {
    Write-Host "Creating .venv311 virtual environment with Python 3.11..." -ForegroundColor Yellow
    py -3.11 -m venv .venv311
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment." -ForegroundColor Red
        Write-Host "Make sure Python 3.11 is installed." -ForegroundColor Red
        Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Virtual environment created successfully!" -ForegroundColor Green
}

.\.venv311\Scripts\Activate.ps1

Write-Host ""
Write-Host "Virtual environment activated!" -ForegroundColor Green
Write-Host "Python version:" -ForegroundColor Cyan
python --version
Write-Host ""
Write-Host "To install dependencies, run:" -ForegroundColor Yellow
Write-Host "  pip install -r requirements.txt" -ForegroundColor White
Write-Host ""
Write-Host "To deactivate, run:" -ForegroundColor Yellow
Write-Host "  deactivate" -ForegroundColor White
