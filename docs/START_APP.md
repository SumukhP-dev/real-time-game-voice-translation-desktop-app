# How to Start the Tauri App

## Prerequisites Check

✅ Virtual environment: Found  
✅ Node modules: Installed  
✅ Rust/Cargo: Installed  

## Step-by-Step Startup

### Step 1: Start Python ML Service

Open a **PowerShell terminal** and run:

```powershell
# Navigate to project root
cd "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod"

# Activate virtual environment
.\.venv311\Scripts\Activate.ps1

# Navigate to ML service
cd tauri-app\ml-service

# Start the ML service
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

**Keep this terminal open!**

### Step 2: Start Tauri App

Open a **NEW PowerShell terminal** and run:

```powershell
# Navigate to tauri-app directory
cd "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod\tauri-app"

# Start Tauri in dev mode
npm run tauri dev
```

**Expected output:**
- First time: Will download and compile Rust dependencies (10-20 minutes)
- Subsequent times: Faster startup (2-5 minutes)
- The app window should open automatically

## Troubleshooting

### ML Service Won't Start

**Error: Module not found**
```powershell
# Install ML service dependencies
cd tauri-app\ml-service
pip install -r requirements.txt
```

**Error: Port 8000 already in use**
```powershell
# Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use a different port (update ml_service.rs)
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```

**Error: uvicorn not found**
```powershell
# Install uvicorn
pip install uvicorn fastapi
```

### Tauri App Won't Start

**Error: cargo not found**
- Install Rust from https://rustup.rs/
- Restart terminal after installation

**Error: npm not found**
- Install Node.js from https://nodejs.org/
- Restart terminal after installation

**Error: Build failed**
```powershell
# Clean and rebuild
cd tauri-app
npm run tauri clean
npm run tauri dev
```

**Error: ML service connection failed**
- Make sure ML service is running first (Step 1)
- Check that it's on port 8000
- Verify firewall isn't blocking localhost

### Check Service Status

**Check ML Service:**
```powershell
# Should return 200 OK
Invoke-WebRequest -Uri "http://127.0.0.1:8000/health"
```

**Check if processes are running:**
```powershell
Get-Process | Where-Object { $_.ProcessName -like "*python*" -or $_.ProcessName -like "*node*" }
```

## Quick Start Script

Create a file `start-app.ps1`:

```powershell
# Start ML Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod'; .\.venv311\Scripts\Activate.ps1; cd tauri-app\ml-service; python -m uvicorn main:app --host 127.0.0.1 --port 8000"

# Wait a bit
Start-Sleep -Seconds 5

# Start Tauri App
cd "C:\Users\sumuk\OneDrive - Georgia Institute of Technology\Projects\CSGO2_Live_Voice_Translation_Mod\tauri-app"
npm run tauri dev
```

Then run:
```powershell
.\start-app.ps1
```

