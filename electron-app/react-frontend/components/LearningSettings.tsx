import React, { useState } from "react";
import { learnPreference, getPreference } from "../services/tauri";

export function LearningSettings() {
  const [context, setContext] = useState("");
  const [translation, setTranslation] = useState("");
  const [lastPreferred, setLastPreferred] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!context || !translation) return;
    setLoading(true);
    setError(null);
    try {
      await learnPreference({ context, translation });
      const pref = await getPreference(context);
      setLastPreferred(pref);
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to save preference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <h3 className="text-lg font-semibold">Adaptive Learning</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <input
          className="bg-gray-900 p-2 rounded border border-gray-700"
          placeholder="Context (e.g., callout phrase)"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <input
          className="bg-gray-900 p-2 rounded border border-gray-700"
          placeholder="Preferred translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
        />
      </div>
      {error && (
        <div className="text-sm text-red-200 bg-red-900 p-2 rounded">
          {error}
        </div>
      )}
      <button
        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Preference"}
      </button>
      {lastPreferred && (
        <div className="text-xs text-gray-400">
          Latest saved preference for this context: {lastPreferred}
        </div>
      )}
    </div>
  );
}
