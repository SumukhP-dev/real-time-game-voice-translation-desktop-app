# Install all required packages in .venv311
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing All Packages in .venv311" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$venvPython = ".venv311\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please create it first: py -3.11 -m venv .venv311" -ForegroundColor Yellow
    exit 1
}

Write-Host "Python: $venvPython" -ForegroundColor Green
& $venvPython --version
Write-Host ""

# Upgrade pip first
Write-Host "Upgrading pip..." -ForegroundColor Yellow
& $venvPython -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green
Write-Host ""

# Install in groups for better visibility
$packages = @{
    "Core" = @("numpy>=1.24.0", "scipy>=1.11.0", "python-dotenv>=1.0.0", "Pillow>=10.0.0")
    "Audio" = @("pyaudio>=0.2.14", "sounddevice>=0.4.6")
    "Speech" = @("openai-whisper>=20231117")
    "Translation" = @("deep-translator>=1.11.4", "googletrans==4.0.0rc1", "sentencepiece>=0.1.99")
    "PyTorch" = @("torch>=2.0.0", "torchaudio>=2.0.0")
    "ML" = @("transformers>=4.30.0")
    "EasyNMT" = @("easynmt>=2.0.0")
    "TTS" = @("pyttsx3>=2.90", "gtts>=2.5.0", "pydub>=0.25.1", "pygame>=2.5.0")
    "GUI" = @("PyQt6>=6.6.0")
    "Utils" = @("pyinstaller>=6.0.0", "cryptography>=41.0.0", "psutil>=5.9.0")
    "Integrations" = @("pypresence>=4.2.1", "discord.py>=2.3.0", "obs-websocket-py>=1.0.0", "keyboard>=0.13.5")
}

foreach ($group in $packages.Keys) {
    Write-Host "[$group] Installing packages..." -ForegroundColor Cyan
    $pkgList = $packages[$group] -join " "
    $result = & $venvPython -m pip install $pkgList 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $group packages installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ $group had some issues (check output above)" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Verify installation
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testPackages = @(
    "numpy", "scipy", "torch", "whisper", "PyQt6", 
    "pyttsx3", "gtts", "sounddevice", "psutil", "cryptography"
)

$allOk = $true
foreach ($pkg in $testPackages) {
    $result = & $venvPython -c "import $pkg" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $pkg" -ForegroundColor Green
    } else {
        Write-Host "✗ $pkg - NOT INSTALLED" -ForegroundColor Red
        $allOk = $false
    }
}

Write-Host ""
if ($allOk) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "All packages verified!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Some packages are missing. Try running again." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "You can now run the app with:" -ForegroundColor Cyan
Write-Host "  .venv311\Scripts\python.exe src/main.py" -ForegroundColor White
Write-Host ""
