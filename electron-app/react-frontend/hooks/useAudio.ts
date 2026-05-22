import { useState, useEffect, useCallback } from "react";
import electronService from "../services/electron";
import {
  findPreferredCaptureDevice,
  isGameAudioDeviceSuitable,
} from "../utils/audioDevices";

export interface AudioDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
  is_input: boolean;
  is_loopback?: boolean;
}

export type AudioErrorSource = "devices" | "start" | "stop" | null;

export function useAudio(configDeviceIndex?: number | null) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSource, setErrorSource] = useState<AudioErrorSource>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorSource(null);
    try {
      const audioDevices = await electronService.getAudioDevices();
      setDevices(audioDevices);

      setSelectedDevice((prev) => {
        const prevDev =
          prev !== null ? audioDevices.find((d) => d.index === prev) : undefined;
        if (prevDev && isGameAudioDeviceSuitable(prevDev)) {
          return prev;
        }
        const savedDev =
          configDeviceIndex != null
            ? audioDevices.find((d) => d.index === configDeviceIndex)
            : undefined;
        if (savedDev && isGameAudioDeviceSuitable(savedDev)) {
          return configDeviceIndex;
        }
        const preferred = findPreferredCaptureDevice(audioDevices);
        return preferred?.index ?? prev ?? configDeviceIndex ?? null;
      });
    } catch (err: unknown) {
      setDevices([]);
      setErrorSource("devices");
      setError(
        err instanceof Error ? err.message : "Failed to load audio devices"
      );
    } finally {
      setLoading(false);
    }
  }, [configDeviceIndex]);

  const startCapture = useCallback(async (deviceIndex?: number) => {
    setLoading(true);
    setError(null);
    setErrorSource(null);
    try {
      const deviceToUse = deviceIndex || selectedDevice;
      if (deviceToUse === null) {
        throw new Error("No audio device selected");
      }
      
      console.log('Starting audio capture for device:', deviceToUse);
      await electronService.startAudioCapture(deviceToUse);
      setSelectedDevice(deviceToUse);
      setIsCapturing(true);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to start audio capture";
      setErrorSource("start");
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedDevice]);

  const stopCapture = useCallback(async () => {
    if (!isCapturing) {
      return;
    }
    setLoading(true);
    setError(null);
    setErrorSource(null);
    try {
      console.log("Stopping audio capture");
      await electronService.stopAudioCapture();
      setIsCapturing(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to stop audio capture";
      setErrorSource("stop");
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isCapturing]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    selectedDevice,
    isCapturing,
    loading,
    error,
    errorSource,
    loadDevices,
    startCapture,
    stopCapture,
    setSelectedDevice,
    selectDevice: (deviceIndex: number) => setSelectedDevice(deviceIndex),
  };
}
