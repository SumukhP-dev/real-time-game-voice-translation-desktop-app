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
export type AudioSelectionOrigin = "auto" | "saved" | "manual" | null;

export function useAudio(configDeviceIndex?: number | null) {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSource, setErrorSource] = useState<AudioErrorSource>(null);
  const [selectionOrigin, setSelectionOrigin] =
    useState<AudioSelectionOrigin>(null);

  const loadDevices = useCallback(async () => {
    setDevicesLoading(true);
    setError(null);
    setErrorSource(null);
    try {
      const audioDevices = await electronService.getAudioDevices();
      setDevices(audioDevices);

      const currentDevice =
        selectedDevice !== null
          ? audioDevices.find((d) => d.index === selectedDevice)
          : undefined;
      if (currentDevice && isGameAudioDeviceSuitable(currentDevice)) {
        setSelectedDevice(currentDevice.index);
      } else {
        const savedDev =
          configDeviceIndex != null
            ? audioDevices.find((d) => d.index === configDeviceIndex)
            : undefined;

        if (savedDev && isGameAudioDeviceSuitable(savedDev)) {
          setSelectedDevice(savedDev.index);
          setSelectionOrigin("saved");
        } else {
          const preferred = findPreferredCaptureDevice(audioDevices);
          setSelectedDevice(preferred?.index ?? null);
          setSelectionOrigin(preferred ? "auto" : null);
        }
      }
    } catch (err: unknown) {
      setDevices([]);
      setErrorSource("devices");
      setError(
        err instanceof Error ? err.message : "Failed to load audio devices"
      );
    } finally {
      setDevicesLoading(false);
    }
  }, [configDeviceIndex, selectedDevice]);

  const startCapture = useCallback(async (deviceIndex?: number) => {
    setCaptureLoading(true);
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
      setCaptureLoading(false);
    }
  }, [selectedDevice]);

  const stopCapture = useCallback(async () => {
    if (!isCapturing) {
      return;
    }
    setCaptureLoading(true);
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
      setCaptureLoading(false);
    }
  }, [isCapturing]);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    selectedDevice,
    isCapturing,
    devicesLoading,
    captureLoading,
    error,
    errorSource,
    selectionOrigin,
    loadDevices,
    startCapture,
    stopCapture,
    setSelectedDevice,
    selectDevice: (deviceIndex: number) => {
      setSelectedDevice(deviceIndex);
      setSelectionOrigin("manual");
    },
  };
}
