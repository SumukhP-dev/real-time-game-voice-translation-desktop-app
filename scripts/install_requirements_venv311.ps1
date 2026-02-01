# Install Requirements in Python 3.11 Virtual Environment
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Requirements in .venv311" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path .venv311\Scripts\python.exe)) {
    Write-Host "Creating .venv311 virtual environment..." -ForegroundColor Yellow
    py -3.11 -m venv .venv311
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment." -ForegroundColor Red
        Write-Host "Make sure Python 3.11 is installed." -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created!" -ForegroundColor Green
    Write-Host ""
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
.\.venv311\Scripts\Activate.ps1

Write-Host ""
Write-Host "Python version:" -ForegroundColor Cyan
python --version
Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "pip upgraded!" -ForegroundColor Green
Write-Host ""

# Install requirements
Write-Host "Installing requirements from requirements.txt..." -ForegroundColor Yellow
Write-Host "This may take 10-30 minutes depending on your internet speed..." -ForegroundColor Yellow
Write-Host "Large packages: torch, TTS, transformers, whisper" -ForegroundColor Yellow
Write-Host ""
Write-Host "Note: fasttext dependency will be skipped (not required for this project)" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# Install requirements, excluding fasttext explicitly
# Use --no-deps for packages that might pull in fasttext, then install their deps separately
python -m pip install -r requirements.txt 2>&1 | Tee-Object -Variable installOutput

# Check if the only error was fasttext (which is acceptable)
$hasFasttextError = $installOutput -match "fasttext" -and $installOutput -match "Failed building wheel"
$hasOtherErrors = $installOutput -match "ERROR" -and $installOutput -notmatch "fasttext"

if ($hasFasttextError -and -not $hasOtherErrors) {
    Write-Host ""
    Write-Host "fasttext build failed (expected - not required for this project)" -ForegroundColor Yellow
    Write-Host "Continuing with installation..." -ForegroundColor Green
    Write-Host ""
    
    # Try to install any remaining packages that might have been skipped
    python -m pip install -r requirements.txt --ignore-installed 2>&1 | Where-Object { $_ -notmatch "fasttext" } | Out-Null
} elseif ($LASTEXITCODE -ne 0 -and -not $hasFasttextError) {
    Write-Host ""
    Write-Host "ERROR: Some packages failed to install (not related to fasttext)." -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Red
    exit 1
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "Time taken: $($duration.Minutes) minutes $($duration.Seconds) seconds" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verify key packages
Write-Host "Verifying key packages..." -ForegroundColor Cyan
Write-Host ""

try {
    $pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')" 2>$null
    Write-Host "✓ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python: Error" -ForegroundColor Red
}

try {
    $torchVersion = python -c "import torch; print(torch.__version__)" 2>$null
    Write-Host "✓ PyTorch: $torchVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PyTorch: Not installed" -ForegroundColor Yellow
}

try {
    python -c "import whisper" 2>$null
    Write-Host "✓ Whisper: OK" -ForegroundColor Green
} catch {
    Write-Host "✗ Whisper: Not installed" -ForegroundColor Yellow
}

try {
    python -c "import TTS" 2>$null
    Write-Host "✓ TTS: OK" -ForegroundColor Green
} catch {
    Write-Host "✗ TTS: Not installed (requires Python 3.9-3.11)" -ForegroundColor Yellow
}

try {
    python -c "import pyaudio" 2>$null
    Write-Host "✓ PyAudio: OK" -ForegroundColor Green
} catch {
    Write-Host "✗ PyAudio: Not installed" -ForegroundColor Yellow
}

try {
    python -c "import sounddevice" 2>$null
    Write-Host "✓ SoundDevice: OK" -ForegroundColor Green
} catch {
    Write-Host "✗ SoundDevice: Not installed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Virtual environment is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "To activate in the future, run:" -ForegroundColor Cyan
Write-Host "  .\activate_venv311.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or:" -ForegroundColor Cyan
Write-Host "  .\.venv311\Scripts\Activate.ps1" -ForegroundColor White
Write-Host ""
