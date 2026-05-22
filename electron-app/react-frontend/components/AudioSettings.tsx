import React, { useMemo } from "react";
import { AudioDevice, AudioErrorSource } from "../hooks/useAudio";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import {
  filterDevicesByCaptureSource,
  isGameAudioDeviceSuitable,
} from "../utils/audioDevices";
export interface AudioSettingsProps {
  devices: AudioDevice[];
  selectedDevice: number | null;
  isCapturing: boolean;
  loading: boolean;
  error: string | null;
  errorSource?: AudioErrorSource;
  selectDevice: (deviceIndex: number) => void | Promise<void>;
  loadDevices?: () => void;
  startCapture: (deviceIndex?: number) => Promise<void> | void;
  stopCapture: () => Promise<void> | void;
}

export function AudioSettings({
  devices,
  selectedDevice,
  isCapturing,
  loading,
  error,
  errorSource,
  selectDevice,
  loadDevices,
  startCapture,
  stopCapture,
}: AudioSettingsProps) {
  const { t } = useI18n();
  const gameAudioDevices = useMemo(
    () => filterDevicesByCaptureSource(devices, "loopback"),
    [devices]
  );
  const selectedDev =
    selectedDevice !== null
      ? devices.find((d) => d.index === selectedDevice)
      : undefined;
  const showLoopbackWarning =
    selectedDev !== undefined && !isGameAudioDeviceSuitable(selectedDev);

  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        {t(I18N_KEYS.AUDIO_SETTINGS)}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg space-y-2">
          <p>{error}</p>
          {errorSource === "devices" && loadDevices && (
            <button
              type="button"
              onClick={() => loadDevices()}
              disabled={loading}
              className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Retry loading devices
            </button>
          )}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-300">
            {t(I18N_KEYS.AUDIO_DEVICE)}
            {selectedDevice !== null && devices.length > 1 && (
              <span className="ml-2 text-xs text-gray-400">
                {t(I18N_KEYS.AUDIO_DEVICE_AUTO_SELECTED)}
              </span>
            )}
          </label>
          {loadDevices && (
            <button
              type="button"
              onClick={() => loadDevices()}
              disabled={loading || isCapturing}
              className="text-xs px-2 py-1 text-blue-300 hover:text-blue-200 disabled:opacity-50"
            >
              Refresh list
            </button>
          )}
        </div>
        <select
          value={selectedDevice ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              return;
            }
            selectDevice(parseInt(value, 10));
          }}
          disabled={devices.length === 0}
          className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {devices.length === 0 && (
            <option value="">No devices — click Refresh list</option>
          )}
          {gameAudioDevices.map((device) => (
            <option key={device.index} value={device.index}>
              {device.name}
              {device.is_loopback ? " [Loopback]" : ""} ({device.sample_rate}Hz,{" "}
              {device.channels}ch)
            </option>
          ))}
        </select>
        {showLoopbackWarning && (
          <p className="mt-2 text-xs text-amber-400">
            This device may not capture game audio. Pick one labeled{" "}
            <strong>[Loopback]</strong> (2 channels) — usually your headphones or
            speakers, not a 1-channel headset profile.
          </p>
        )}
        {devices.length === 1 && !isCapturing && (
          <p className="mt-2 text-xs text-gray-400">
            Only one capture device was detected. Use Refresh list after plugging
            in other headphones or speakers.
          </p>
        )}
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
          onClick={async () => {
            try {
              await startCapture(selectedDevice || undefined);
            } catch (err) {
              console.error("Error starting capture:", err);
            }
          }}
          disabled={
            isCapturing || loading || selectedDevice === null || devices.length === 0
          }
          title={
            selectedDevice === null
              ? "Select your game audio device (speakers or headphones) first"
              : undefined
          }
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
          disabled={!isCapturing || loading}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading && isCapturing ? "Stopping..." : t(I18N_KEYS.AUDIO_STOP_CAPTURE)}
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
