import { useCallback, useEffect, useState } from "react";
import { DiscordConfig, getDiscordConfig, initDiscord, updateDiscordPresence } from "../services/tauri";

export function useDiscord() {
  const [config, setConfig] = useState<DiscordConfig>({
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await getDiscordConfig();
      setConfig(cfg);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load Discord config");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (cfg: DiscordConfig) => {
      setLoading(true);
      setError(null);
      try {
        await initDiscord(cfg);
        setConfig(cfg);
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to save Discord config");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updatePresence = useCallback(
    async (status: string, game?: string, language?: string) => {
      try {
        await updateDiscordPresence({ status, game, language });
      } catch (err) {
        console.warn("Failed to update Discord presence", err);
      }
    },
    []
  );

  return { config, setConfig, loading, error, refresh, save, updatePresence };
}
