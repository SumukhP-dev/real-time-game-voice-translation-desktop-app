import React from "react";

interface Props {
  metrics?: {
    translationLatencyMs?: number;
    cpuUsage?: number;
    memoryUsageMb?: number;
  };
}

export function PerformanceStats({ metrics }: Props) {
  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <h3 className="text-lg font-semibold">Performance</h3>
      {!metrics && (
        <div className="text-sm text-gray-400">
          Performance monitoring is not yet wired. This will show latency and
          resource usage once the monitoring backend is added.
        </div>
      )}
      {metrics && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-gray-400">Latency (ms)</div>
            <div className="text-xl font-semibold">
              {metrics.translationLatencyMs?.toFixed(0) ?? "—"}
            </div>
          </div>
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-gray-400">CPU (%)</div>
            <div className="text-xl font-semibold">
              {metrics.cpuUsage?.toFixed(1) ?? "—"}
            </div>
          </div>
          <div className="bg-gray-900 p-3 rounded">
            <div className="text-gray-400">Memory (MB)</div>
            <div className="text-xl font-semibold">
              {metrics.memoryUsageMb?.toFixed(0) ?? "—"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
