import { useCallback, useEffect, useState } from "react";
import electronService from "../services/electron";

// Define types locally
interface OBSConfig {
  connected: boolean;
  scene?: string;
}

export function useOBS() {
  const [config, setConfig] = useState<OBSConfig>({ connected: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      const cfg = { connected: false };
      setConfig(cfg);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load OBS config");
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(
    async (obsConfig: any) => {
      try {
        // Mock implementation
        console.log('Mock: connectOBS', obsConfig);
        await refresh();
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to connect to OBS");
        throw err;
      }
    },
    [refresh]
  );

  const disconnect = useCallback(async () => {
    try {
      // Mock implementation
      console.log('Mock: disconnectOBS');
      setConfig({ connected: false });
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to disconnect from OBS");
      throw err;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { config, loading, error, refresh, connect, disconnect };
}
