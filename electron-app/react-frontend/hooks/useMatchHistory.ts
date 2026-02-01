import { useEffect, useState, useCallback } from "react";
import {
  addMatchTranslation,
  getMatchHistory,
  getMatchStatistics,
  MatchSession,
  MatchStatistics,
  startMatchSession,
  endMatchSession,
} from "../services/tauri";

export function useMatchHistory() {
  const [history, setHistory] = useState<MatchSession[]>([]);
  const [stats, setStats] = useState<MatchStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Match history loading timeout after 5 seconds")), 5000);
      });
      
      const [hist, stat] = await Promise.race([
        Promise.all([
          getMatchHistory(),
          getMatchStatistics(),
        ]),
        timeoutPromise
      ]) as [any, any];
      
      setHistory(hist);
      setStats(stat);
    } catch (err: any) {
      const errorMsg = err?.toString?.() || "Failed to load match history";
      console.error("Match history loading error:", err);
      setError(errorMsg);
      // Set empty defaults to prevent infinite loading
      setHistory([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recordTranslation = useCallback(
    async (params: {
      original: string;
      translated: string;
      source_lang: string;
      target_lang: string;
      teammate?: string | null;
    }) => {
      try {
        await addMatchTranslation(params);
        await refresh();
      } catch (err: any) {
        console.error("Failed to record translation", err);
        setError(err?.toString?.() || "Failed to record translation");
      }
    },
    [refresh]
  );

  return {
    history,
    stats,
    loading,
    error,
    startMatchSession,
    endMatchSession,
    recordTranslation,
    refresh,
  };
}
