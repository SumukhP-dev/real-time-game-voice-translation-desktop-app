import { useCallback, useEffect, useState } from "react";
import {
  TeammateProfile,
  getTeammates,
  upsertTeammate,
  updateTeammateLanguage,
  recordTeammateTranslation,
} from "../services/tauri";

export function useTeammates() {
  const [teammates, setTeammates] = useState<TeammateProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getTeammates();
      setTeammates(list);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load teammates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProfile = useCallback(
    async (profile: TeammateProfile) => {
      await upsertTeammate(profile);
      await refresh();
    },
    [refresh]
  );

  const setLanguage = useCallback(
    async (name: string, language: string) => {
      await updateTeammateLanguage(name, language);
      await refresh();
    },
    [refresh]
  );

  const recordTranslation = useCallback(
    async (name: string) => {
      await recordTeammateTranslation(name);
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
