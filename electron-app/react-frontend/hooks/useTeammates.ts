import { useCallback, useEffect, useState } from "react";
import electronService from "../services/electron";

// Define types locally since they're not exported from electron service
interface TeammateProfile {
  id: string;
  name: string;
  language: string;
  detected_language?: string;
  primary_language?: string;
  detected_languages?: Record<string, number>;
  translation_count?: number;
  translations: Array<{
    text: string;
    timestamp: Date;
    source_language: string;
    target_language: string;
  }>;
}

export function useTeammates() {
  const [teammates, setTeammates] = useState<TeammateProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeTeammate = (t: TeammateProfile): TeammateProfile => {
    const translations = Array.isArray(t.translations) ? t.translations : [];
    return {
      ...t,
      translations,
      translation_count: translations.length,
      detected_languages: t.detected_languages ?? {},
    };
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await electronService.getTeammates();
      setTeammates(list.map(normalizeTeammate));
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load teammates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ teammates: TeammateProfile[] }>;
      const updated = customEvent.detail?.teammates ?? [];
      setTeammates(updated.map(normalizeTeammate));
    };

    window.addEventListener("teammates:updated", handler);
    return () => window.removeEventListener("teammates:updated", handler);
  }, []);

  const saveProfile = useCallback(
    async (profile: TeammateProfile) => {
      // Mock implementation
      console.log('Mock: saveProfile', profile);
      await refresh();
    },
    [refresh]
  );

  const setLanguage = useCallback(
    async (name: string, language: string) => {
      // Mock implementation
      console.log('Mock: setLanguage', { name, language });
      await refresh();
    },
    [refresh]
  );

  const recordTranslation = useCallback(
    async (name: string) => {
      // Mock implementation
      console.log('Mock: recordTranslation', name);
      await refresh();
    },
    [refresh]
  );

  return {
    teammates,
    loading,
    error,
    refresh,
    saveProfile,
    setLanguage,
    recordTranslation,
  };
}
