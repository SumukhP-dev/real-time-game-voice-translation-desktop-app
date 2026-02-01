// Electron API service for React frontend
// Replaces Tauri API calls with Electron equivalents

export interface AudioDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
  is_input: boolean;
}

export interface Config {
  audio: {
    device_index: number | null;
    chunk_size: number;
    sample_rate: number;
    channels: number;
  };
  whisper: {
    model: string;
    language: string | null;
    min_buffer_duration: number;
    min_transcription_interval: number;
  };
  translation: {
    target_language: string;
    auto_detect: boolean;
    provider: string;
    model_type: string;
    model_name: string;
    use_fallback: boolean;
    translate_to_teammates?: boolean;
    team_target_language?: string;
    use_auto_detect_team_language?: boolean;
    tts_for_team_translations?: boolean;
    auto_detect_teammates?: boolean;
  };
  tts: {
    enabled: boolean;
    engine: string;
    rate: number;
    volume: number;
  };
  overlay: {
    enabled: boolean;
    position_x: number;
    position_y: number;
    font_size: number;
    text_color: string;
    background_color: string;
    max_width: number;
    max_lines: number;
    fade_duration: number;
  };
  ui: {
    theme: string;
    language: string;
    auto_start: boolean;
    minimize_to_tray: boolean;
    show_notifications: boolean;
  };
}

class ElectronService {
  private isElectron: boolean;
  private isDev: boolean;
  private mlServiceURL: string;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    this.isDev = (window as any).nodeEnv?.NODE_ENV === 'development' || false;
    this.mlServiceURL = 'http://127.0.0.1:8000';
  }

  // Check if running in Electron
  isElectronApp(): boolean {
    return this.isElectron;
  }

  // Get ML service URL
  async getMLServiceURL(): Promise<string> {
    if (this.isElectron) {
      return await (window as any).electronAPI.getMLServiceURL();
    }
    return this.mlServiceURL;
  }

  // Get app version
  async getAppVersion(): Promise<string> {
    if (this.isElectron) {
      return await (window as any).electronAPI.getAppVersion();
    }
    return '1.0.0-dev';
  }

  // Show message box
  async showMessageBox(options: any): Promise<any> {
    if (this.isElectron) {
      return await (window as any).electronAPI.showMessageBox(options);
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
  async showErrorBox(title: string, content: string): Promise<void> {
    if (this.isElectron) {
      return await (window as any).electronAPI.showErrorBox(title, content);
    }
    // Fallback for web
    alert(`${title}: ${content}`);
  }

  // Open external URL
  async openExternal(url: string): Promise<void> {
    if (this.isElectron) {
      return await (window as any).electronAPI.openExternal(url);
    }
    // Fallback for web
    window.open(url, '_blank');
  }

  // Get platform info
  getPlatform(): string {
    if (this.isElectron) {
      return (window as any).electronAPI.platform;
    }
    return navigator.platform;
  }

  // Check if in development mode
  isDevelopmentMode(): boolean {
    if (this.isElectron) {
      return (window as any).electronAPI.isDev;
    }
    return this.isDev;
  }

  // ML Service API calls (via HTTP)
  async callMLService(endpoint: string, data?: any): Promise<any> {
    const url = await this.getMLServiceURL();
    const fullUrl = `${url}${endpoint}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ML Service API call failed:', error);
      throw error;
    }
  }

  // Audio device operations (via ML service)
  async getAudioDevices(): Promise<AudioDevice[]> {
    return await this.callMLService('/audio/devices');
  }

  async startAudioCapture(deviceIndex: number): Promise<void> {
    return await this.callMLService('/audio/start', { device_index: deviceIndex });
  }

  async stopAudioCapture(): Promise<void> {
    return await this.callMLService('/audio/stop');
  }

  // Transcription operations
  async transcribeAudio(audioData: FormData): Promise<any> {
    const url = await this.getMLServiceURL();
    const response = await fetch(`${url}/transcribe`, {
      method: 'POST',
      body: audioData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Translation operations
  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<any> {
    return await this.callMLService('/translate', {
      text,
      target_language: targetLanguage,
      source_language: sourceLanguage,
    });
  }

  // Configuration operations
  async getConfig(): Promise<Config> {
    return await this.callMLService('/config/get');
  }

  async saveConfig(config: Config): Promise<void> {
    return await this.callMLService('/config/save', config);
  }

  // Health check
  async healthCheck(): Promise<any> {
    return await this.callMLService('/health');
  }

  // Event listeners (simulated for Electron)
  async listen(eventName: string, _callback: (data: any) => void): Promise<void> {
    if (this.isElectron) {
      // In a real implementation, you'd use IPC events
      // For now, we'll simulate with polling
      console.log(`Listening for ${eventName} events`);
    }
  }

  // File operations (Electron only)
  async showOpenDialog(_options: any = {}): Promise<any> {
    if (this.isElectron) {
      // Would need @electron/remote for this
      throw new Error('File operations require additional setup');
    }
    throw new Error('File operations not available in web mode');
  }

  async showSaveDialog(_options: any = {}): Promise<any> {
    if (this.isElectron) {
      // Would need @electron/remote for this
      throw new Error('File operations require additional setup');
    }
    throw new Error('File operations not available in web mode');
  }
}

// Create singleton instance
const electronService = new ElectronService();

export default electronService;
export { electronService };
