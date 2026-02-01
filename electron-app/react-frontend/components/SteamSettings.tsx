import React, { useState } from "react";
import { useSteam } from "../hooks/useSteam";

export function SteamSettings() {
  const { config, friends, loading, error, updateFriendLanguage, refresh } =
    useSteam();
  const [friendName, setFriendName] = useState("");
  const [friendLang, setFriendLang] = useState("");

  const handleSetLang = async () => {
    if (!friendName || !friendLang) return;
    await updateFriendLanguage(friendName, friendLang);
    setFriendName("");
    setFriendLang("");
  };

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Steam Integration</h3>
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          onClick={refresh}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className="text-sm text-gray-300">
        Detected: {config.detected ? "Yes" : "No"}{" "}
        {config.install_path ? `(${config.install_path})` : ""}
      </div>

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <input
            className="bg-gray-900 p-2 rounded border border-gray-700"
            placeholder="Friend name"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
          />
          <input
            className="bg-gray-900 p-2 rounded border border-gray-700"
            placeholder="Language (e.g., en)"
            value={friendLang}
            onChange={(e) => setFriendLang(e.target.value)}
          />
        </div>
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          onClick={handleSetLang}
          disabled={loading}
        >
          Set Preference
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-200 bg-red-900 p-2 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="text-gray-300 font-semibold">Friends</div>
        {friends.length === 0 && (
          <div className="text-gray-500">No friends loaded.</div>
        )}
        <ul className="space-y-1">
          {friends.map((f) => (
            <li key={f.name} className="bg-gray-900 p-2 rounded">
              <div className="text-gray-200">{f.name}</div>
              <div className="text-gray-400 text-xs">
                Language: {f.language_preference || "n/a"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
