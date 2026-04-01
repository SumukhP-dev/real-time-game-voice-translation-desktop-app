const electron = require('electron');
const { BrowserWindow, ipcMain, shell, dialog } = electron;
const app = electron.app;
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let mlServiceProcess;

// ML Service Configuration
const ML_SERVICE_PORT = 8000;
const ML_SERVICE_HOST = '127.0.0.1';

function logToFile(line) {
  try {
    const logPath = path.join(app.getPath('userData'), 'renderer.log');
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, { encoding: 'utf8' });
  } catch {
    // Ignore logging failures.
  }
}

function getBundledMLServiceExePath() {
  // electron-builder places extraResources under:
  //   <install>/resources/<to>
  // where process.resourcesPath points at <install>/resources
  return path.join(process.resourcesPath, 'ml-service', 'ml-service.exe');
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: isDev ? false : true, // Disable only for development
      additionalArguments: isDev
        ? ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        : []
    },
    icon: path.join(__dirname, '../app_icon.png'),
    title: 'Real-Time Voice Translation Tool',
    show: false, // Don't show until ready-to-show
    autoHideMenuBar: true
  });

  // Load the app (port from start_electron.py via REACT_DEV_PORT, or default 3010)
  const devPort = process.env.REACT_DEV_PORT || '3010';
  const startUrl = isDev
    ? `http://localhost:${devPort}`
    : `file://${path.join(__dirname, 'react-frontend/dist/index.html')}`;

  mainWindow.loadURL(startUrl);

  // Capture renderer load/console errors for packaged builds (white screen debugging).
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
    if (!isMainFrame) return;
    const msg = `[did-fail-load] code=${errorCode} desc=${JSON.stringify(errorDescription)} url=${validatedURL}`;
    console.error(msg);
    logToFile(msg);
    if (!isDev) {
      dialog.showErrorBox('App failed to load', `${errorDescription}\n\nURL: ${validatedURL}\nCode: ${errorCode}\n\nLog: ${path.join(app.getPath('userData'), 'renderer.log')}`);
    }
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    const msg = `[render-process-gone] reason=${details?.reason} exitCode=${details?.exitCode}`;
    console.error(msg);
    logToFile(msg);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    // level: 0=log,1=warn,2=error
    logToFile(`[console level=${level}] ${message} (${sourceId}:${line})`);
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function startMLService() {
  return new Promise((resolve, reject) => {
    console.log('[ELECTRON] Starting ML service...');

    let child;
    if (isDev) {
      const mlServicePath = path.join(__dirname, '../fastapi-backend');
      child = spawn(
        'python',
        ['-m', 'uvicorn', 'main:app', '--host', ML_SERVICE_HOST, `--port=${ML_SERVICE_PORT}`],
        {
          cwd: mlServicePath,
          stdio: ['pipe', 'pipe', 'pipe']
        }
      );
    } else {
      const exePath = getBundledMLServiceExePath();
      child = spawn(exePath, [], {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
    }

    mlServiceProcess = child;

    // Log output
    child.stdout.on('data', (data) => {
      console.log(`[ML-SERVICE] ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
      console.error(`[ML-SERVICE] ${data.toString()}`);
    });

    child.on('error', (error) => {
      console.error('[ELECTRON] Failed to start ML service:', error);
      reject(error);
    });

    child.on('close', (code) => {
      console.log(`[ML-SERVICE] Process exited with code ${code}`);
    });

    // Wait for service to be ready
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkService = async () => {
      attempts++;
      
      try {
        const fetch = require('node-fetch');
        const response = await fetch(`http://${ML_SERVICE_HOST}:${ML_SERVICE_PORT}/health`);
        
        if (response.ok) {
          console.log('[ELECTRON] ML service is ready!');
          resolve();
        } else {
          throw new Error('Service not ready');
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          reject(new Error('ML service failed to start within 30 seconds'));
        } else {
          setTimeout(checkService, 1000);
        }
      }
    };

    // Start checking after 2 seconds
    setTimeout(checkService, 2000);
  });
}

// App event handlers
app.whenReady().then(async () => {
  try {
    // Wait for the ML service before creating the renderer window so the
    // frontend does not spam connection-refused errors during startup.
    await startMLService();
    createWindow();
  } catch (error) {
    console.error('[ELECTRON] ML service failed to start:', error);
    dialog.showErrorBox(
      'ML Service',
      `The translation backend could not start: ${error.message}\n\nYou can still use the app; translation may be limited until the service is running.`
    );
    createWindow();
  }

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (!mlServiceProcess) {
        try {
          await startMLService();
        } catch (error) {
          console.error('[ELECTRON] ML service failed to restart:', error);
        }
      }
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Clean up ML service
  if (mlServiceProcess) {
    console.log('[ELECTRON] Stopping ML service...');
    mlServiceProcess.kill('SIGTERM');
    mlServiceProcess = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up ML service
  if (mlServiceProcess) {
    console.log('[ELECTRON] Stopping ML service...');
    mlServiceProcess.kill('SIGTERM');
    mlServiceProcess = null;
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-error-box', async (event, title, content) => {
  await dialog.showErrorBox(title, content);
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('get-ml-service-url', () => {
  return `http://${ML_SERVICE_HOST}:${ML_SERVICE_PORT}`;
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

console.log('[ELECTRON] Electron main process started');
