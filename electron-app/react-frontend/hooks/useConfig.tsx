import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import electronService from "../services/electron";
import type { Config } from "../services/electron";

export const DEFAULT_OVERLAY = {
  enabled: true,
  position_x: 100,
  position_y: 100,
  font_size: 24,
  text_color: "#FFFFFF",
  background_color: "#000000",
  max_width: 800,
  max_lines: 3,
  fade_duration: 5.0,
  show_same_language: true,
  style_preset: "minimal",
  position_preset: "bottom",
} as const;

export const DEFAULT_CONFIG: Config = {
  audio: {
    device_index: null,
    microphone_device_index: null,
    tts_output_device_index: null,
    chunk_size: 4096,
    sample_rate: 16000,
    channels: 1,
  },
  whisper: {
    model: "base",
    language: null,
    min_buffer_duration: 1.6,
    min_transcription_interval: 1.5,
  },
  translation: {
    target_language: "en",
    auto_detect: true,
    provider: "local",
    model_type: "nllb",
    model_name: "facebook/nllb-200-distilled-600M",
    use_fallback: false,
    show_same_language: true,
    ui_language: "en",
    enable_overlay: true,
    enable_tts: false,
    translate_to_teammates: false,
    team_target_language: "en",
    use_auto_detect_team_language: false,
    tts_for_team_translations: false,
  },
  tts: { enabled: false, engine: "default", rate: 1.0, volume: 1.0 },
  voice_output: { mode: "virtual_mic", preset: "game" },
  overlay: { ...DEFAULT_OVERLAY },
  ui: {
    theme: "dark",
    language: "en",
    auto_start: false,
    minimize_to_tray: true,
    show_notifications: true,
  },
  app: { setup_complete: false, ui_language: "en" },
};

type ConfigContextValue = {
  config: Config | null;
  loading: boolean;
  error: string | null;
  loadConfig: () => Promise<void>;
  updateConfig: (newConfig: Config) => Promise<void>;
};

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Config loading timeout after 10 seconds")),
          10000
        );
      });

      const cfg = (await Promise.race([
        electronService.getConfig(),
        timeoutPromise,
      ])) as Config;

      setConfig({
        ...DEFAULT_CONFIG,
        ...cfg,
        overlay: { ...DEFAULT_OVERLAY, ...cfg.overlay },
      });
      setError(null);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load config";
      console.error("Config loading error:", err);
      setError(errorMsg);
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(
    async (newConfig: Config) => {
      try {
        const merged: Config = {
          ...DEFAULT_CONFIG,
          ...newConfig,
          overlay: { ...DEFAULT_OVERLAY, ...newConfig.overlay },
        };
        setConfig(merged);
        await electronService.saveConfig(merged);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update config");
        await loadConfig();
        throw err;
      }
    },
    [loadConfig]
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <ConfigContext.Provider
      value={{ config, loading, error, loadConfig, updateConfig }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig must be used within ConfigProvider");
  }
  return ctx;
}
