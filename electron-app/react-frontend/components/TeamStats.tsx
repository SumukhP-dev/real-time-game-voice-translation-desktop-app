import React from "react";
import type { CommunicationStats } from "../utils/communicationStats";
import { useI18n } from "../hooks/useI18n";

interface Props {
  stats: CommunicationStats;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TeamStats({ stats, loading, onRefresh }: Props) {
  const { t } = useI18n();
  const hasLanguages = stats.most_common_languages.length > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t("stats.team_communication")}
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading || !onRefresh}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
        >
          {t("common.refresh")}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-400 mt-2">{t("stats.loading_metrics")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">{t("stats.total_messages")}</p>
              <p className="text-white text-xl font-bold">{stats.totalMessages}</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">{t("stats.messages_per_minute")}</p>
              <p className="text-white text-xl font-bold">
                {stats.messagesPerMinute.toFixed(1)}
              </p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">{t("stats.language_diversity")}</p>
              <p className="text-white text-xl font-bold">
                {(stats.languageDiversity * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">{t("stats.response_time")}</p>
              <p className="text-white text-xl font-bold">
                {stats.responseTime > 0
                  ? t("stats.response_time_value", { seconds: stats.responseTime })
                  : t("stats.not_available")}
              </p>
            </div>
          </div>

          <div className="bg-gray-700 rounded p-3">
            <p className="text-gray-400 text-sm mb-2">
              {t("stats.most_common_languages")}
            </p>
            {hasLanguages ? (
              <div className="flex flex-wrap gap-2">
                {stats.most_common_languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                {t("stats.no_translations_recorded")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
