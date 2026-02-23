import React, { useEffect, useState } from "react";

// Define types locally
interface CommunicationMetrics {
  totalMessages: number;
  messagesPerMinute: number;
  languageDiversity: number;
  responseTime: number;
  teammates: any[];
  most_common_languages: string[];
}

export function CommunicationAnalytics() {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock implementation
      console.log('Mock: getCommunicationMetrics');
      const mockMetrics: CommunicationMetrics = {
        totalMessages: 150,
        messagesPerMinute: 2.5,
        languageDiversity: 0.8,
        responseTime: 1.2,
        teammates: [],
        most_common_languages: ['en', 'es', 'fr']
      };
      setMetrics(mockMetrics);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Communication Analytics</h3>
        <button
          onClick={load}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="text-center py-4">
          <p className="text-red-400">{error}</p>
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
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">No analytics data available</p>
        </div>
      )}
    </div>
  );
}
