import React, { useState } from "react";
import { DiscordConfig } from "../services/tauri";
import { useDiscord } from "../hooks/useDiscord";

export function DiscordSettings() {
  const { config, setConfig, loading, error, save } = useDiscord();
  const [localConfig, setLocalConfig] = useState<DiscordConfig>(config);

  const handleSave = async () => {
    await save(localConfig);
  };

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Discord Integration</h3>
        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={localConfig.enabled}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, enabled: e.target.checked })
            }
          />
          <span>Enabled</span>
        </label>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <label className="block text-gray-300 mb-1">Application ID</label>
          <input
            className="w-full bg-gray-900 p-2 rounded border border-gray-700"
            value={localConfig.application_id || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, application_id: e.target.value })
            }
            placeholder="Discord application ID"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Status</label>
          <input
            className="w-full bg-gray-900 p-2 rounded border border-gray-700"
            value={localConfig.status || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, status: e.target.value })
            }
            placeholder="e.g., Translating live"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-300 mb-1">Game</label>
            <input
              className="w-full bg-gray-900 p-2 rounded border border-gray-700"
              value={localConfig.game || ""}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, game: e.target.value })
              }
              placeholder="CS:GO 2"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Language</label>
            <input
              className="w-full bg-gray-900 p-2 rounded border border-gray-700"
              value={localConfig.language || ""}
              onChange={(e) =>
                setLocalConfig({ ...localConfig, language: e.target.value })
              }
              placeholder="en"
            />
          </div>
        </div>
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
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
