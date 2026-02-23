import { useCallback, useEffect, useState } from "react";
import electronService from "../services/electron";

// Define types locally
interface SteamFriend {
  id: string;
  name: string;
  language?: string;
}

interface SteamConfig {
  detected: boolean;
  friends?: SteamFriend[];
}

export function useSteam() {
  const [config, setConfig] = useState<SteamConfig>({ detected: false });
  const [friends, setFriends] = useState<SteamFriend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      const cfg = { detected: false, friends: [] };
      setConfig(cfg);
      const fr: SteamFriend[] = [];
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
        // Mock implementation
        console.log('Mock: updateFriendLanguage', { name, language });
        await refresh();
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to update friend language");
      }
    },
    [refresh]
  );

  return { config, friends, loading, error, refresh, updateFriendLanguage };
}
