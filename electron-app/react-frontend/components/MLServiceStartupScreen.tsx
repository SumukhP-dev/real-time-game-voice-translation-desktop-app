import React from "react";
import type { MLServiceStartupState } from "../services/electron";

interface Props {
  state: MLServiceStartupState;
  error: string | null;
  onRetry: () => void;
}

export function MLServiceStartupScreen({ state, error, onRetry }: Props) {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="w-full max-w-md text-center space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-blue-400">
            SquadSpeak
          </h1>
          <p className="text-gray-400 text-sm">
            Real-time voice translation for gaming
          </p>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700 p-6 space-y-4 text-left">
          <p className="text-gray-200 text-sm text-center">{state.message}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Loading AI models</span>
              <span>{Math.round(state.progress)}%</span>
            </div>
            <div
              className="h-2.5 w-full bg-gray-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={state.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Model loading progress"
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, state.progress))}%` }}
              />
            </div>
          </div>

          <p className="text-gray-500 text-xs text-center">
            First launch can take about a minute while models load. Later
            launches are faster.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-sm text-red-100 space-y-3">
            <p>{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
