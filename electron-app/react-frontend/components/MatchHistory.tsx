import React from "react";
import { MatchSession } from "../services/tauri";

interface Props {
  history: MatchSession[];
  loading?: boolean;
  error?: string | null;
}

export function MatchHistory({ history, loading, error }: Props) {
  if (loading) {
    return (
      <div className="p-4 bg-gray-800 rounded">Loading match history…</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 text-red-100 rounded">
        Failed to load match history: {error}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <h3 className="text-lg font-semibold">Match History</h3>
      {history.length === 0 && (
        <div className="text-sm text-gray-400">No matches recorded yet.</div>
      )}
      <div className="space-y-3 max-h-96 overflow-auto">
        {history
          .slice()
          .reverse()
          .map((session, idx) => (
            <div
              key={`${session.start_time}-${idx}`}
              className="border border-gray-700 rounded p-3 bg-gray-900"
            >
              <div className="flex justify-between text-sm text-gray-300">
                <span className="font-semibold">{session.game_name}</span>
                <span>
                  {new Date(session.start_time).toLocaleString()}{" "}
                  {session.end_time
                    ? "→ " + new Date(session.end_time).toLocaleString()
                    : ""}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Translations: {session.total_translations} • Languages:{" "}
                {Object.keys(session.languages_detected).length} • Teammates:{" "}
                {Array.from(session.teammates || []).join(", ") || "n/a"}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Recent translations:
                <ul className="list-disc list-inside space-y-1 mt-1">
                  {session.translations
                    .slice(-3)
                    .reverse()
                    .map((t, tIdx) => (
                      <li key={tIdx}>
                        <span className="text-gray-200">{t.original}</span> →{" "}
                        <span className="text-green-300">{t.translated}</span> (
                        {t.source_lang}→{t.target_lang})
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
