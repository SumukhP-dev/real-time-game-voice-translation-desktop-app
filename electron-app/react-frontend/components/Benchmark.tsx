import React from "react";
import { usePerformance } from "../hooks/usePerformance";

export function Benchmark() {
  const { benchmark, benchmarkLoading, error, runBenchmark } = usePerformance();

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Performance Benchmark</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={runBenchmark}
          disabled={benchmarkLoading}
        >
          {benchmarkLoading ? "Running..." : "Run"}
        </button>
      </div>
      {error && (
        <div className="text-sm text-red-200 bg-red-900 p-2 rounded">
          {error}
        </div>
      )}
      {benchmark ? (
        <div className="text-sm text-gray-300">
          Translation roundtrip: {benchmark.translation_roundtrip_ms} ms
        </div>
      ) : (
        <div className="text-sm text-gray-400">No benchmark run yet.</div>
      )}
    </div>
  );
}
