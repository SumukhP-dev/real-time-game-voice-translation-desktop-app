import { useState, useEffect, useCallback } from "react";
import * as tauri from "../services/tauri";

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
    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Audio devices loading timeout after 10 seconds")), 10000);
      });
      
      const deviceList = await Promise.race([
        tauri.listAudioDevices(),
        timeoutPromise
      ]) as AudioDevice[];
      
      setDevices(deviceList);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load audio devices";
      console.error("Audio devices loading error:", err);
      setError(errorMsg);
      // Set empty array to prevent infinite loading
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectDevice = useCallback(async (deviceIndex: number | null) => {
    try {
      setLoading(true);
      await tauri.setAudioDevice(deviceIndex);
      setSelectedDevice(deviceIndex);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set audio device"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const startCapture = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("[useAudio] Starting capture...");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Start capture timeout")), 5000);
      });

      await Promise.race([tauri.startAudioCapture(), timeoutPromise]).catch(
        (err) => {
          if (err.message === "Start capture timeout") {
            console.warn(
              "[useAudio] Start capture timed out, but continuing..."
            );
          } else {
            throw err;
          }
        }
      );

      // Wait a moment for capture to initialize (increased from 100ms to 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify it actually started (with timeout)
      try {
        const verifyPromise = tauri.isCapturing();
        const verifyTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Verify timeout")), 3000);
        });
        const isActuallyCapturing = (await Promise.race([
          verifyPromise,
          verifyTimeout,
        ])) as boolean;
        console.log(
          "[useAudio] Capture started, isCapturing:",
          isActuallyCapturing
        );
        setIsCapturing(isActuallyCapturing);

        if (!isActuallyCapturing) {
          // Retry check once more after a longer delay
          await new Promise((resolve) => setTimeout(resolve, 500));
          const retryCheck = await tauri.isCapturing().catch(() => false);
          if (retryCheck) {
            setIsCapturing(true);
            setError(null);
          } else {
            setError(
              "Capture started but immediately stopped - check audio device or try restarting capture"
            );
          }
        }
      } catch {
        // If verification times out, assume it started (user can check status)
        console.warn(
          "[useAudio] Could not verify capture status, assuming started"
        );
        setIsCapturing(true);
      }
    } catch (err) {
      console.error("[useAudio] Error starting capture:", err);
      setError(err instanceof Error ? err.message : "Failed to start capture");
      setIsCapturing(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const stopCapture = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[useAudio] Stopping audio capture...");

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Stop capture timeout")), 5000);
      });

      await Promise.race([tauri.stopAudioCapture(), timeoutPromise]).catch(
        (err) => {
          if (err.message === "Stop capture timeout") {
            console.warn(
              "[useAudio] Stop capture timed out, but continuing..."
            );
          } else {
            throw err;
          }
        }
      );

      // Wait a moment for capture to stop
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify it actually stopped (with timeout)
      try {
        const verifyPromise = tauri.isCapturing();
        const verifyTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Verify timeout")), 2000);
        });
        const stillCapturing = (await Promise.race([
          verifyPromise,
          verifyTimeout,
        ])) as boolean;
        console.log("[useAudio] Capture stopped, isCapturing:", stillCapturing);
        setIsCapturing(stillCapturing);
      } catch {
        // If verification times out, assume it stopped
        console.warn(
          "[useAudio] Could not verify capture status, assuming stopped"
        );
        setIsCapturing(false);
      }
      setError(null);
    } catch (err) {
      console.error("[useAudio] Error stopping capture:", err);
      setError(err instanceof Error ? err.message : "Failed to stop capture");
      // Still try to update state
      try {
        const stillCapturing = await tauri.isCapturing();
        setIsCapturing(stillCapturing);
      } catch {
        setIsCapturing(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Periodically check capture status to keep UI in sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const actualStatus = await tauri.isCapturing();
        if (actualStatus !== isCapturing) {
          console.log(
            `Capture status mismatch: UI=${isCapturing}, actual=${actualStatus}, updating...`
          );
          setIsCapturing(actualStatus);
        }
      } catch (err) {
        console.warn("Failed to check capture status:", err);
      }
    }, 1000); // Check every 1 second

    return () => clearInterval(interval);
  }, [isCapturing]);

  // Auto-select the best device when devices are loaded and no device is selected
  useEffect(() => {
    let hasAutoStarted = false; // Flag to prevent multiple auto-starts

    const autoSelectDevice = async () => {
      // Only auto-select if no device is currently selected
      if (selectedDevice !== null || devices.length === 0 || hasAutoStarted) {
        return;
      }

      try {
        // First, try to load from config
        const config = await tauri.getConfig();
        if (
          config.audio?.device_index !== null &&
          config.audio?.device_index !== undefined
        ) {
          const deviceExists = devices.some(
            (d) => d.index === config.audio.device_index
          );
          if (deviceExists) {
            console.log(
              `Loading device from config: index ${config.audio.device_index}`
            );
            await selectDevice(config.audio.device_index);
            hasAutoStarted = true;

            // Auto-start capture after loading from config
            setTimeout(async () => {
              try {
                const currentStatus = await tauri.isCapturing();
                if (!currentStatus) {
                  console.log("Auto-starting audio capture (from config)...");
                  await startCapture();
                }
              } catch (err) {
                console.warn("Failed to auto-start capture:", err);
              }
            }, 500);
            return;
          }
        }

        // Auto-select the best device if not in config
        // Priority: 1) CABLE Output (VB-Audio), 2) Stereo Mix, 3) First available
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
          console.log(
            `Auto-selecting audio device: ${deviceToSelect.name} (index ${deviceToSelect.index})`
          );
          await selectDevice(deviceToSelect.index);
          hasAutoStarted = true;

          // Save to config
          const updatedConfig = await tauri.getConfig();
          await tauri.setConfig({
            ...updatedConfig,
            audio: {
              ...updatedConfig.audio,
              device_index: deviceToSelect.index,
            },
          });
          await tauri.saveConfig();

          // Auto-start capture after selecting device
          // Wait a moment for device to be ready
          setTimeout(async () => {
            try {
              const currentStatus = await tauri.isCapturing();
              if (!currentStatus) {
                console.log("Auto-starting audio capture...");
                await startCapture();
              }
            } catch (err) {
              console.warn("Failed to auto-start capture:", err);
            }
          }, 500);
        }
      } catch (err) {
        console.warn("Failed to auto-select device:", err);
      }
    };

    autoSelectDevice();
  }, [devices, selectedDevice, selectDevice]); // Removed isCapturing and startCapture from deps to prevent loops

  return {
    devices,
    selectedDevice,
    isCapturing,
    loading,
    error,
    loadDevices,
    selectDevice,
    startCapture,
    stopCapture,
  };
}
