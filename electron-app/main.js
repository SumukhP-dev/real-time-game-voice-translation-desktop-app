const electron = require('electron');
const { BrowserWindow, ipcMain, shell, dialog, screen } = electron;
const app = electron.app;
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');

let mainWindow;
let mlServiceProcess;
/** Prevents overlapping startMLService() calls (duplicate spawns on port 8000). */
let mlServiceStartPromise = null;
let overlayWindow = null;
let overlayInitPromise = null;
/** Set when overlay React has subscribed to IPC (avoids lost messages on first show). */
let overlayRendererReady = false;
let pendingOverlayPayload = null;
/** @type {Array<() => void>} */
let overlayReadyWaiters = [];

function resetOverlayRendererState() {
  overlayRendererReady = false;
  pendingOverlayPayload = null;
}

function markOverlayRendererReady() {
  overlayRendererReady = true;
  const waiters = overlayReadyWaiters;
  overlayReadyWaiters = [];
  waiters.forEach((resolve) => resolve());

  if (pendingOverlayPayload && overlayWindow && !overlayWindow.isDestroyed()) {
    console.log('[ELECTRON] Flushing pending overlay payload');
    overlayWindow.webContents.send('subtitle-overlay-payload', pendingOverlayPayload);
    pendingOverlayPayload = null;
  }
}

function waitForOverlayRendererReady(timeoutMs = 15000) {
  if (overlayRendererReady) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      overlayReadyWaiters = overlayReadyWaiters.filter((r) => r !== onReady);
      reject(new Error('Overlay window did not signal ready in time'));
    }, timeoutMs);
    const onReady = () => {
      clearTimeout(timer);
      resolve();
    };
    overlayReadyWaiters.push(onReady);
  });
}

function deliverSubtitleToOverlay(data) {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    throw new Error('Overlay window is not available');
  }
  overlayWindow.webContents.send('subtitle-overlay-payload', data);
  if (!overlayWindow.isVisible()) {
    overlayWindow.show();
  }
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.moveTop();
}

// ML Service Configuration
const ML_SERVICE_PORT = 8000;
const ML_SERVICE_HOST = '127.0.0.1';
/** First launch can be slow (AV scan, cold disk). Allow up to 3 minutes. */
const ML_SERVICE_START_TIMEOUT_MS = 180000;
const ML_SERVICE_POLL_INTERVAL_MS = 1000;

function logToFile(line, logName = 'renderer.log') {
  try {
    const logPath = path.join(app.getPath('userData'), logName);
    fs.appendFileSync(logPath, `${new Date().toISOString()} ${line}\n`, { encoding: 'utf8' });
  } catch {
    // Ignore logging failures.
  }
}

function appendMLServiceLog(chunk) {
  logToFile(chunk.trimEnd(), 'ml-service.log');
}

function getBundledMLServiceExePath() {
  // electron-builder places extraResources under:
  //   <install>/resources/<to>
  // where process.resourcesPath points at <install>/resources
  return path.join(process.resourcesPath, 'ml-service', 'ml-service.exe');
}

function getReactDevPort() {
  return process.env.REACT_DEV_PORT || '3010';
}

function getOverlayLoadUrl() {
  if (isDev) {
    return `http://localhost:${getReactDevPort()}/overlay.html`;
  }
  return `file://${path.join(__dirname, 'react-frontend/dist/overlay.html')}`;
}

async function ensureOverlayWindowLoaded() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    return overlayWindow;
  }
  if (overlayInitPromise) {
    return overlayInitPromise;
  }

  overlayInitPromise = new Promise((resolve, reject) => {
    resetOverlayRendererState();

    const { width, height } = screen.getPrimaryDisplay().bounds;
    overlayWindow = new BrowserWindow({
      width,
      height,
      x: 0,
      y: 0,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      fullscreenable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      focusable: false,
      show: false,
      hasShadow: false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: false
      }
    });

    overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    overlayWindow.once('closed', () => {
      overlayWindow = null;
      resetOverlayRendererState();
    });

    const finish = () => {
      overlayInitPromise = null;
      resolve(overlayWindow);
    };

    const fail = (_event, code, desc, url, isMainFrame) => {
      if (!isMainFrame) return;
      overlayInitPromise = null;
      const w = overlayWindow;
      overlayWindow = null;
      if (w && !w.isDestroyed()) w.destroy();
      reject(new Error(`Overlay failed to load (${code}): ${desc} ${url}`));
    };

    overlayWindow.webContents.once('did-finish-load', finish);
    overlayWindow.webContents.once('did-fail-load', fail);

    overlayWindow.loadURL(getOverlayLoadUrl()).catch((err) => {
      overlayInitPromise = null;
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.destroy();
      }
      overlayWindow = null;
      reject(err);
    });
  });

  return overlayInitPromise;
}

function destroyOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
  }
  overlayWindow = null;
  overlayInitPromise = null;
  resetOverlayRendererState();
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
      // Packaged UI is file://; must reach http://127.0.0.1:8000 for the ML backend.
      webSecurity: false,
      additionalArguments: isDev
        ? ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        : []
    },
    icon: path.join(__dirname, 'app_icon.png'),
    title: 'Real-Time Voice Translation Tool',
    show: false, // Don't show until ready-to-show
    autoHideMenuBar: true
  });

  // Load the app (port from start_electron.py via REACT_DEV_PORT, or default 3010)
  const devPort = getReactDevPort();
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
    destroyOverlayWindow();
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function isMLServiceHealthy() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`http://${ML_SERVICE_HOST}:${ML_SERVICE_PORT}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function startMLService() {
  if (await isMLServiceHealthy()) {
    console.log('[ELECTRON] ML service already running on port', ML_SERVICE_PORT);
    return;
  }

  if (mlServiceStartPromise) {
    return mlServiceStartPromise;
  }

  mlServiceStartPromise = new Promise((resolve, reject) => {
    console.log('[ELECTRON] Starting ML service...');
    logToFile('[ELECTRON] Starting ML service...', 'ml-service.log');

    let child;
    let settled = false;
    let pollTimer = null;
    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (err) reject(err);
      else resolve();
    };

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
      if (!fs.existsSync(exePath)) {
        const msg = `ML service not found at ${exePath}`;
        logToFile(msg, 'ml-service.log');
        finish(new Error(msg));
        return;
      }
      logToFile(`Spawning ${exePath}`, 'ml-service.log');
      child = spawn(exePath, [], {
        cwd: path.dirname(exePath),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
    }

    mlServiceProcess = child;

    child.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(`[ML-SERVICE] ${text}`);
      appendMLServiceLog(text);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      console.error(`[ML-SERVICE] ${text}`);
      appendMLServiceLog(text);
    });

    child.on('error', (error) => {
      console.error('[ELECTRON] Failed to start ML service:', error);
      logToFile(`spawn error: ${error.message}`, 'ml-service.log');
      finish(error);
    });

    child.on('close', (code) => {
      const msg = `[ML-SERVICE] Process exited with code ${code}`;
      console.log(msg);
      logToFile(msg, 'ml-service.log');
      if (!settled && code !== 0) {
        finish(
          new Error(
            `ML service exited before ready (code ${code}). See ml-service.log in app data.`
          )
        );
      }
    });

    const startedAt = Date.now();
    pollTimer = setInterval(async () => {
      if (Date.now() - startedAt > ML_SERVICE_START_TIMEOUT_MS) {
        const logDir = app.getPath('userData');
        finish(
          new Error(
            `ML service failed to start within ${ML_SERVICE_START_TIMEOUT_MS / 1000} seconds. Log: ${path.join(logDir, 'ml-service.log')}`
          )
        );
        return;
      }

      try {
        const fetch = require('node-fetch');
        const response = await fetch(
          `http://${ML_SERVICE_HOST}:${ML_SERVICE_PORT}/health`,
          { timeout: 3000 }
        );
        if (response.ok) {
          const body = await response.json().catch(() => ({}));
          console.log('[ELECTRON] ML service is ready!', body);
          logToFile(`health ok: ${JSON.stringify(body)}`, 'ml-service.log');
          finish();
        }
      } catch {
        // Keep polling until timeout or process exit.
      }
    }, ML_SERVICE_POLL_INTERVAL_MS);
  });

  try {
    await mlServiceStartPromise;
  } finally {
    mlServiceStartPromise = null;
  }
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
    const logHint = path.join(app.getPath('userData'), 'ml-service.log');
    dialog.showErrorBox(
      'ML Service',
      `The translation backend could not start: ${error.message}\n\nLog file:\n${logHint}\n\nYou can still use the app; translation may be limited until the service is running.`
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
  destroyOverlayWindow();
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

ipcMain.on('overlay-renderer-ready', () => {
  console.log('[ELECTRON] Overlay renderer ready');
  markOverlayRendererReady();
});

ipcMain.handle('show-subtitle-overlay', async (_event, payload) => {
  if (!payload || typeof payload.text !== 'string') {
    throw new Error('show-subtitle-overlay: expected { text: string, config?: object }');
  }

  const data = {
    text: payload.text,
    config: payload.config || {}
  };

  await ensureOverlayWindowLoaded();

  if (!overlayRendererReady) {
    pendingOverlayPayload = data;
    await waitForOverlayRendererReady();
  }

  deliverSubtitleToOverlay(data);
  pendingOverlayPayload = null;
  return { ok: true };
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

console.log('[ELECTRON] Electron main process started');
