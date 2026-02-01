# Verify Installation in .venv311
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verifying Package Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path .venv311\Scripts\python.exe)) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Run: .\install_requirements_venv311.ps1" -ForegroundColor Yellow
    exit 1
}

$python = ".venv311\Scripts\python.exe"

Write-Host "Python version:" -ForegroundColor Cyan
& $python --version
Write-Host ""

# Test key packages
$packages = @(
    @{Name="torch"; Display="PyTorch"},
    @{Name="torchaudio"; Display="TorchAudio"},
    @{Name="whisper"; Display="OpenAI Whisper"},
    @{Name="easynmt"; Display="EasyNMT"},
    @{Name="transformers"; Display="Transformers"},
    @{Name="TTS"; Display="Coqui TTS"},
    @{Name="pyaudio"; Display="PyAudio"},
    @{Name="sounddevice"; Display="SoundDevice"},
    @{Name="pyttsx3"; Display="pyttsx3"},
    @{Name="gtts"; Display="gTTS"},
    @{Name="obswebsocket"; Display="OBS WebSocket"},
    @{Name="pypresence"; Display="PyPresence"},
    @{Name="discord"; Display="discord.py"},
    @{Name="numpy"; Display="NumPy"},
    @{Name="scipy"; Display="SciPy"},
    @{Name="cryptography"; Display="Cryptography"},
    @{Name="psutil"; Display="psutil"}
)

$installed = 0
$failed = 0

foreach ($pkg in $packages) {
    try {
        $result = & $python -c "import $($pkg.Name)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ $($pkg.Display): OK" -ForegroundColor Green
            $installed++
        } else {
            Write-Host "✗ $($pkg.Display): Not installed" -ForegroundColor Red
            $failed++
        }
    } catch {
        Write-Host "✗ $($pkg.Display): Not installed" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary: $installed installed, $failed failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "Some packages failed to install." -ForegroundColor Yellow
    Write-Host "Try running: .venv311\Scripts\python.exe -m pip install -r requirements.txt" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "All packages installed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run the application with:" -ForegroundColor Cyan
    Write-Host "  .venv311\Scripts\python.exe src\main.py" -ForegroundColor White
}
