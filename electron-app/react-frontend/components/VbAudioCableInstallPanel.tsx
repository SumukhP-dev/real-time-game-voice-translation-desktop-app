import React, { useCallback, useEffect, useState } from "react";
import electronService, {
  type PlaybackDevice,
  type VbAudioCableStatus,
} from "../services/electron";
import { hasVirtualCablePlaybackDevice } from "../utils/audioDevices";
import { useI18n } from "../hooks/useI18n";

const VB_CABLE_PAGE = "https://vb-audio.com/Cable/";

export interface VbAudioCableInstallPanelProps {
  playbackDevices: PlaybackDevice[];
  onDevicesRefresh?: () => void | Promise<void>;
  compact?: boolean;
}

export function VbAudioCableInstallPanel({
  playbackDevices,
  onDevicesRefresh,
  compact = false,
}: VbAudioCableInstallPanelProps) {
  const { t } = useI18n();
  const [driverStatus, setDriverStatus] = useState<VbAudioCableStatus | null>(
    null
  );
  const [installing, setInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const devicesReady = hasVirtualCablePlaybackDevice(playbackDevices);

  const loadDriverStatus = useCallback(async () => {
    try {
      const status = await electronService.getVbAudioCableStatus();
      setDriverStatus(status);
    } catch {
      setDriverStatus(null);
    }
  }, []);

  useEffect(() => {
    if (electronService.getPlatform() === "win32") {
      loadDriverStatus();
    }
  }, [loadDriverStatus]);

  if (electronService.getPlatform() !== "win32") {
    return null;
  }

  if (devicesReady) {
    return (
      <p
        className={
          compact
            ? "text-xs text-green-300"
            : "text-sm text-green-300 rounded-md border border-green-500/30 bg-green-500/10 p-3"
        }
      >
        {t("vb_audio.detected")}
      </p>
    );
  }

  const handleInstall = async () => {
    setInstalling(true);
    setError(null);
    setStatusMessage(t("vb_audio.installing"));
    try {
      const result = await electronService.installVbAudioCable();
      setStatusMessage(result.message);
      await loadDriverStatus();
      if (onDevicesRefresh) {
        await onDevicesRefresh();
      }
      if (!result.success && result.needsReboot) {
        setError(t("vb_audio.reboot_hint"));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatusMessage(null);
    } finally {
      setInstalling(false);
    }
  };

  const handleOpenDownloadPage = () => {
    electronService.openExternal(
      driverStatus?.downloadPageUrl || VB_CABLE_PAGE
    );
  };

  return (
    <div
      className={
        compact
          ? "space-y-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-3"
          : "space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4"
      }
    >
      <p className={compact ? "text-xs text-amber-100" : "text-sm text-amber-100"}>
        {t("vb_audio.missing")}
      </p>
      {driverStatus?.bundledOffline && (
        <p className="text-xs text-green-200">{t("vb_audio.bundled_offline")}</p>
      )}
      <ol
        className={`list-decimal list-inside space-y-1 text-amber-100/90 ${compact ? "text-xs" : "text-sm"}`}
      >
        <li>{t("vb_audio.step_install")}</li>
        <li>
          {t("vb_audio.step_discord_prefix")}{" "}
          <strong>CABLE Output</strong> {t("vb_audio.step_discord_suffix")}
        </li>
        <li>
          {t("vb_audio.step_app_prefix")} <strong>CABLE Input</strong>{" "}
          {t("vb_audio.step_app_suffix")}
        </li>
      </ol>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleInstall}
          disabled={installing}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md"
        >
          {installing ? t("vb_audio.installing_button") : t("vb_audio.install_button")}
        </button>
        <button
          type="button"
          onClick={handleOpenDownloadPage}
          disabled={installing}
          className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-white rounded-md"
        >
          {t("vb_audio.open_download_page")}
        </button>
        {onDevicesRefresh && (
          <button
            type="button"
            onClick={() => onDevicesRefresh()}
            disabled={installing}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-md"
          >
            {t("common.refresh")}
          </button>
        )}
      </div>

      {driverStatus?.installed && !devicesReady && (
        <p className="text-xs text-amber-200">{t("vb_audio.driver_installed_no_device")}</p>
      )}

      {statusMessage && (
        <p className="text-xs text-blue-200">{statusMessage}</p>
      )}
      {error && <p className="text-xs text-red-300">{error}</p>}

      <p className="text-xs text-amber-200/80">{t("vb_audio.uac_note")}</p>
      <p className="text-xs text-gray-400">{t("vb_audio.attribution")}</p>
    </div>
  );
}
