const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Dialogs
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showErrorBox: (title, content) => ipcRenderer.invoke('show-error-box', title, content),
  
  // System
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // ML Service
  getMLServiceURL: () => ipcRenderer.invoke('get-ml-service-url'),
  
  // Platform info
  platform: process.platform,
  
  // Development helpers
  isDev: process.env.NODE_ENV === 'development'
});

// Expose node.js environment variables
contextBridge.exposeInMainWorld('nodeEnv', {
  NODE_ENV: process.env.NODE_ENV || 'production'
});

console.log('[PRELOAD] Preload script loaded');
