# SquadSpeak GPU venv — Python 3.12 + PyTorch CUDA (RTX 4060 / cu128)
$ErrorActionPreference = "Stop"
$Root = Split-Path $PSScriptRoot -Parent
$Venv = Join-Path $Root ".venv-gpu"

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Error "Python launcher 'py' not found. Install Python 3.12 from python.org"
}

if (-not (Test-Path $Venv)) {
    Write-Host "Creating $Venv ..."
    py -3.12 -m venv $Venv
}

$Python = Join-Path $Venv "Scripts\python.exe"
& $Python -m pip install --upgrade pip
& $Python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128
& $Python -m pip install -r (Join-Path $Root "fastapi-backend\requirements.txt")

Write-Host ""
Write-Host "Verifying CUDA..."
& $Python -c "import torch; print('torch', torch.__version__); print('cuda', torch.cuda.is_available()); print('gpu', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'n/a')"
Write-Host ""
Write-Host "Done. Restart SquadSpeak — Electron will use .venv-gpu automatically."
