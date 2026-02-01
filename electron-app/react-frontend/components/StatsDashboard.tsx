import React from "react";
import { useMatchHistory } from "../hooks/useMatchHistory";
import { TeamStats } from "./TeamStats";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

export function StatsDashboard() {
  const { stats, loading, refresh } = useMatchHistory();
  const { t } = useI18n();

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Statistics Dashboard</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <TeamStats stats={stats} loading={loading} onRefresh={refresh} />
      </div>
    </div>
  );
}
