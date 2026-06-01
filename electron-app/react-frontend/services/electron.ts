// Electron API service for React frontend
// Replaces  API calls with Electron equivalents

export interface AudioDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
  is_input: boolean;
  is_loopback?: boolean;
}

export interface PlaybackDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
  is_default?: boolean;
}

export type VoiceOutputMode = "virtual_mic" | "speakers" | "both";
export type VoiceRoutingPreset = "game" | "discord";

interface TeammateProfile {
  id: string;
  name: string;
  language: string;
  detected_language?: string;
  primary_language?: string;
  detected_languages?: Record<string, number>;
  translations?: Array<{
    text: string;
    timestamp: Date;
    source_language: string;
    target_language: string;
  }>;
}

function generateId(): string {
  const anyCrypto = typeof crypto !== "undefined" ? (crypto as any) : undefined;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  return `t_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export interface Config {
  audio: {
    /** Loopback device for game / teammate audio (subtitles). */
    device_index: number | null;
    /** Physical microphone for your voice (voice translation). */
    microphone_device_index?: number | null;
    /** Playback device for TTS (e.g. VB-Audio CABLE Input). */
    tts_output_device_index?: number | null;
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
  voice_output?: {
    mode?: VoiceOutputMode;
    preset?: VoiceRoutingPreset;
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

export interface MLServiceHealth {
  status?: string;
  ready?: boolean;
  whisper_loaded?: boolean;
  translation_loaded?: boolean;
}

export type MLServiceStartupPhase =
  | "connecting"
  | "loading_models"
  | "ready"
  | "error";

export interface MLServiceStartupState {
  progress: number;
  message: string;
  phase: MLServiceStartupPhase;
  whisperLoaded?: boolean;
  translationLoaded?: boolean;
}

export interface VbAudioCableStatus {
  supported: boolean;
  installed: boolean;
  installerAvailable: boolean;
  /** True when the packaged app includes VBCABLE_Setup_x64.exe (no download needed). */
  bundledOffline?: boolean;
  setupPath: string | null;
  downloadPageUrl?: string;
}

export interface VbAudioCableInstallResult {
  success: boolean;
  needsReboot?: boolean;
  message: string;
}

class ElectronService {
  private isElectron: boolean;
  private isDev: boolean;
  private mlServiceURL: string;
  private mlServiceReady: boolean;
  private mlServiceStartupPromise: Promise<void> | null;
  private mlServiceStartupGeneration: number;

  private teammates: TeammateProfile[] = [];

  private static readonly ML_SERVICE_STARTUP_TIMEOUT_MS = 300000;
  private static readonly ML_SERVICE_POLL_INTERVAL_MS = 500;
  /** Expected first-launch model load duration for progress UI. */
  private static readonly ML_SERVICE_EXPECTED_LOAD_MS = 180000;
  private static readonly BACKEND_REACHABLE_TIMEOUT_MS = 45000;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI;
    this.isDev = (window as any).nodeEnv?.NODE_ENV === 'development' || false;
    this.mlServiceURL = 'http://127.0.0.1:8000';
    this.mlServiceReady = false;
    this.mlServiceStartupPromise = null;
    this.mlServiceStartupGeneration = 0;
  }

  private emitTeammatesUpdated(): void {
    if (typeof window === "undefined") return;
    try {
      window.dispatchEvent(
        new CustomEvent("teammates:updated", {
          detail: { teammates: this.teammates },
        })
      );
    } catch {
      // Ignore emit failures; UI can refresh via getTeammates().
    }
  }

  async getTeammates(): Promise<TeammateProfile[]> {
    // Return a shallow clone so React state updates correctly.
    return this.teammates.map((t) => ({
      ...t,
      detected_languages: t.detected_languages ? { ...t.detected_languages } : {},
      translations: t.translations ? [...t.translations] : [],
    }));
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

  async getVbAudioCableStatus(): Promise<VbAudioCableStatus> {
    if (this.isElectron && (window as any).electronAPI?.getVbAudioCableStatus) {
      return await (window as any).electronAPI.getVbAudioCableStatus();
    }
    return {
      supported: false,
      installed: false,
      installerAvailable: false,
      setupPath: null,
    };
  }

  async installVbAudioCable(): Promise<VbAudioCableInstallResult> {
    if (this.isElectron && (window as any).electronAPI?.installVbAudioCable) {
      return await (window as any).electronAPI.installVbAudioCable();
    }
    throw new Error('VB-Audio install is only available in the desktop app on Windows.');
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

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isRetriableMLServiceError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return /Failed to fetch|NetworkError|ERR_CONNECTION_REFUSED/i.test(error.message);
  }

  private async fetchMLServiceResponse(fullUrl: string, data?: any): Promise<Response> {
    return await fetch(fullUrl, {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private async parseMLServiceErrorResponse(response: Response): Promise<string> {
    let detail = response.statusText;
    try {
      const errBody = await response.json();
      detail =
        typeof errBody.detail === 'string'
          ? errBody.detail
          : JSON.stringify(errBody);
    } catch {
      try {
        const text = await response.text();
        if (text) {
          detail = text;
        }
      } catch {
        // keep statusText
      }
    }
    return detail;
  }

  private isMLHealthReady(health: MLServiceHealth): boolean {
    return !!(
      health.ready ||
      (health.whisper_loaded && health.translation_loaded)
    );
  }

  /** Poll /health without waiting for models (used during startup UI). */
  async fetchMLHealth(): Promise<MLServiceHealth | null> {
    try {
      const baseUrl = await this.getMLServiceURL();
      const response = await fetch(`${baseUrl}/health`);
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as MLServiceHealth;
    } catch {
      return null;
    }
  }

  private computeStartupProgress(
    health: MLServiceHealth | null,
    elapsedMs: number
  ): number {
    const timeCap = Math.min(
      92,
      (elapsedMs / ElectronService.ML_SERVICE_EXPECTED_LOAD_MS) * 92
    );
    if (!health) {
      return Math.min(18, timeCap * 0.2);
    }
    let modelProgress = 22;
    if (health.whisper_loaded) {
      modelProgress = 58;
    }
    if (health.translation_loaded) {
      modelProgress = Math.max(modelProgress, 78);
    }
    if (this.isMLHealthReady(health)) {
      return 100;
    }
    return Math.max(modelProgress, timeCap);
  }

  private startupMessage(health: MLServiceHealth | null): string {
    if (!health) {
      return "Starting SquadSpeak translation backend...";
    }
    if (this.isMLHealthReady(health)) {
      return "Ready to translate";
    }
    if (health.whisper_loaded && !health.translation_loaded) {
      return "First launch: loading translation models (~1 min)";
    }
    if (!health.whisper_loaded) {
      return "First launch: loading speech models (~1 min)";
    }
    return "First launch: models loading (~1 min)";
  }

  /** Reset startup state after a failed load (e.g. user clicks Retry). */
  resetMLServiceStartup(): void {
    this.mlServiceReady = false;
    this.mlServiceStartupPromise = null;
    this.mlServiceStartupGeneration += 1;
  }

  /**
   * Wait until /health reports models ready; drives cold-start progress UI.
   */
  async waitForMLServiceReady(
    onProgress?: (state: MLServiceStartupState) => void,
    timeoutMs: number = ElectronService.ML_SERVICE_STARTUP_TIMEOUT_MS
  ): Promise<void> {
    if (this.mlServiceReady) {
      onProgress?.({
        progress: 100,
        message: "Ready to translate",
        phase: "ready",
        whisperLoaded: true,
        translationLoaded: true,
      });
      return;
    }

    if (!this.mlServiceStartupPromise) {
      const generation = this.mlServiceStartupGeneration;
      this.mlServiceStartupPromise = (async () => {
        const startedAt = Date.now();
        const deadline = startedAt + timeoutMs;
        let lastError: unknown = null;

        while (Date.now() < deadline) {
          if (generation !== this.mlServiceStartupGeneration) {
            return;
          }

          const elapsed = Date.now() - startedAt;
          let health: MLServiceHealth | null = null;

          try {
            health = await this.fetchMLHealth();
          } catch (error) {
            lastError = error;
          }

          if (generation !== this.mlServiceStartupGeneration) {
            return;
          }

          if (health && this.isMLHealthReady(health)) {
            this.mlServiceReady = true;
            onProgress?.({
              progress: 100,
              message: "Ready to translate",
              phase: "ready",
              whisperLoaded: health.whisper_loaded,
              translationLoaded: health.translation_loaded,
            });
            return;
          }

          onProgress?.({
            progress: this.computeStartupProgress(health, elapsed),
            message: this.startupMessage(health),
            phase: health ? "loading_models" : "connecting",
            whisperLoaded: health?.whisper_loaded,
            translationLoaded: health?.translation_loaded,
          });

          if (health && !this.isMLHealthReady(health)) {
            lastError = new Error("Models still loading");
          } else if (!health) {
            lastError = new Error("Backend not reachable");
          }

          await this.delay(ElectronService.ML_SERVICE_POLL_INTERVAL_MS);
        }

        if (generation !== this.mlServiceStartupGeneration) {
          return;
        }

        const reason =
          lastError instanceof Error ? `: ${lastError.message}` : "";
        onProgress?.({
          progress: 0,
          message: `Startup timed out after ${Math.round(timeoutMs / 1000)}s`,
          phase: "error",
        });
        throw new Error(
          `ML service did not become ready within ${timeoutMs}ms${reason}`
        );
      })();
    }

    try {
      await this.mlServiceStartupPromise;
    } finally {
      this.mlServiceStartupPromise = null;
    }
  }

  private async waitForMLService(
    timeoutMs: number = ElectronService.ML_SERVICE_STARTUP_TIMEOUT_MS
  ): Promise<void> {
    return this.waitForMLServiceReady(undefined, timeoutMs);
  }

  private async waitForBackendReachable(
    timeoutMs: number = ElectronService.BACKEND_REACHABLE_TIMEOUT_MS
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const health = await this.fetchMLHealth();
      if (health) {
        return;
      }
      await this.delay(ElectronService.ML_SERVICE_POLL_INTERVAL_MS);
    }
    throw new Error(
      `Translation backend was not reachable within ${Math.round(
        timeoutMs / 1000
      )}s`
    );
  }

  // ML Service API calls (via HTTP)
  async callMLService(
    endpoint: string,
    data?: any,
    options?: { requireReady?: boolean; timeoutMs?: number }
  ): Promise<any> {
    const url = await this.getMLServiceURL();
    const fullUrl = `${url}${endpoint}`;
    const requireReady = options?.requireReady ?? true;

    try {
      if (requireReady) {
        await this.waitForMLService(options?.timeoutMs);
      } else {
        await this.waitForBackendReachable(options?.timeoutMs);
      }
      let response = await this.fetchMLServiceResponse(fullUrl, data);

      if (!response.ok && response.status >= 500 && requireReady) {
        this.mlServiceReady = false;
        await this.waitForMLService(options?.timeoutMs);
        response = await this.fetchMLServiceResponse(fullUrl, data);
      }

      if (!response.ok) {
        const detail = await this.parseMLServiceErrorResponse(response);
        throw new Error(detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (requireReady) {
        this.mlServiceReady = true;
      }
      return await response.json();
    } catch (error) {
      if (this.isRetriableMLServiceError(error)) {
        this.mlServiceReady = false;
        const hint =
          'Cannot reach the translation backend at ' +
          `${url}. Wait for startup to finish or restart the app.`;
        console.error('ML Service API call failed:', error);
        throw new Error(
          error instanceof Error && error.message.includes('Failed to fetch')
            ? `${hint} (${error.message})`
            : error instanceof Error
              ? error.message
              : String(error)
        );
      }
      console.error('ML Service API call failed:', error);
      throw error;
    }
  }

  // Audio device operations (via ML service)
  async getAudioDevices(): Promise<AudioDevice[]> {
    const devices = await this.callMLService('/audio/devices', undefined, {
      requireReady: false,
    });
    if (!Array.isArray(devices) || devices.length === 0) {
      throw new Error(
        'No audio capture devices found. Wait for the translation backend to finish starting, then retry.'
      );
    }
    return devices;
  }

  async startAudioCapture(deviceIndex: number, source: 'loopback' | 'mic' = 'loopback'): Promise<void> {
    console.log(`Starting ${source} capture for device ${deviceIndex}`);
    try {
      await this.callMLService(
        '/audio/start',
        { device_index: deviceIndex, source },
        { requireReady: false }
      );
    } catch (error) {
      console.error(`Failed to start ${source} capture via ML service:`, error);
      throw error;
    }
  }

  async stopAudioCapture(source: 'loopback' | 'mic' = 'loopback'): Promise<void> {
    console.log(`Stopping ${source} capture`);
    try {
      await this.callMLService('/audio/stop', { source }, { requireReady: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (/not active/i.test(msg)) {
        return;
      }
      console.error(`Failed to stop ${source} capture via ML service:`, error);
      throw error;
    }
  }

  async getPlaybackDevices(): Promise<PlaybackDevice[]> {
    const devices = await this.callMLService(
      '/audio/playback-devices',
      undefined,
      { requireReady: false }
    );
    return Array.isArray(devices) ? devices : [];
  }

  async speakText(
    text: string,
    options?: {
      language?: string;
      outputDeviceIndex?: number | null;
      speakersDeviceIndex?: number | null;
      outputMode?: VoiceOutputMode;
      volume?: number;
      rate?: number;
    }
  ): Promise<void> {
    const payload = {
      text,
      language: options?.language ?? 'en',
      output_device_index: options?.outputDeviceIndex ?? null,
      speakers_device_index: options?.speakersDeviceIndex ?? null,
      output_mode: options?.outputMode ?? 'virtual_mic',
      volume: options?.volume ?? 1.0,
      rate: options?.rate ?? 1.0,
    };
    await this.callMLService('/tts/speak', payload);
  }

  // Transcribe audio via ML service (float32 PCM)
  async transcribeAudio(
    audioData: ArrayLike<number>,
    sampleRate: number = 48000,
    options?: {
      language?: string | null;
      channels?: number;
      modelName?: string;
    }
  ): Promise<{
    text: string;
    language: string;
    confidence?: number;
    rms_level?: number;
    segments?: unknown[];
  }> {
    if (!audioData?.length) {
      throw new Error('transcribeAudio: empty audio buffer');
    }

    await this.waitForMLService(30000);
    const baseUrl = await this.getMLServiceURL();
    const float32 =
      audioData instanceof Float32Array
        ? audioData
        : Float32Array.from(audioData);

    const formData = new FormData();
    formData.append(
      'audio_data',
      new Blob([float32.buffer], { type: 'application/octet-stream' }),
      'audio.pcm'
    );
    formData.append('sample_rate', String(sampleRate));
    formData.append('model_name', options?.modelName || 'base');
    formData.append('channels', String(options?.channels ?? 1));
    if (options?.language) {
      formData.append('language', options.language);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(`${baseUrl}/transcribe_bytes`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail = response.statusText;
        try {
          const errBody = await response.json();
          detail =
            typeof errBody.detail === 'string'
              ? errBody.detail
              : JSON.stringify(errBody);
        } catch {
          try {
            detail = await response.text();
          } catch {
            // keep statusText
          }
        }
        throw new Error(`Transcription failed (${response.status}): ${detail}`);
      }

      const result = await response.json();
      return {
        text: result.text ?? '',
        language: result.language ?? 'unknown',
        confidence: result.confidence,
        rms_level: result.rms_level,
        segments: result.segments,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Transcription timeout after 90 seconds');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Auto-detect teammate language
  async autoDetectTeammateLanguage(language: string, name?: string): Promise<string> {
    const teammateName = name || `Teammate (${language})`;

    // Create teammate profile on first detection.
    let teammate = this.teammates.find((t) => t.name === teammateName);
    if (!teammate) {
      teammate = {
        id: generateId(),
        name: teammateName,
        language,
        detected_language: language,
        primary_language: language,
        detected_languages: { [language]: 1 },
        translations: [],
      };
      this.teammates.push(teammate);
      this.emitTeammatesUpdated();
      return teammate.name;
    }

    const detected = teammate.detected_languages ?? {};
    detected[language] = (detected[language] ?? 0) + 1;
    teammate.detected_languages = detected;
    teammate.detected_language = language;
    teammate.language = teammate.language || language;

    // Primary language = most frequently detected language for this teammate.
    let primary: string | undefined;
    let maxCount = 0;
    for (const [lang, count] of Object.entries(detected)) {
      if (count > maxCount) {
        maxCount = count;
        primary = lang;
      }
    }
    teammate.primary_language = primary ?? language;

    this.emitTeammatesUpdated();
    return teammate.name;
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
  
  // Show overlay text: prefer Electron transparent overlay window (works without
  // `overlay_test.py`). Fall back to Python subprocess if Electron API is unavailable.
  async showOverlayText(text: string, overlayConfig?: Record<string, unknown>): Promise<any> {
    console.log('showOverlayText called with text:', text);
    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    if (this.isElectron) {
      if (!api?.showSubtitleOverlay) {
        throw new Error(
          'Electron overlay API is missing. Restart the app from electron-app (npm run dev).'
        );
      }
      return await api.showSubtitleOverlay({
        text,
        config: overlayConfig || {},
      });
    }
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
    const url = await this.getMLServiceURL();
    const fullUrl = `${url}/translate`;

    await this.waitForMLService(30000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          target_language: targetLanguage,
          source_language: sourceLanguage,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.mlServiceReady = true;
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Translation timeout after 120 seconds');
      }
      if (this.isRetriableMLServiceError(error)) {
        this.mlServiceReady = false;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Configuration operations
  async getConfig(): Promise<Config> {
    return await this.callMLService('/config/get', undefined, {
      requireReady: false,
    });
  }

  async saveConfig(config: Config): Promise<void> {
    return await this.callMLService('/config/save', config, {
      requireReady: false,
    });
  }

  // Health check (does not require models to be loaded)
  async healthCheck(): Promise<MLServiceHealth> {
    const health = await this.fetchMLHealth();
    if (!health) {
      throw new Error("ML service health endpoint unreachable");
    }
    return health;
  }

  // Event listeners (simulated for Electron)
  async listen(eventName: string, _callback: (data: any) => void): Promise<void> {
    if (this.isElectron) {
      // In a real implementation, you'd use IPC events
      // For now, we'll simulate with polling
      console.log(`Listening for ${eventName} events`);
    }
  }

  // Audio chunk listener: connect to ML service WebSocket and forward capture chunks
  listenToAudioChunk(
    callback: (event: { data: number[]; sample_rate: number; source?: string }) => void,
    source: 'loopback' | 'mic' = 'loopback'
  ): () => void {
    let ws: WebSocket | null = null;
    let active = true;

    this.waitForBackendReachable()
    .then(() => this.getMLServiceURL())
    .then((baseUrl) => {
      if (!active) {
        return;
      }

      const wsUrl = baseUrl.replace(/^http/, 'ws') + `/audio/stream/${source}`;
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => {
          if (!active && ws) {
            ws.close();
            ws = null;
          }
        };
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data as string) as {
              data: number[];
              sample_rate: number;
              source?: string;
            };
            if (Array.isArray(msg.data) && typeof msg.sample_rate === 'number') {
              const MAX_SAMPLES = 8192;
              const data =
                msg.data.length > MAX_SAMPLES ? msg.data.slice(0, MAX_SAMPLES) : msg.data;
              callback({ data, sample_rate: msg.sample_rate, source: msg.source ?? source });
            }
          } catch (e) {
            console.warn('Audio chunk parse error:', e);
          }
        };
        ws.onerror = (err) => {
          if (active) {
            console.warn(`Audio stream WebSocket error (${source}):`, err);
          }
        };
        ws.onclose = () => { ws = null; };
      } catch (e) {
        console.error(`Failed to connect to audio stream (${source}):`, e);
      }
    }).catch((e) => {
      if (active) {
        console.warn(`Audio stream unavailable during startup (${source}):`, e);
      }
    });

    return () => {
      active = false;
      if (ws) {
        ws.onerror = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onopen = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
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
