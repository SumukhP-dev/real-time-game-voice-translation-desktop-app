# Git curl 55 Connection Reset Error - Fix Guide

## Error

```
error: RPC failed; curl 55 Recv failure: Connection was reset
send-pack: unexpected disconnect while reading sideband packet
fatal: the remote end hung up unexpectedly
```

## What is curl 55?

**curl 55** means "Recv failure: Connection was reset" - the connection was actively closed/reset during data transfer, not just timed out.

## Difference from HTTP 408

- **HTTP 408**: Server timed out waiting for request (timeout)
- **curl 55**: Connection was actively reset during transfer (network issue)

## Root Causes

1. **Network instability** - Unstable connection dropping packets
2. **Firewall/Proxy interference** - Middleware resetting connections
3. **HTTP/2 issues** - HTTP/2 can be less stable than HTTP/1.1 for large transfers
4. **Large file transfers** - Connection reset during large data transfer
5. **Server-side limits** - GitHub may reset connections that are too slow

## Fixes Applied

### 1. Use HTTP/1.1 (More Stable)

```bash
git config http.version HTTP/1.1
```

HTTP/1.1 is more stable for large transfers than HTTP/2, which can have connection issues.

### 2. Enable Maximum Compression

```bash
git config core.compression 9
```

Reduces the amount of data transferred, making resets less likely.

### 3. Increase Max Request Buffer

```bash
git config http.maxRequestBuffer 100M
```

Allows larger requests without splitting.

### 4. Previous Fixes (Still Active)

- `http.postBuffer 524288000` (500MB)
- `http.timeout 300` (5 minutes)
- `http.lowSpeedLimit 0` (disabled)
- `http.lowSpeedTime 0` (disabled)

## Best Solution: Switch to SSH

**SSH is the most reliable solution** for connection reset errors:

```bash
# Switch to SSH
git remote set-url origin git@github.com:SumukhP-dev/CSGO2_Live_Voice_Translation_Mod.git

# Test connection
ssh -T git@github.com

# Push
git push origin main
```

SSH avoids HTTP connection issues entirely and is more stable for large transfers.

## Verify Configuration

```bash
git config --get-regexp "(http\.|core\.compression)"
```

Should show:

```
core.compression 9
http.maxRequestBuffer 100M
http.postBuffer 524288000
http.timeout 300
http.lowSpeedLimit 0
http.lowSpeedTime 0
http.version HTTP/1.1
```

## Retry Strategy

If errors persist, use exponential backoff:

```powershell
$maxRetries = 3
$retry = 0
while ($retry -lt $maxRetries) {
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success!" -ForegroundColor Green
        break
    }
    $retry++
    $delay = [math]::Pow(2, $retry)
    Write-Host "Retrying in $delay seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds $delay
}
```

## Check Network Quality

```bash
# Test connection to GitHub
ping github.com

# Test HTTPS connection
curl -I https://github.com

# Check for packet loss
ping -n 20 github.com
```

## Status

✅ **HTTP/1.1**: Enabled for stability
✅ **Compression**: Maximum (level 9)
✅ **Request Buffer**: Increased to 100MB
✅ **All previous fixes**: Still active

## Next Steps

1. **Try pushing again**: `git push origin main`
2. **If still failing**: Switch to SSH (most reliable)
3. **Check network**: Verify stable connection to GitHub
4. **Verify push status**: `git log origin/main..HEAD` (may have succeeded)
