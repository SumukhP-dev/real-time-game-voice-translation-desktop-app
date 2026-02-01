import { useCallback, useEffect, useState } from "react";
import { SteamConfig, SteamFriend, detectSteam, getSteamFriends, setSteamFriendLanguage } from "../services/tauri";

export function useSteam() {
  const [config, setConfig] = useState<SteamConfig>({ detected: false });
  const [friends, setFriends] = useState<SteamFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await detectSteam();
      setConfig(cfg);
      const fr = await getSteamFriends();
      setFriends(fr);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load Steam data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateFriendLanguage = useCallback(
    async (name: string, language: string) => {
      try {
        await setSteamFriendLanguage(name, language);
        await refresh();
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to update friend language");
      }
    },
    [refresh]
  );

  return { config, friends, loading, error, refresh, updateFriendLanguage };
}
