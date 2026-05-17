import React from "react";
import type { CommunicationStats } from "../utils/communicationStats";

interface Props {
  stats: CommunicationStats;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TeamStats({ stats, loading, onRefresh }: Props) {
  const hasLanguages = stats.most_common_languages.length > 0;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Team Communication</h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-400 mt-2">Loading metrics...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Total Messages</p>
              <p className="text-white text-xl font-bold">{stats.totalMessages}</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Messages/Min</p>
              <p className="text-white text-xl font-bold">
                {stats.messagesPerMinute.toFixed(1)}
              </p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Language Diversity</p>
              <p className="text-white text-xl font-bold">
                {(stats.languageDiversity * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Response Time</p>
              <p className="text-white text-xl font-bold">
                {stats.responseTime > 0 ? `${stats.responseTime}s` : "—"}
              </p>
            </div>
          </div>

          <div className="bg-gray-700 rounded p-3">
            <p className="text-gray-400 text-sm mb-2">Most Common Languages</p>
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
              <p className="text-gray-500 text-sm">No translations recorded yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
