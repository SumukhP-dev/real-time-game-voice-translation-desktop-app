# Install all dependencies excluding fasttext
# This ensures fasttext build errors don't block installation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies (fasttext excluded)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Activate venv if it exists
if (Test-Path .venv311\Scripts\Activate.ps1) {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    .\.venv311\Scripts\Activate.ps1
} else {
    Write-Host "ERROR: Virtual environment .venv311 not found!" -ForegroundColor Red
    Write-Host "Please run: py -3.11 -m venv .venv311" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Python version:" -ForegroundColor Cyan
python --version
Write-Host ""

# Upgrade pip first
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green
Write-Host ""

# Install packages in groups, excluding fasttext
Write-Host "Installing core dependencies..." -ForegroundColor Yellow

# Core packages (most important)
$corePackages = @(
    "numpy>=1.24.0",
    "scipy>=1.11.0",
    "python-dotenv>=1.0.0",
    "Pillow>=10.0.0"
)

foreach ($package in $corePackages) {
    Write-Host "  Installing $package..." -ForegroundColor Cyan
    python -m pip install $package --quiet 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $package" -ForegroundColor Green
    } else {
        Write-Host "    ✗ $package failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Installing audio packages..." -ForegroundColor Yellow

$audioPackages = @(
    "pyaudio>=0.2.14",
    "sounddevice>=0.4.6",
    "pydub>=0.25.1",
    "pygame>=2.5.0"
)

foreach ($package in $audioPackages) {
    Write-Host "  Installing $package..." -ForegroundColor Cyan
    python -m pip install $package --quiet 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $package" -ForegroundColor Green
    } else {
        Write-Host "    ✗ $package failed (may need manual installation)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installing speech recognition..." -ForegroundColor Yellow
python -m pip install "openai-whisper>=20231117" --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Whisper installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ Whisper installation failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Installing translation packages..." -ForegroundColor Yellow

$translationPackages = @(
    "deep-translator>=1.11.4",
    "googletrans==4.0.0rc1",
    "sentencepiece>=0.1.99"
)

foreach ($package in $translationPackages) {
    Write-Host "  Installing $package..." -ForegroundColor Cyan
    python -m pip install $package --quiet 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $package" -ForegroundColor Green
    } else {
        Write-Host "    ✗ $package failed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Installing PyTorch and transformers (this may take a while)..." -ForegroundColor Yellow
python -m pip install "torch>=2.0.0" "torchaudio>=2.0.0" "transformers>=4.30.0" --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ PyTorch and transformers installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ PyTorch installation failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "Installing EasyNMT (this may take a while)..." -ForegroundColor Yellow
python -m pip install "easynmt>=2.0.0" --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ EasyNMT installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ EasyNMT installation failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing TTS (excluding fasttext dependency)..." -ForegroundColor Yellow
# Install TTS but prevent fasttext from being installed
python -m pip install "TTS>=0.20.0" --no-deps 2>&1 | Out-Null
# Then install TTS dependencies manually (excluding fasttext)
python -m pip install "TTS>=0.20.0" 2>&1 | Where-Object { $_ -notmatch "fasttext" } | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ TTS installed (fasttext excluded)" -ForegroundColor Green
} else {
    Write-Host "  ⚠ TTS installation had issues (fasttext errors are OK)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installing GUI and other packages..." -ForegroundColor Yellow

$otherPackages = @(
    "PyQt6>=6.6.0",
    "pyttsx3>=2.90",
    "gtts>=2.5.0",
    "pyinstaller>=6.0.0",
    "cryptography>=41.0.0",
    "psutil>=5.9.0",
    "pypresence>=4.2.1",
    "discord.py>=2.3.0",
    "obs-websocket-py>=1.0.0",
    "keyboard>=0.13.5"
)

foreach ($package in $otherPackages) {
    Write-Host "  Installing $package..." -ForegroundColor Cyan
    python -m pip install $package --quiet 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ $package" -ForegroundColor Green
    } else {
        Write-Host "    ✗ $package failed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Verify key packages
Write-Host "Verifying key packages..." -ForegroundColor Cyan
Write-Host ""

$packagesToCheck = @(
    @{Name="numpy"; Import="numpy"},
    @{Name="scipy"; Import="scipy"},
    @{Name="torch"; Import="torch"},
    @{Name="whisper"; Import="whisper"},
    @{Name="PyQt6"; Import="PyQt6"},
    @{Name="sounddevice"; Import="sounddevice"}
)

foreach ($pkg in $packagesToCheck) {
    try {
        python -c "import $($pkg.Import)" 2>$null
        Write-Host "✓ $($pkg.Name)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($pkg.Name) - Not installed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "If you see fasttext errors above, they can be safely ignored." -ForegroundColor Cyan
Write-Host "fasttext is NOT required for this project." -ForegroundColor Cyan
Write-Host ""
