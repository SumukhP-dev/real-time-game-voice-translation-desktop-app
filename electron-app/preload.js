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

  /** Ask main process to show text on the transparent overlay window. */
  showSubtitleOverlay: (payload) => ipcRenderer.invoke('show-subtitle-overlay', payload),

  /**
   * Overlay window only: subscribe to subtitle payloads from the main process.
   * @returns {() => void} unsubscribe
   */
  subscribeSubtitleOverlay: (callback) => {
    const channel = 'subtitle-overlay-payload';
    const listener = (_event, data) => {
      try {
        callback(data);
      } catch (e) {
        console.error('[PRELOAD] subscribeSubtitleOverlay callback error', e);
      }
    };
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  /** Call from overlay.html after subscribeSubtitleOverlay is registered. */
  notifyOverlayRendererReady: () => {
    ipcRenderer.send('overlay-renderer-ready');
  },
  
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
