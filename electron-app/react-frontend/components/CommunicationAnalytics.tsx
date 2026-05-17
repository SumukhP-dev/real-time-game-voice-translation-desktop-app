import React from "react";
import { useMatchHistory } from "../hooks/useMatchHistory";
import { TeamStats } from "./TeamStats";

export function CommunicationAnalytics() {
  const { stats, loading, refresh } = useMatchHistory();

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Communication Analytics</h3>
      </div>
      <TeamStats stats={stats} loading={loading} onRefresh={refresh} />
    </div>
  );
}
