import { useCallback, useEffect, useState } from "react";
import electronService from "../services/electron";

// Define types locally
interface DiscordConfig {
  connected: boolean;
  presence?: any;
}

export function useDiscord() {
  const [config, setConfig] = useState<DiscordConfig>({ connected: false });
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
      setError(err?.toString?.() || "Failed to load Discord config");
    } finally {
      setLoading(false);
    }
  }, []);

  const initialize = useCallback(
    async (discordConfig: any) => {
      try {
        // Mock implementation
        console.log('Mock: initDiscord', discordConfig);
        await refresh();
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to initialize Discord");
        throw err;
      }
    },
    [refresh]
  );

  const updatePresence = useCallback(
    async (presence: any) => {
      try {
        // Mock implementation
        console.log('Mock: updateDiscordPresence', presence);
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to update Discord presence");
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { config, loading, error, refresh, initialize, updatePresence };
}
