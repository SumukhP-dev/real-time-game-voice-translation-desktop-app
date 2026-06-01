import React from "react";
import { useMatchHistory } from "../hooks/useMatchHistory";
import { TeamStats } from "./TeamStats";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import type { CommunicationStats } from "../utils/communicationStats";

interface StatsDashboardProps {
  statsOverride?: CommunicationStats;
  loadingOverride?: boolean;
  onRefreshOverride?: (() => void) | null;
}

export function StatsDashboard({
  statsOverride,
  loadingOverride,
  onRefreshOverride,
}: StatsDashboardProps) {
  const { stats, loading, refresh } = useMatchHistory();
  const { t } = useI18n();
  const effectiveStats = statsOverride ?? stats;
  const effectiveLoading = loadingOverride ?? loading;
  const effectiveRefresh =
    onRefreshOverride === undefined ? refresh : onRefreshOverride ?? undefined;

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          {t("stats.dashboard_title")}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <TeamStats
          stats={effectiveStats}
          loading={effectiveLoading}
          onRefresh={effectiveRefresh}
        />
      </div>
    </div>
  );
}
