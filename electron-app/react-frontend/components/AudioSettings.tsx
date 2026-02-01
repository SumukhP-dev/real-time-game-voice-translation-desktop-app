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
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">{t(I18N_KEYS.AUDIO_SETTINGS)}</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
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
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
        >
          {devices.map((device) => (
            <option key={device.index} value={device.index}>
              {device.name} ({device.sample_rate}Hz, {device.channels}ch)
            </option>
          ))}
        </select>
        {selectedDevice !== null && (
          <p className="mt-1 text-xs text-gray-400">
            {t(I18N_KEYS.AUDIO_CURRENTLY_USING)}:{" "}
            {devices.length > 0 
              ? (devices.find((d) => d.index === selectedDevice)?.name || `Device ${selectedDevice}`)
              : "Loading devices..."}
          </p>
        )}
        {selectedDevice === null && devices.length > 0 && (
          <p className="mt-1 text-xs text-yellow-400">
            No device selected. Auto-selecting best device...
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={startCapture}
          disabled={isCapturing || loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
