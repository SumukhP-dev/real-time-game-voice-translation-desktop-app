import React, { useEffect, useState } from "react";
import {
  CommunicationMetrics,
  getCommunicationMetrics,
} from "../services/tauri";

export function CommunicationAnalytics() {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommunicationMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="p-4 bg-gray-800 rounded">Loading analytics…</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 text-red-100 rounded">
        Failed to load analytics: {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-gray-800 rounded text-sm text-gray-400">
        No analytics data yet. Start a match and record translations.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Communication Analytics</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          onClick={load}
        >
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-gray-400">Total Translations</div>
          <div className="text-xl font-semibold">
            {metrics.total_translations}
          </div>
        </div>
        <div className="bg-gray-900 p-3 rounded">
          <div className="text-gray-400">Languages used</div>
          <div className="text-xl font-semibold">{metrics.languages_used}</div>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Analytics are computed locally from match history; ML-based insights can
        be added later.
      </div>
    </div>
  );
}
