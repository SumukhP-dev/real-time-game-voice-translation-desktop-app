import React, { useState, useEffect } from "react";
import { useMatchHistory } from "../hooks/useMatchHistory";
import { useTeammates } from "../hooks/useTeammates";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import { StatsDashboard } from "./StatsDashboard";

interface QuickStatsCardProps {
  onViewFullStats?: () => void;
}

export function QuickStatsCard({ onViewFullStats }: QuickStatsCardProps) {
  const { t } = useI18n();
  const { history: matchHistory } = useMatchHistory();
  const { teammates } = useTeammates();
  const [showFullStats, setShowFullStats] = useState(false);
  const [translationsToday, setTranslationsToday] = useState(0);

  useEffect(() => {
    // Calculate translations today from match history
    if (!matchHistory || !Array.isArray(matchHistory)) {
      setTranslationsToday(0);
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTranslations = matchHistory
      .filter((session) => {
        const sessionDate = new Date(session.start_time);
        return sessionDate >= today;
      })
      .reduce((sum, session) => sum + session.total_translations, 0);
    
    setTranslationsToday(todayTranslations);
  }, [matchHistory]);

  const activeTeammates = (teammates && Array.isArray(teammates))
    ? teammates.filter((t) => {
        // Consider teammate active if they've been detected recently
        // This is a simplified check
        return true;
      }).length
    : 0;

  if (showFullStats) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Full Statistics</h2>
            <button
              onClick={() => setShowFullStats(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <StatsDashboard />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        setShowFullStats(true);
        onViewFullStats?.();
      }}
      className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-600 cursor-pointer transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">Quick Stats</h3>
        <span className="text-xs text-blue-400 hover:text-blue-300">
          View Full →
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-bold text-white">{translationsToday}</div>
          <div className="text-xs text-gray-400">Translations Today</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">{activeTeammates}</div>
          <div className="text-xs text-gray-400">Active Teammates</div>
        </div>
        <div>
          <div className="text-lg font-bold text-white">
            {matchHistory && Array.isArray(matchHistory) ? matchHistory.length : 0}
          </div>
          <div className="text-xs text-gray-400">Matches</div>
        </div>
      </div>
    </div>
  );
}

