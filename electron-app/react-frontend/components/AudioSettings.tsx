import React from "react";
import { useAudio } from "../hooks/useAudio";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";

export function AudioSettings() {
  const {
    devices,
    selectedDevice,
    isCapturing,
    loading,
    error,
    selectDevice,
    startCapture,
    stopCapture,
  } = useAudio();
  const { t } = useI18n();

  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        {t(I18N_KEYS.AUDIO_SETTINGS)}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          {t(I18N_KEYS.AUDIO_DEVICE)}
          {selectedDevice !== null && (
            <span className="ml-2 text-xs text-gray-400">{t(I18N_KEYS.AUDIO_DEVICE_AUTO_SELECTED)}</span>
          )}
        </label>
        <select
          value={selectedDevice ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              // Don't allow deselecting - auto-select the best device instead
              const cableDevice = devices.find(
                (d) =>
                  d.name.toLowerCase().includes("cable") ||
                  d.name.toLowerCase().includes("vb-audio")
              );
              const stereoMix = devices.find((d) =>
                d.name.toLowerCase().includes("stereo mix")
              );
              const deviceToSelect = cableDevice || stereoMix || devices[0];
              if (deviceToSelect) {
                selectDevice(deviceToSelect.index);
              }
            } else {
              selectDevice(parseInt(value));
            }
          }}
          disabled={isCapturing || loading}
          className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          {devices.map((device) => (
            <option key={device.index} value={device.index}>
              {device.name} ({device.sample_rate}Hz, {device.channels}ch)
            </option>
          ))}
        </select>
        {selectedDevice !== null && (
          <p className="mt-2 text-xs text-gray-400">
            {t(I18N_KEYS.AUDIO_CURRENTLY_USING)}:{" "}
            {devices.length > 0 
              ? (devices.find((d) => d.index === selectedDevice)?.name || `Device ${selectedDevice}`)
              : "Loading devices..."}
          </p>
        )}
        {selectedDevice === null && devices.length > 0 && (
          <p className="mt-2 text-xs text-yellow-400">
            No device selected. Auto-selecting best device...
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => startCapture(selectedDevice || undefined)}
          disabled={isCapturing || loading}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? "Starting..." : t(I18N_KEYS.AUDIO_START_CAPTURE)}
        </button>
        <button
          onClick={async () => {
            try {
              await stopCapture();
            } catch (err) {
              console.error("Error stopping capture:", err);
            }
          }}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? "Stopping..." : t(I18N_KEYS.AUDIO_STOP_CAPTURE)}
        </button>
      </div>

      {isCapturing && (
        <div className="mt-4 p-2 bg-green-900 text-green-200 rounded">
          {t(I18N_KEYS.AUDIO_CAPTURING)}
        </div>
      )}
    </div>
  );
}
