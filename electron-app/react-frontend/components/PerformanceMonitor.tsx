import React from "react";
import { usePerformance } from "../hooks/usePerformance";

export function PerformanceMonitor() {
  const { metrics, loading, error, refresh } = usePerformance();

  if (loading && !metrics) {
    return <div className="p-4 bg-gray-800 rounded">Loading performance…</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Monitoring</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-200 bg-red-900 p-2 rounded">
          {error}
        </div>
      )}
      {metrics ? (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-gray-400">CPU Usage</div>
            <div className="text-xl font-semibold">
              {metrics.cpu_usage.toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-gray-400">Memory</div>
            <div className="text-xl font-semibold">
              {metrics.memory_mb.toFixed(0)} /{" "}
              {metrics.total_memory_mb.toFixed(0)} MB
            </div>
          </div>
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-gray-400">Latency (ms)</div>
            <div className="text-xl font-semibold">—</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          No performance data yet. Click Refresh.
        </div>
      )}
    </div>
  );
}
