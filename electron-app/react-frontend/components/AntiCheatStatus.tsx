import React, { useState, useEffect } from "react";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import * as tauri from "../services/tauri";

interface AntiCheatStatus {
  name: string;
  detected: boolean;
  compatible: boolean;
  status: string;
}

interface AntiCheatReport {
  detected_systems: AntiCheatStatus[];
  overall_status: string;
  timestamp: string;
}

export function AntiCheatStatusComponent() {
  const { t } = useI18n();
  const [report, setReport] = useState<AntiCheatReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAntiCheatReport();
    // Refresh every 10 seconds
    const interval = setInterval(loadAntiCheatReport, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAntiCheatReport = async () => {
    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Anti-cheat check timeout after 15 seconds")), 15000);
      });
      
      const reportData = await Promise.race([
        tauri.getAntiCheatReport(),
        timeoutPromise
      ]) as AntiCheatReport;
      
      setReport(reportData);
      setError(null);
    } catch (err) {
      console.error("Failed to load anti-cheat report:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      // Set default report to prevent infinite loading
      setReport({
        detected_systems: [],
        overall_status: "unknown",
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "certified":
        return "bg-green-900 text-green-200 border-green-700";
      case "tested":
        return "bg-blue-900 text-blue-200 border-blue-700";
      case "safe":
        return "bg-gray-900 text-gray-200 border-gray-700";
      default:
        return "bg-gray-900 text-gray-200 border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "certified":
        return "✓";
      case "tested":
        return "✓";
      case "safe":
        return "○";
      default:
        return "○";
    }
  };

  if (loading && !report) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-2 text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <span className="text-sm">Checking anti-cheat compatibility...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="text-red-400 text-sm">Error loading anti-cheat status: {error}</div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const detectedSystems = (report.detected_systems && Array.isArray(report.detected_systems))
    ? report.detected_systems.filter((s) => s.detected)
    : [];

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Anti-Cheat Status</h2>
        <button
          onClick={loadAntiCheatReport}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {detectedSystems.length > 0 ? (
        <div className="space-y-2">
          <div className="text-sm text-gray-300 mb-3">
            Detected anti-cheat systems:
          </div>
          {detectedSystems.map((system) => (
            <div
              key={system.name}
              className={`p-3 rounded-lg border ${getStatusColor(system.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(system.status)}</span>
                  <span className="font-semibold">{system.name}</span>
                </div>
                <div className="text-xs">
                  {system.compatible ? "Compatible" : "Unknown"}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 text-gray-300">
            <span>○</span>
            <span className="text-sm">No anti-cheat systems detected</span>
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400">
        Last checked: {new Date(report.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

