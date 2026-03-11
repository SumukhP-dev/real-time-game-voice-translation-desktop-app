// Electron API service for React frontend
// Replaces  API calls with Electron equivalents

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
    show_same_language?: boolean;
    ui_language?: string;
    enable_overlay?: boolean;
    enable_tts?: boolean;
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
    show_same_language?: boolean;
    style_preset?: string;
    position_preset?: string;
  };
  ui: {
    theme: string;
    language: string;
    auto_start: boolean;
    minimize_to_tray: boolean;
    show_notifications: boolean;
  };
  app?: {
    setup_complete: boolean;
    ui_language?: string;
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
    try {
      return await this.callMLService('/audio/devices');
    } catch (error) {
      console.error('Failed to get audio devices from ML service, using fallback:', error);
      // Fallback to common devices
      return [
        {
          index: 0,
          name: "Default Audio Device",
          channels: 2,
          sample_rate: 44100,
          is_input: true
        },
        {
          index: 1,
          name: "CABLE Input (VB-Audio Virtual Cable)",
          channels: 2,
          sample_rate: 48000,
          is_input: true
        },
        {
          index: 2,
          name: "Microphone",
          channels: 1,
          sample_rate: 48000,
          is_input: true
        }
      ];
    }
  }

  async startAudioCapture(deviceIndex: number): Promise<void> {
    console.log(`Starting audio capture for device ${deviceIndex}`);
    try {
      await this.callMLService('/audio/start', { device_index: deviceIndex });
    } catch (error) {
      console.error('Failed to start audio capture via ML service:', error);
      // Surface the failure to the caller so the UI can show a real error
      throw error;
    }
  }

  async stopAudioCapture(): Promise<void> {
    console.log('Stopping audio capture');
    try {
      await this.callMLService('/audio/stop');
    } catch (error) {
      console.error('Failed to stop audio capture via ML service:', error);
      // Surface the failure so callers can react appropriately
      throw error;
    }
  }

  // Transcribe audio method
  async transcribeAudio(audioData: number[], sampleRate?: number): Promise<any> {
    // For now, return mock data since we're not connecting to real ML service
    console.log('Mock: transcribeAudio', { audioDataLength: audioData.length, sampleRate });
    return {
      text: 'Mock transcription result',
      language: 'en',
      confidence: 0.95
    };
    
    // Real implementation would be:
    // const url = await this.getMLServiceURL();
    // const formData = new FormData();
    // // Convert number array to Float32Array then to ArrayBuffer
    // const float32Array = new Float32Array(audioData);
    // formData.append('audio', new Blob([float32Array.buffer]), 'audio.wav');
    // if (sampleRate) formData.append('sample_rate', sampleRate.toString());
    // const response = await fetch(`${url}/transcribe`, {
    //   method: 'POST',
    //   body: formData,
    // });
    // return await response.json();
  }

  // Auto-detect teammate language
  async autoDetectTeammateLanguage(language: string, name?: string): Promise<string> {
    console.log('Mock: autoDetectTeammateLanguage', { language, name });
    // Return a mock teammate name
    return name || `Teammate (${language})`;
  }

  // Show Python overlay by reusing the translation pipeline.
  // This calls a dedicated backend endpoint that spawns `overlay_test.py`.
  async showPythonOverlay(text: string): Promise<any> {
    console.log('showPythonOverlay called with text:', text);
    
    try {
      const result = await this.callMLService('/overlay/show', { text });
      console.log('showPythonOverlay result:', result);
      return result;
    } catch (error) {
      console.error('showPythonOverlay failed:', error);
      throw error;
    }
  }
  
  // Show overlay text (Electron/web fallback).
  // For now this simply calls `showPythonOverlay` so both paths use the same
  // Python-based overlay implementation when available.
  async showOverlayText(text: string): Promise<any> {
    console.log('showOverlayText called with text:', text);
    return this.showPythonOverlay(text);
  }

  // Get anti-cheat report
  async getAntiCheatReport(): Promise<any> {
    console.log('Mock: getAntiCheatReport');
    return {
      detected_systems: [
        {
          name: "VAC",
          detected: false,
          compatible: true,
          status: "Not detected"
        },
        {
          name: "BattlEye",
          detected: false,
          compatible: true,
          status: "Not detected"
        },
        {
          name: "Easy Anti-Cheat",
          detected: false,
          compatible: true,
          status: "Not detected"
        }
      ]
    };
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

  // Audio chunk listener: connect to ML service WebSocket and forward real capture chunks
  listenToAudioChunk(callback: (event: { data: number[]; sample_rate: number }) => void): () => void {
    let ws: WebSocket | null = null;
    this.getMLServiceURL().then((baseUrl) => {
      const wsUrl = baseUrl.replace(/^http/, 'ws') + '/audio/stream';
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data as string) as { data: number[]; sample_rate: number };
            if (Array.isArray(msg.data) && typeof msg.sample_rate === 'number') {
              callback({ data: msg.data, sample_rate: msg.sample_rate });
            }
          } catch (e) {
            console.warn('Audio chunk parse error:', e);
          }
        };
        ws.onerror = (err) => console.warn('Audio stream WebSocket error:', err);
        ws.onclose = () => { ws = null; };
      } catch (e) {
        console.error('Failed to connect to audio stream:', e);
      }
    }).catch((e) => console.error('getMLServiceURL failed:', e));

    return () => {
      if (ws) {
        ws.close();
        ws = null;
      }
    };
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
