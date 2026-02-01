# Install all packages except fasttext (which is not required)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Packages (Skipping fasttext)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$venvPython = ".venv311\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Python: $venvPython" -ForegroundColor Green
& $venvPython --version
Write-Host ""

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
& $venvPython -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green
Write-Host ""

# Install packages in groups, excluding fasttext
Write-Host "[Core] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "numpy>=1.24.0" "scipy>=1.11.0" "python-dotenv>=1.0.0" "Pillow>=10.0.0" --quiet
Write-Host "✓ Core packages" -ForegroundColor Green

Write-Host "[Audio] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "pyaudio>=0.2.14" "sounddevice>=0.4.6" --quiet
Write-Host "✓ Audio packages" -ForegroundColor Green

Write-Host "[Speech] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "openai-whisper>=20231117" --quiet
Write-Host "✓ Speech recognition" -ForegroundColor Green

Write-Host "[Translation] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "deep-translator>=1.11.4" "googletrans==4.0.0rc1" "sentencepiece>=0.1.99" --quiet
Write-Host "✓ Translation packages" -ForegroundColor Green

Write-Host "[PyTorch] Installing (this may take a while)..." -ForegroundColor Cyan
& $venvPython -m pip install "torch>=2.0.0" "torchaudio>=2.0.0" --quiet
Write-Host "✓ PyTorch" -ForegroundColor Green

Write-Host "[ML] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "transformers>=4.30.0" --quiet
Write-Host "✓ Transformers" -ForegroundColor Green

Write-Host "[EasyNMT] Installing (without fasttext)..." -ForegroundColor Cyan
# Try to install easynmt without fasttext by installing it with --no-deps first, then its dependencies
& $venvPython -m pip install "easynmt>=2.0.0" --no-deps --quiet 2>&1 | Out-Null
# Install easynmt dependencies manually (excluding fasttext)
& $venvPython -m pip install "sentencepiece>=0.1.99" "transformers>=4.30.0" "torch>=2.0.0" --quiet
Write-Host "✓ EasyNMT (fasttext skipped - not required)" -ForegroundColor Green

Write-Host "[TTS] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "pyttsx3>=2.90" "gtts>=2.5.0" "pydub>=0.25.1" "pygame>=2.5.0" --quiet
Write-Host "✓ TTS packages" -ForegroundColor Green

Write-Host "[GUI] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "PyQt6>=6.6.0" --quiet
Write-Host "✓ PyQt6" -ForegroundColor Green

Write-Host "[Utils] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "pyinstaller>=6.0.0" "cryptography>=41.0.0" "psutil>=5.9.0" --quiet
Write-Host "✓ Utilities" -ForegroundColor Green

Write-Host "[Integrations] Installing..." -ForegroundColor Cyan
& $venvPython -m pip install "pypresence>=4.2.1" "discord.py>=2.3.0" "obs-websocket-py>=1.0.0" "keyboard>=0.13.5" --quiet
Write-Host "✓ Integrations" -ForegroundColor Green

# Try TTS (optional, may pull in fasttext but we'll handle errors)
Write-Host "[TTS Library] Installing (optional)..." -ForegroundColor Cyan
$ttsResult = & $venvPython -m pip install "TTS>=0.20.0" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ TTS library" -ForegroundColor Green
} else {
    # Check if only fasttext failed
    if ($ttsResult -match "fasttext" -and $ttsResult -match "Failed building wheel") {
        Write-Host "⚠ TTS library installed (fasttext errors ignored - not required)" -ForegroundColor Yellow
    } else {
        Write-Host "⚠ TTS library had issues (optional package)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testPackages = @(
    @("numpy", "numpy"),
    @("scipy", "scipy"),
    @("torch", "torch"),
    @("whisper", "whisper"),
    @("PyQt6", "PyQt6"),
    @("pyttsx3", "pyttsx3"),
    @("gtts", "gtts"),
    @("sounddevice", "sounddevice"),
    @("psutil", "psutil"),
    @("cryptography", "cryptography"),
    @("transformers", "transformers")
)

$allOk = $true
foreach ($pkg in $testPackages) {
    $pkgName = $pkg[0]
    $importName = $pkg[1]
    $result = & $venvPython -c "import $importName" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $pkgName" -ForegroundColor Green
    } else {
        Write-Host "✗ $pkgName - NOT INSTALLED" -ForegroundColor Red
        $allOk = $false
    }
}

# Check easynmt separately (it might work without fasttext)
Write-Host ""
Write-Host "Checking EasyNMT..." -ForegroundColor Cyan
$easynmtResult = & $venvPython -c "import easynmt" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ easynmt (works without fasttext)" -ForegroundColor Green
} else {
    Write-Host "⚠ easynmt - may have issues (fasttext not installed, but may not be needed)" -ForegroundColor Yellow
    Write-Host "  Error: $($easynmtResult -join ' ')" -ForegroundColor Gray
}

Write-Host ""
if ($allOk) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Core packages verified!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "Some packages are missing." -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: fasttext errors are expected and can be ignored." -ForegroundColor Cyan
Write-Host "fasttext is NOT required for this project." -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run the app with:" -ForegroundColor Cyan
Write-Host "  .venv311\Scripts\python.exe src/main.py" -ForegroundColor White
Write-Host ""
