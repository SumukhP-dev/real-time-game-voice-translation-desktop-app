import React, { useEffect, useState } from "react";
import { MatchStatistics } from "../services/tauri";
import {
  CommunicationMetrics,
  getCommunicationMetrics,
} from "../services/tauri";

interface Props {
  stats: MatchStatistics | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TeamStats({ stats, loading, onRefresh }: Props) {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Metrics loading timeout after 10 seconds")), 10000);
      });
      
      const data = await Promise.race([
        getCommunicationMetrics(),
        timeoutPromise
      ]) as CommunicationMetrics;
      
      setMetrics(data);
    } catch (err: any) {
      const errorMsg = err?.toString?.() || "Failed to load analytics";
      console.error("Metrics loading error:", err);
      setMetricsError(errorMsg);
      // Set default metrics to prevent infinite loading
      setMetrics({
        total_translations: 0,
        languages_used: 0
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading || metricsLoading) {
    return <div className="p-4 bg-gray-800 rounded">Loading statistics…</div>;
  }

  if (!stats && !metrics) {
    return (
      <div className="p-4 bg-gray-800 rounded text-sm text-gray-400">
        No statistics available yet. Start a match to begin tracking.
      </div>
    );
  }

  const handleRefresh = async () => {
    await loadMetrics();
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Team & Usage Stats</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleRefresh}
          disabled={loading || metricsLoading}
        >
          {loading || metricsLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-gray-400">Total Translations</div>
          <div className="text-xl font-semibold">
            {stats?.total_translations || metrics?.total_translations || 0}
          </div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-gray-400">Total Playtime (hrs)</div>
          <div className="text-xl font-semibold">
            {stats ? (stats.total_duration_seconds / 3600).toFixed(1) : "0.0"}
          </div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-gray-400">Languages used</div>
          <div className="text-xl font-semibold">
            {metrics?.languages_used || 0}
        </div>
      </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-gray-400">Teammates</div>
          <div className="text-xl font-semibold">{metrics?.teammates || 0}</div>
        </div>
      </div>

      {stats && stats.most_common_languages.length > 0 && (
      <div>
        <div className="text-sm text-gray-300 font-semibold mb-1">
          Most Common Languages
        </div>
        <ul className="space-y-1 text-sm text-gray-300">
          {stats.most_common_languages.slice(0, 5).map(([lang, count]) => (
            <li key={lang}>
              {lang}:{" "}
              <span className="text-gray-400">{count} translations</span>
            </li>
          ))}
        </ul>
      </div>
      )}

      {metricsError && (
        <div className="text-xs text-red-400">Warning: {metricsError}</div>
      )}
    </div>
  );
}
