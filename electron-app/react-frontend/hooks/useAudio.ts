import { useState, useEffect, useCallback } from "react";
import electronService from "../services/electron";
import { findPreferredCaptureDevice } from "../utils/audioDevices";

export interface AudioDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
  is_input: boolean;
  is_loopback?: boolean;
}

export function useAudio() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const audioDevices = await electronService.getAudioDevices();
      setDevices(audioDevices);
      
      // Auto-select the best device if none is selected
      if (selectedDevice === null && audioDevices.length > 0) {
        const deviceToSelect = findPreferredCaptureDevice(audioDevices);
        if (deviceToSelect) {
          setSelectedDevice(deviceToSelect.index);
        }
      }
    } catch (err: any) {
      setError(err?.toString?.() || "Failed to load audio devices");
      // Fallback to mock devices if ML service fails (e.g. not started yet)
      const mockDevices: AudioDevice[] = [
        {
          index: 0,
          name: "Default Output",
          channels: 2,
          sample_rate: 48000,
          is_input: true,
          is_loopback: true,
        },
        {
          index: 1,
          name: "Microphone",
          channels: 1,
          sample_rate: 48000,
          is_input: true,
        },
      ];
      setDevices(mockDevices);
      if (mockDevices.length > 0) {
        const preferred = findPreferredCaptureDevice(mockDevices) ?? mockDevices[0];
        setSelectedDevice(preferred.index);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDevice]);

  const startCapture = useCallback(async (deviceIndex?: number) => {
    setLoading(true);
    setError(null);
    try {
      const deviceToUse = deviceIndex || selectedDevice;
      if (deviceToUse === null) {
        throw new Error("No audio device selected");
      }
      
      console.log('Starting audio capture for device:', deviceToUse);
      await electronService.startAudioCapture(deviceToUse);
      setSelectedDevice(deviceToUse);
      setIsCapturing(true);
    } catch (err: any) {
      const errorMsg = err?.toString?.() || "Failed to start audio capture";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedDevice]);

  const stopCapture = useCallback(async () => {
    setError(null);
    setIsCapturing(false);
    try {
      console.log('Stopping audio capture');
      await electronService.stopAudioCapture();
    } catch (err: any) {
      const errorMsg = err?.toString?.() || "Failed to stop audio capture";
      setError(errorMsg);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    selectedDevice,
    isCapturing,
    loading,
    error,
    loadDevices,
    startCapture,
    stopCapture,
    setSelectedDevice,
    selectDevice: (deviceIndex: number) => setSelectedDevice(deviceIndex)
  };
}
