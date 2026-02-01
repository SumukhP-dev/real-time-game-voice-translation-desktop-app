# Git Configuration Verification Script
Write-Host "=== Git HTTP Configuration ===" -ForegroundColor Cyan
Write-Host ""

$configs = @{
    "http.postBuffer" = "524288000"
    "http.timeout" = "300"
    "http.lowSpeedLimit" = "0"
    "http.lowSpeedTime" = "0"
}

$allSet = $true
foreach ($key in $configs.Keys) {
    $value = git config --get $key
    $expected = $configs[$key]
    
    if ($value -eq $expected) {
        Write-Host "✓ $key = $value" -ForegroundColor Green
    } else {
        Write-Host "✗ $key = $value (expected: $expected)" -ForegroundColor Red
        $allSet = $false
    }
}

Write-Host ""
if ($allSet) {
    Write-Host "All configurations are set correctly!" -ForegroundColor Green
} else {
    Write-Host "Some configurations are missing. Run the setup commands:" -ForegroundColor Yellow
    Write-Host "  git config http.postBuffer 524288000"
    Write-Host "  git config http.timeout 300"
    Write-Host "  git config http.lowSpeedLimit 0"
    Write-Host "  git config http.lowSpeedTime 0"
}

Write-Host ""
Write-Host "=== Repository Status ===" -ForegroundColor Cyan
$pendingCommits = git log origin/main..HEAD --oneline
if ($pendingCommits) {
    Write-Host "Pending commits to push:" -ForegroundColor Yellow
    $pendingCommits
} else {
    Write-Host "No pending commits (repository is up-to-date)" -ForegroundColor Green
}
