import { useCallback, useEffect, useState } from "react";
import electronService from "../services/electron";

// Define types locally
interface MatchSession {
  id: string;
  gameMode: string;
  start_time: Date;
  end_time?: Date;
  total_translations: number;
  translations: Array<{
    original: string;
    translated: string;
    timestamp: Date;
  }>;
}

interface MatchStatistics {
  totalTranslations: number;
  uniqueLanguages: number;
  avgTranslationTime: number;
}

export function useMatchHistory() {
  const [history, setHistory] = useState<MatchSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      setHistory([]);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load match history");
    } finally {
      setLoading(false);
    }
  }, []);

  const startMatchSession = useCallback(
    async (gameMode: string) => {
      try {
        // Mock implementation
        console.log('Mock: startMatchSession', gameMode);
        const newSession: MatchSession = {
          id: Date.now().toString(),
          gameMode,
          start_time: new Date(),
          total_translations: 0,
          translations: []
        };
        setHistory(prev => [newSession, ...prev]);
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to start match session");
        throw err;
      }
    },
    []
  );

  const endMatchSession = useCallback(async () => {
    try {
      // Mock implementation
      console.log('Mock: endMatchSession');
      setHistory(prev => 
        prev.map(session => 
          session.id === prev[0]?.id 
            ? { ...session, end_time: new Date() }
            : session
        )
      );
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to end match session");
      throw err;
    }
  },
    []
  );

  const recordTranslation = useCallback(
    async (translation: any) => {
      try {
        // Mock implementation
        console.log('Mock: recordTranslation', translation);
        setHistory(prev => 
          prev.map(session => 
            session.id === prev[0]?.id 
              ? { 
                  ...session, 
                  total_translations: session.total_translations + 1,
                  translations: [...session.translations, {
                    original: translation.original,
                    translated: translation.translated,
                    timestamp: new Date()
                  }]
                }
              : session
          )
        );
      } catch (err: any) {
        setError(err?.toString?.() || "Failed to record translation");
        throw err;
      }
    },
    []
  );

  const clearHistory = useCallback(async () => {
    try {
      // Mock implementation
      console.log('Mock: clearMatchHistory');
      setHistory([]);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to clear match history");
      throw err;
    }
  },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { 
    history, 
    loading, 
    error, 
    refresh, 
    startMatchSession, 
    endMatchSession, 
    recordTranslation,
    clearHistory 
  };
}
