import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  computeCommunicationStats,
  type CommunicationStats,
  type MatchSession,
  type TranslationRecord,
} from "../utils/communicationStats";

const STORAGE_KEY = "rtvt_match_history_v1";

type RecordTranslationInput = {
  original: string;
  translated: string;
  source_lang?: string;
  target_lang?: string;
  processing_ms?: number;
  teammate?: string;
};

type MatchHistoryContextValue = {
  history: MatchSession[];
  stats: CommunicationStats;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  startMatchSession: (gameMode: string) => Promise<void>;
  endMatchSession: () => Promise<void>;
  recordTranslation: (translation: RecordTranslationInput) => Promise<void>;
  clearHistory: () => Promise<void>;
};

const MatchHistoryContext = createContext<MatchHistoryContextValue | null>(null);

function parseSessions(raw: unknown): MatchSession[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (s): s is MatchSession =>
      s &&
      typeof s === "object" &&
      typeof (s as MatchSession).id === "string" &&
      Array.isArray((s as MatchSession).translations)
  );
}

function loadStoredHistory(): MatchSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return parseSessions(JSON.parse(raw));
  } catch {
    return [];
  }
}

function saveHistory(sessions: MatchSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function activeSessionId(sessions: MatchSession[]): string | null {
  const open = sessions.find((s) => !s.end_time);
  return open?.id ?? sessions[0]?.id ?? null;
}

export function MatchHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<MatchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback((sessions: MatchSession[]) => {
    setHistory(sessions);
    saveHistory(sessions);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      setHistory(loadStoredHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load match history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = useMemo(
    () => computeCommunicationStats(history),
    [history]
  );

  const startMatchSession = useCallback(
    async (gameMode: string) => {
      const sessions = loadStoredHistory();
      const openIdx = sessions.findIndex((s) => !s.end_time);
      if (openIdx >= 0) {
        setHistory(sessions);
        return;
      }
      const newSession: MatchSession = {
        id: Date.now().toString(),
        gameMode,
        start_time: new Date().toISOString(),
        total_translations: 0,
        translations: [],
      };
      persist([newSession, ...sessions]);
    },
    [persist]
  );

  const endMatchSession = useCallback(async () => {
    const sessions = loadStoredHistory();
    const id = activeSessionId(sessions);
    if (!id) return;
    const updated = sessions.map((s) =>
      s.id === id ? { ...s, end_time: new Date().toISOString() } : s
    );
    persist(updated);
  }, [persist]);

  const recordTranslation = useCallback(
    async (translation: RecordTranslationInput) => {
      const sessions = loadStoredHistory();
      let id = activeSessionId(sessions);
      let next = [...sessions];

      if (!id) {
        const newSession: MatchSession = {
          id: Date.now().toString(),
          gameMode: "General",
          start_time: new Date().toISOString(),
          total_translations: 0,
          translations: [],
        };
        next = [newSession, ...next];
        id = newSession.id;
      }

      const record: TranslationRecord = {
        original: translation.original,
        translated: translation.translated,
        source_lang: translation.source_lang || "unknown",
        target_lang: translation.target_lang || "unknown",
        timestamp: new Date().toISOString(),
        processing_ms: translation.processing_ms,
      };

      next = next.map((session) =>
        session.id === id
          ? {
              ...session,
              total_translations: session.total_translations + 1,
              translations: [...session.translations, record],
            }
          : session
      );
      persist(next);
    },
    [persist]
  );

  const clearHistory = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  const value: MatchHistoryContextValue = {
    history,
    stats,
    loading,
    error,
    refresh,
    startMatchSession,
    endMatchSession,
    recordTranslation,
    clearHistory,
  };

  return (
    <MatchHistoryContext.Provider value={value}>
      {children}
    </MatchHistoryContext.Provider>
  );
}

export function useMatchHistory(): MatchHistoryContextValue {
  const ctx = useContext(MatchHistoryContext);
  if (!ctx) {
    throw new Error("useMatchHistory must be used within MatchHistoryProvider");
  }
  return ctx;
}
