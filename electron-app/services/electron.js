// Electron API service for React frontend
// Replaces Tauri API calls with Electron equivalents

class ElectronService {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
    this.isDev = window.nodeEnv?.NODE_ENV === 'development' || false;
  }

  // Check if running in Electron
  isElectronApp() {
    return this.isElectron;
  }

  // Get ML service URL
  async getMLServiceURL() {
    if (this.isElectron) {
      return await window.electronAPI.getMLServiceURL();
    }
    // Fallback for development
    return 'http://127.0.0.1:8000';
  }

  // Get app version
  async getAppVersion() {
    if (this.isElectron) {
      return await window.electronAPI.getAppVersion();
    }
    return '1.0.0-dev';
  }

  // Show message box
  async showMessageBox(options) {
    if (this.isElectron) {
      return await window.electronAPI.showMessageBox(options);
    }
    // Fallback for web
    if (options.type === 'error') {
      alert(options.message || 'An error occurred');
    } else {
      const result = confirm(options.message || 'Confirm action');
      return { response: result ? 0 : 1 };
    }
  }

  // Show error box
  async showErrorBox(title, content) {
    if (this.isElectron) {
      return await window.electronAPI.showErrorBox(title, content);
    }
    // Fallback for web
    alert(`${title}: ${content}`);
  }

  // Open external URL
  async openExternal(url) {
    if (this.isElectron) {
      return await window.electronAPI.openExternal(url);
    }
    // Fallback for web
    window.open(url, '_blank');
  }

  // Get platform info
  getPlatform() {
    if (this.isElectron) {
      return window.electronAPI.platform;
    }
    return navigator.platform;
  }

  // Check if in development mode
  isDevelopmentMode() {
    if (this.isElectron) {
      return window.electronAPI.isDev;
    }
    return this.isDev;
  }

  // File system operations (Electron only)
  async showOpenDialog(options = {}) {
    if (this.isElectron) {
      const { dialog } = require('@electron/remote');
      return await dialog.showOpenDialog(options);
    }
    throw new Error('File operations not available in web mode');
  }

  async showSaveDialog(options = {}) {
    if (this.isElectron) {
      const { dialog } = require('@electron/remote');
      return await dialog.showSaveDialog(options);
    }
    throw new Error('File operations not available in web mode');
  }

  // System operations
  async showItemInFolder(fullPath) {
    if (this.isElectron) {
      const { shell } = require('electron');
      return await shell.showItemInFolder(fullPath);
    }
    throw new Error('System operations not available in web mode');
  }
}

// Create singleton instance
const electronService = new ElectronService();

export default electronService;
