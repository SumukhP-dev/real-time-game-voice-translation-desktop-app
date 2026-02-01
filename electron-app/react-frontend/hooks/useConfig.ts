import { useState, useEffect, useCallback } from "react";
import * as tauri from "../services/tauri";
import type { Config } from "../services/tauri";

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
        tauri.getConfig(),
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
        audio: { device_index: 0, chunk_size: 4096, sample_rate: 16000, channels: 1 },
        translation: { target_language: "en", auto_detect: true },
        overlay: { enabled: true, font_size: 24, fade_duration: 5.0 },
        app: { setup_complete: true, version: "1.0.0", ui_language: "en" }
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
      await tauri.setConfig(newConfig);
      await tauri.saveConfig();
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
