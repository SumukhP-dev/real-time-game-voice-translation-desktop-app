# Downloads VB-Audio Virtual Cable driver pack and extracts the setup EXEs.
# Run from repo root: .\scripts\download_vb_cable.ps1
# Attribution: https://vb-audio.com/Cable/ — VB-CABLE is donationware.

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$destRoot = Join-Path $repoRoot "third_party\vb-audio"
$installerDir = Join-Path $destRoot "installer"
$zipPath = Join-Path $destRoot "VBCABLE_Driver_Pack45.zip"
$url = "https://download.vb-audio.com/Download_CABLE/VBCABLE_Driver_Pack45.zip"

New-Item -ItemType Directory -Force -Path $destRoot | Out-Null
if (Test-Path $installerDir) {
    Remove-Item $installerDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $installerDir | Out-Null

Write-Host "Downloading VB-Audio Virtual Cable pack..."
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

Write-Host "Extracting (including setup executables)..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipPath, $installerDir)

$setup = Join-Path $installerDir "VBCABLE_Setup_x64.exe"
if (-not (Test-Path $setup)) {
    throw "Expected $setup after extract"
}

Write-Host "OK: $setup"
Write-Host "Dev builds and optional packaging can use third_party\vb-audio\installer\"
