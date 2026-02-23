import React, { useEffect, useState } from "react";
import { useTeammates } from "../hooks/useTeammates";

// Define types locally
interface CommunicationMetrics {
  totalMessages: number;
  messagesPerMinute: number;
  languageDiversity: number;
  responseTime: number;
  teammates: any[];
  most_common_languages: string[];
}

interface MatchStatistics {
  totalTranslations: number;
  uniqueLanguages: number;
  avgTranslationTime: number;
  total_duration_seconds: number;
  most_common_languages: string[];
}

interface Props {
  stats: MatchStatistics | null;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TeamStats({ stats, loading, onRefresh }: Props) {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const { teammates } = useTeammates();

  const loadMetrics = async () => {
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      // Mock implementation
      console.log('Mock: getCommunicationMetrics');
      const mockMetrics: CommunicationMetrics = {
        totalMessages: stats?.totalTranslations || 0,
        messagesPerMinute: 2.5,
        languageDiversity: 0.8,
        responseTime: 1.2,
        teammates: teammates || [],
        most_common_languages: ['en', 'es', 'fr']
      };
      setMetrics(mockMetrics);
    } catch (err) {
      setMetricsError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [stats, teammates]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Team Communication</h3>
        <button
          onClick={onRefresh}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {metricsLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading metrics...</p>
        </div>
      ) : metricsError ? (
        <div className="text-center py-4">
          <p className="text-red-400">{metricsError}</p>
        </div>
      ) : metrics ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Total Messages</p>
              <p className="text-white text-xl font-bold">{metrics.totalMessages}</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Messages/Min</p>
              <p className="text-white text-xl font-bold">{metrics.messagesPerMinute}</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Language Diversity</p>
              <p className="text-white text-xl font-bold">{(metrics.languageDiversity * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <p className="text-gray-400 text-sm">Response Time</p>
              <p className="text-white text-xl font-bold">{metrics.responseTime}s</p>
            </div>
          </div>

          <div className="bg-gray-700 rounded p-3">
            <p className="text-gray-400 text-sm mb-2">Most Common Languages</p>
            <div className="flex flex-wrap gap-2">
              {metrics.most_common_languages.map((lang: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                >
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-700 rounded p-3">
            <p className="text-gray-400 text-sm mb-2">Active Teammates</p>
            <div className="space-y-1">
              {metrics.teammates.length === 0 ? (
                <p className="text-gray-500 text-sm">No teammates detected</p>
              ) : (
                metrics.teammates.slice(0, 3).map((teammate: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{teammate.name || `Teammate ${index + 1}`}</span>
                    <span className="text-gray-400">{teammate.language || 'Unknown'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">No metrics available</p>
        </div>
      )}
    </div>
  );
}
