import { useState, useEffect, useCallback } from "react";
import electronService from "../services/electron";
import type { Config } from "../services/electron";

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Config loading timeout after 10 seconds")), 10000);
      });
      
      const cfg = await Promise.race([
        electronService.getConfig(),
        timeoutPromise
      ]) as Config;
      
      setConfig(cfg);
      setError(null);
      console.log("Config loaded successfully:", cfg);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load config";
      console.error("Config loading error:", err);
      setError(errorMsg);
      // Set a default config to prevent infinite loading
      setConfig({
        audio: { device_index: null, chunk_size: 4096, sample_rate: 16000, channels: 1 },
        whisper: { model: "tiny", language: null, min_buffer_duration: 1.0, min_transcription_interval: 2.0 },
        translation: { target_language: "en", auto_detect: true, provider: "local", model_type: "nllb", model_name: "facebook/nllb-200-distilled-600M", use_fallback: false, show_same_language: false, ui_language: "en", enable_overlay: true, enable_tts: false },
        tts: { enabled: false, engine: "default", rate: 1.0, volume: 1.0 },
        overlay: { enabled: true, position_x: 100, position_y: 100, font_size: 24, text_color: "#FFFFFF", background_color: "#000000", max_width: 800, max_lines: 3, fade_duration: 5.0, show_same_language: false },
        ui: { theme: "dark", language: "en", auto_start: false, minimize_to_tray: true, show_notifications: true },
        app: { setup_complete: false, ui_language: "en" }
      } as Config);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: Config) => {
    try {
      // Update state immediately for responsive UI
      setConfig(newConfig);
      // Then sync with backend
      await electronService.saveConfig(newConfig);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update config");
      // Reload config on error to restore correct state
      await loadConfig();
      throw err;
    }
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    loadConfig,
    updateConfig,
  };
}
