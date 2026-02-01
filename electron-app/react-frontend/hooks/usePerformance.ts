import { useCallback, useEffect, useState } from "react";
import {
  getPerformanceMetrics,
  runPerformanceBenchmark,
  PerformanceMetrics,
  BenchmarkResult,
} from "../services/tauri";

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPerformanceMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load performance metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runBenchmark = useCallback(async () => {
    setBenchmarkLoading(true);
    setError(null);
    try {
      const result = await runPerformanceBenchmark();
      setBenchmark(result);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to run benchmark");
    } finally {
      setBenchmarkLoading(false);
    }
  }, []);

  return {
    metrics,
    benchmark,
    loading,
    benchmarkLoading,
    error,
    refresh,
    runBenchmark,
  };
}
