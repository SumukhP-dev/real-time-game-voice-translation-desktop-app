const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let mlServiceProcess;

// ML Service Configuration
const ML_SERVICE_PORT = 8000;
const ML_SERVICE_HOST = '127.0.0.1';

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
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../app_icon.png'),
    title: 'CSGO2 Voice Translation',
    show: false, // Don't show until ready-to-show
    autoHideMenuBar: true,
    webSecurity: !isDev
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:1420' 
    : `file://${path.join(__dirname, 'react-frontend/build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

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
    
    const mlServicePath = path.join(__dirname, '../fastapi-backend');
    const pythonProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', ML_SERVICE_HOST, `--port=${ML_SERVICE_PORT}`], {
      cwd: mlServicePath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    mlServiceProcess = pythonProcess;

    // Log output
    pythonProcess.stdout.on('data', (data) => {
      console.log(`[ML-SERVICE] ${data.toString()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`[ML-SERVICE] ${data.toString()}`);
    });

    pythonProcess.on('error', (error) => {
      console.error('[ELECTRON] Failed to start ML service:', error);
      reject(error);
    });

    pythonProcess.on('close', (code) => {
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
    // Start ML service first
    await startMLService();
    
    // Create main window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

  } catch (error) {
    console.error('[ELECTRON] Failed to start application:', error);
    
    // Show error dialog
    if (mainWindow) {
      dialog.showErrorBox(
        'Startup Error',
        `Failed to start the ML service: ${error.message}\n\nPlease check your Python installation and try again.`
      );
    }
  }
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
