import React from "react";
import type { MLServiceStartupState } from "../services/electron";
import { useI18n } from "../hooks/useI18n";

interface Props {
  state: MLServiceStartupState;
  error: string | null;
  onRetry: () => void;
}

export function ModelLoadingBanner({ state, error, onRetry }: Props) {
  const { t } = useI18n();
  const bannerMessage =
    state.phase === "ready"
      ? t("model_loading.ready")
      : state.phase === "error"
        ? t("model_loading.error")
        : state.phase === "connecting"
          ? t("model_loading.connecting")
          : state.whisperLoaded && !state.translationLoaded
            ? t("model_loading.loading_translation_models")
            : !state.whisperLoaded
              ? t("model_loading.loading_speech_models")
              : t("model_loading.loading_models");

  return (
    <div
      className="sticky top-0 z-50 border-b border-blue-500/30 bg-gray-900/95 backdrop-blur-md shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-gray-200">{bannerMessage || state.message}</p>
          <span className="text-xs text-gray-400 tabular-nums">
            {Math.round(state.progress)}%
          </span>
        </div>

        <div
          className="h-2 w-full bg-gray-700 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={state.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("model_loading.progress_aria")}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, state.progress))}%`,
            }}
          />
        </div>

        {error && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-red-200">
            <span>{error}</span>
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded-md text-xs font-medium transition-colors"
            >
              {t("common.refresh")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
