import { useCallback, useEffect, useState } from "react";
import { OBSConfig, connectOBS, disconnectOBS, getOBSConfig } from "../services/tauri";

export function useOBS() {
  const [config, setConfig] = useState<OBSConfig>({
    host: "localhost",
    port: 4455,
    password: null,
    connected: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await getOBSConfig();
      setConfig(cfg);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load OBS config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const connect = useCallback(
    async (cfg: OBSConfig) => {
      setLoading(true);
      setError(null);
      try {
        await connectOBS(cfg);
        setConfig({ ...cfg, connected: true });
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to connect to OBS");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const disconnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await disconnectOBS();
      setConfig((prev) => ({ ...prev, connected: false }));
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to disconnect OBS");
    } finally {
      setLoading(false);
    }
  }, []);

  return { config, setConfig, loading, error, refresh, connect, disconnect };
}
