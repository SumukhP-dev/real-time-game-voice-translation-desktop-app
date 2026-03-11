import { useState, useEffect, useCallback } from "react";
import electronService from "../services/electron";

export interface AudioDevice {
  index: number;
  name: string;
  channels: number;
  sample_rate: number;
  is_input: boolean;
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
        const cableDevice = audioDevices.find(
          (d) =>
            d.name.toLowerCase().includes("cable") ||
            d.name.toLowerCase().includes("vb-audio")
        );
        const stereoMix = audioDevices.find((d) =>
          d.name.toLowerCase().includes("stereo mix")
        );
        const deviceToSelect = cableDevice || stereoMix || audioDevices[0];
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
          name: "Default Audio Device",
          channels: 2,
          sample_rate: 44100,
          is_input: true
        },
        {
          index: 1,
          name: "CABLE Input (VB-Audio Virtual Cable)",
          channels: 2,
          sample_rate: 48000,
          is_input: true
        },
        {
          index: 2,
          name: "Microphone",
          channels: 1,
          sample_rate: 48000,
          is_input: true
        }
      ];
      setDevices(mockDevices);
      // Auto-select first device so Start Capture works even when ML service was unavailable
      if (mockDevices.length > 0) {
        const preferred = mockDevices.find(
          (d) =>
            d.name.toLowerCase().includes("cable") ||
            d.name.toLowerCase().includes("vb-audio")
        ) || mockDevices[0];
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
    setLoading(true);
    setError(null);
    try {
      console.log('Stopping audio capture');
      await electronService.stopAudioCapture();
      setIsCapturing(false);
    } catch (err: any) {
      const errorMsg = err?.toString?.() || "Failed to stop audio capture";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
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
