import React, { useState } from "react";
import { OBSConfig } from "../services/tauri";
import { useOBS } from "../hooks/useOBS";

export function OBSSettings() {
  const { config, setConfig, loading, error, connect, disconnect } = useOBS();
  const [localConfig, setLocalConfig] = useState<OBSConfig>(config);

  const handleConnect = async () => {
    await connect(localConfig);
  };

  return (
    <div className="p-4 bg-gray-800 rounded space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">OBS Integration</h3>
        <span className="text-sm text-gray-400">
          {config.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="col-span-2">
          <label className="block text-gray-300 mb-1">Host</label>
          <input
            className="w-full bg-gray-900 p-2 rounded border border-gray-700"
            value={localConfig.host}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, host: e.target.value })
            }
            placeholder="localhost"
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Port</label>
          <input
            className="w-full bg-gray-900 p-2 rounded border border-gray-700"
            type="number"
            value={localConfig.port}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, port: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            className="w-full bg-gray-900 p-2 rounded border border-gray-700"
            type="password"
            value={localConfig.password || ""}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, password: e.target.value })
            }
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-200 bg-red-900 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? "Connecting..." : "Connect"}
        </button>
        <button
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
          onClick={disconnect}
          disabled={loading}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
