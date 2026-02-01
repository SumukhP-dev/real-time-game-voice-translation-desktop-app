import React from "react";
import { useTeammates } from "../hooks/useTeammates";

export function TeammateManager() {
  const { teammates, loading, error, setLanguage } = useTeammates();

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <h3 className="text-lg font-semibold">Teammate Management</h3>
      <p className="text-xs text-gray-400">
        Teammates are automatically detected from game audio. You can manually
        set languages below.
      </p>

      {error && (
        <div className="text-sm text-red-200 bg-red-900 p-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2 text-sm">
        {teammates.length === 0 && (
          <div className="text-gray-500">No teammates yet.</div>
        )}
        {teammates.map((t) => (
          <div key={t.name} className="bg-gray-900 p-3 rounded">
            <div className="flex justify-between">
              <div className="text-gray-200 font-semibold">{t.name}</div>
              <div className="text-xs text-gray-400">
                Translations: {t.translation_count}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Primary: {t.primary_language || "n/a"}
            </div>
            {t.detected_languages &&
              Object.keys(t.detected_languages).length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Detected languages:{" "}
                  {Object.entries(t.detected_languages)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 3)
                    .map(([lang, count]) => `${lang} (${count})`)
                    .join(", ")}
                </div>
              )}
            <div className="flex items-center space-x-2 mt-1 text-xs">
              <input
                className="bg-gray-800 p-1 rounded border border-gray-700 w-24"
                placeholder="Set language"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLanguage(t.name, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
