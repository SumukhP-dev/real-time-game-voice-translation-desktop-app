import React from "react";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

interface PrivacyStatusBadgeProps {
  onClick?: () => void;
}

export function PrivacyStatusBadge({ onClick }: PrivacyStatusBadgeProps) {
  const { t } = useI18n();

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg ${
        onClick ? "cursor-pointer hover:bg-opacity-70" : ""
      }`}
      title="100% Offline - Zero Data Collection"
    >
      <span className="text-green-400">🔒</span>
      <span className="text-sm font-medium text-green-200">
        100% Offline
      </span>
      <span className="text-xs text-green-400">Zero Data</span>
    </div>
  );
}

