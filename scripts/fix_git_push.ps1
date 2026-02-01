# Git Push Fix Script
# This script addresses connection errors when pushing large repositories

Write-Host "=== Git Push Connection Fix ===" -ForegroundColor Cyan
Write-Host ""

# Check current git config
Write-Host "Current Git HTTP Configuration:" -ForegroundColor Yellow
git config --get-regexp "http\." | ForEach-Object { Write-Host "  $_" }

Write-Host ""
Write-Host "Options to fix connection errors:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. OPTION A: Use SSH (Recommended for connection issues)" -ForegroundColor Green
Write-Host "   SSH is more reliable for large pushes and avoids HTTP connection problems"
Write-Host ""
Write-Host "   To switch to SSH, run:" -ForegroundColor Cyan
Write-Host "   git remote set-url origin git@github.com:SumukhP-dev/CSGO2_Live_Voice_Translation_Mod.git" -ForegroundColor White
Write-Host ""
Write-Host "   Then test connection:" -ForegroundColor Cyan
Write-Host "   ssh -T git@github.com" -ForegroundColor White
Write-Host ""
Write-Host "2. OPTION B: Increase Git HTTP settings (Already partially configured)" -ForegroundColor Green
Write-Host ""
Write-Host "   Run these commands:" -ForegroundColor Cyan
Write-Host "   git config http.postBuffer 1048576000  # 1GB" -ForegroundColor White
Write-Host "   git config http.timeout 600  # 10 minutes" -ForegroundColor White
Write-Host "   git config http.lowSpeedLimit 0" -ForegroundColor White
Write-Host "   git config http.lowSpeedTime 0" -ForegroundColor White
Write-Host "   git config http.version HTTP/1.1" -ForegroundColor White
Write-Host ""
Write-Host "3. OPTION C: Clean git history to remove large files" -ForegroundColor Green
Write-Host "   WARNING: This rewrites history. Only do this if you're the only one working on this repo."
Write-Host ""
Write-Host "   Install git-filter-repo first:" -ForegroundColor Cyan
Write-Host "   pip install git-filter-repo" -ForegroundColor White
Write-Host ""
Write-Host "   Then remove large files from history:" -ForegroundColor Cyan
Write-Host "   git filter-repo --path models/whisper/ --invert-paths" -ForegroundColor White
Write-Host ""
Write-Host "4. OPTION D: Use Git LFS for large files" -ForegroundColor Green
Write-Host ""
Write-Host "   git lfs install" -ForegroundColor Cyan
Write-Host "   git lfs track '*.pt'" -ForegroundColor White
Write-Host "   git lfs track 'models/**'" -ForegroundColor White
Write-Host ""

# Check if push is needed
Write-Host "Checking if push is needed..." -ForegroundColor Yellow
$commitsAhead = git log origin/main..HEAD --oneline 2>$null
if ($commitsAhead) {
    Write-Host "You have commits ahead of origin/main:" -ForegroundColor Yellow
    $commitsAhead | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
    Write-Host "Repository size: $(git count-objects -vH | Select-String 'size:' | ForEach-Object { $_.Line })" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "RECOMMENDED: Try SSH first (Option 1)" -ForegroundColor Green
    Write-Host "If SSH is not set up, use Option 2 to increase HTTP settings" -ForegroundColor Yellow
} else {
    Write-Host "Everything is up to date!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== End of Fix Options ===" -ForegroundColor Cyan
