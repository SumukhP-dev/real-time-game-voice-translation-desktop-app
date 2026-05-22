import React, { useState, useEffect, useRef, useCallback } from "react";
import { useConfig } from "../hooks/useConfig";
import electronService, { type AudioDevice } from "../services/electron";
import {
  filterDevicesByCaptureSource,
  findPreferredCaptureDevice,
  findPreferredMicrophoneDevice,
} from "../utils/audioDevices";

const STEP_LOOPBACK_DEVICE = 1;
const STEP_MICROPHONE_DEVICE = 2;

interface SetupWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
  onStartCapture?: () => Promise<void>;
}

export function SetupWizard({
  onComplete,
  onClose,
  onStartCapture,
}: SetupWizardProps) {
  const { config, updateConfig } = useConfig();
  const [currentStep, setCurrentStep] = useState(0);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [startingCapture, setStartingCapture] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  const platform = electronService.getPlatform();
  const isWindows = platform === "win32";
  const autoSelectDone = useRef(false);

  const loopbackDevices = filterDevicesByCaptureSource(audioDevices, "loopback");
  const microphoneDevices = filterDevicesByCaptureSource(
    audioDevices,
    "microphone"
  );

  const loadAudioDevices = async () => {
    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const devices = await electronService.getAudioDevices();
      setAudioDevices(devices);

      if (!autoSelectDone.current && config) {
        autoSelectDone.current = true;
        const loopbackFiltered = filterDevicesByCaptureSource(devices, "loopback");
        const micFiltered = filterDevicesByCaptureSource(devices, "microphone");

        let deviceIndex = config.audio?.device_index ?? null;
        if (
          deviceIndex == null ||
          !loopbackFiltered.some((d) => d.index === deviceIndex)
        ) {
          deviceIndex =
            findPreferredCaptureDevice(loopbackFiltered)?.index ??
            loopbackFiltered[0]?.index ??
            null;
        }

        let micIndex = config.audio?.microphone_device_index ?? null;
        if (
          micIndex == null ||
          !micFiltered.some((d) => d.index === micIndex)
        ) {
          micIndex =
            findPreferredMicrophoneDevice(micFiltered)?.index ??
            micFiltered[0]?.index ??
            null;
        }

        if (deviceIndex !== config.audio?.device_index || micIndex !== config.audio?.microphone_device_index) {
          await updateConfig({
            ...config,
            audio: {
              ...config.audio,
              device_index: deviceIndex,
              microphone_device_index: micIndex,
            },
          });
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load audio devices";
      setDevicesError(msg);
      setAudioDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    if (isWindows) {
      loadAudioDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when wizard opens on Windows
  }, [isWindows]);

  const selectedLoopbackIndex = config?.audio?.device_index ?? null;
  const selectedMicIndex = config?.audio?.microphone_device_index ?? null;
  const loopbackSelected =
    selectedLoopbackIndex !== null &&
    loopbackDevices.some((d) => d.index === selectedLoopbackIndex);
  const micSelected =
    selectedMicIndex !== null &&
    microphoneDevices.some((d) => d.index === selectedMicIndex);
  const canAdvanceFromLoopback =
    !isWindows || (loopbackSelected && loopbackDevices.length > 0);
  const canAdvanceFromMicrophone =
    !isWindows || (micSelected && microphoneDevices.length > 0);

  const renderDeviceSelect = (
    label: string,
    devices: AudioDevice[],
    selectedIndex: number | null,
    isSelected: boolean,
    onSelect: (index: number) => void,
    tip?: React.ReactNode
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <select
        className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
        value={isSelected ? selectedIndex ?? "" : ""}
        onChange={(e) => {
          const deviceIndex = e.target.value
            ? parseInt(e.target.value, 10)
            : undefined;
          if (deviceIndex !== undefined) onSelect(deviceIndex);
        }}
      >
        <option value="">Select a device...</option>
        {devices.map((device) => (
          <option key={device.index} value={device.index}>
            {device.name}
            {device.is_loopback ? " [Loopback]" : ""} ({device.sample_rate}Hz,{" "}
            {device.channels}ch)
          </option>
        ))}
      </select>
      {tip}
    </div>
  );

  const markSetupComplete = useCallback(async () => {
    if (!config) return;
    await updateConfig({
      ...config,
      app: { ...config.app, setup_complete: true },
    });
  }, [config, updateConfig]);

  const handleFinish = async (startNow: boolean) => {
    await markSetupComplete();
    if (startNow && onStartCapture) {
      setStartingCapture(true);
      setCaptureError(null);
      try {
        await onStartCapture();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to start capture";
        setCaptureError(msg);
        setStartingCapture(false);
        return;
      }
      setStartingCapture(false);
    }
    onComplete?.();
  };

  const steps = [
    {
      title: "Welcome",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Welcome to SquadSpeak. This short setup configures your headphones,
            microphone, and translation language so subtitles work in your next match.
          </p>
          {!isWindows && (
            <div className="bg-red-900/50 border border-red-600 p-4 rounded-lg">
              <h3 className="font-semibold text-red-200 mb-2">
                Windows required
              </h3>
              <p className="text-sm text-red-100">
                SquadSpeak currently supports Windows 10/11 only (WASAPI loopback
                capture). macOS and Linux are on the roadmap. You can finish this
                wizard to explore settings, but capture will not work on this
                device yet.
              </p>
            </div>
          )}
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-white">What this app does:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>Captures in-game or system voice chat from your speakers/headset</li>
              <li>Transcribes speech locally with AI</li>
              <li>Translates to your preferred language</li>
              <li>Shows subtitles on your screen</li>
            </ul>
          </div>
          {isWindows && (
            <p className="text-sm text-gray-400">
              You will need headphones or speakers, a microphone, and a few
              minutes for the AI models to finish loading on first launch.
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Headphones / speakers",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Choose the headset or speakers you use while playing — the device that
            plays your game audio. We capture voice chat from that output (WASAPI
            loopback on Windows; no virtual cable required).
          </p>

          {devicesLoading && (
            <p className="text-gray-400 text-sm">Loading audio devices...</p>
          )}

          {devicesError && (
            <div className="space-y-2">
              <p className="text-sm text-red-300">{devicesError}</p>
              <button
                type="button"
                onClick={() => loadAudioDevices()}
                className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                Retry
              </button>
            </div>
          )}

          {!devicesLoading &&
            !devicesError &&
            loopbackDevices.length > 0 &&
            config &&
            renderDeviceSelect(
              "Game audio device (speakers / headphones):",
              loopbackDevices,
              selectedLoopbackIndex,
              loopbackSelected,
              (deviceIndex) => {
                updateConfig({
                  ...config,
                  audio: { ...config.audio, device_index: deviceIndex },
                });
              },
              loopbackSelected &&
                (() => {
                  const dev = loopbackDevices.find(
                    (d) => d.index === selectedLoopbackIndex
                  );
                  if (
                    dev &&
                    !dev.is_loopback &&
                    !dev.name.toLowerCase().includes("stereo mix")
                  ) {
                    return (
                      <p className="text-xs text-amber-400">
                        Tip: Pick your speakers or headphones (loopback), not a
                        microphone entry.
                      </p>
                    );
                  }
                  return null;
                })()
            )}

          {!devicesLoading &&
            !devicesError &&
            audioDevices.length > 0 &&
            loopbackDevices.length === 0 && (
              <p className="text-sm text-yellow-300">
                No loopback devices found. Click Retry after connecting headphones
                or speakers.
              </p>
            )}

          {!devicesLoading && !devicesError && audioDevices.length === 0 && (
            <p className="text-sm text-yellow-300">
              No capture devices found. Restart the app after the translation
              backend finishes loading, then click Retry.
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Microphone",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Choose the microphone you speak into. This is separate from your
            game audio device and is used when voice translation is enabled.
          </p>

          {devicesLoading && (
            <p className="text-gray-400 text-sm">Loading audio devices...</p>
          )}

          {devicesError && (
            <div className="space-y-2">
              <p className="text-sm text-red-300">{devicesError}</p>
              <button
                type="button"
                onClick={() => loadAudioDevices()}
                className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-md"
              >
                Retry
              </button>
            </div>
          )}

          {!devicesLoading &&
            !devicesError &&
            microphoneDevices.length > 0 &&
            config &&
            renderDeviceSelect(
              "Microphone device:",
              microphoneDevices,
              selectedMicIndex,
              micSelected,
              (deviceIndex) => {
                updateConfig({
                  ...config,
                  audio: {
                    ...config.audio,
                    microphone_device_index: deviceIndex,
                  },
                });
              }
            )}

          {!devicesLoading &&
            !devicesError &&
            audioDevices.length > 0 &&
            microphoneDevices.length === 0 && (
              <p className="text-sm text-yellow-300">
                No microphones found. Connect a mic and click Retry.
              </p>
            )}

          {!devicesLoading && !devicesError && audioDevices.length === 0 && (
            <p className="text-sm text-yellow-300">
              No capture devices found. Restart the app after the translation
              backend finishes loading, then click Retry.
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Translation Settings",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Choose your target language for translations.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Target Language:
            </label>
            <select
              className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
              value={config?.translation?.target_language ?? "en"}
              onChange={(e) => {
                if (!config) return;
                updateConfig({
                  ...config,
                  translation: {
                    ...config.translation,
                    target_language: e.target.value,
                  },
                });
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ru">Russian</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      title: "Complete",
      content: (
        <div className="space-y-4">
          <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-300 mb-2">
              Setup complete
            </h3>
            <p className="text-sm text-green-200">
              {isWindows
                ? "Start capture before you queue, then join a match with voice chat playing."
                : "Settings saved. Install on Windows 10/11 to use live capture."}
            </p>
            {isWindows && (
              <ol className="list-decimal list-inside space-y-1 text-sm text-green-200 mt-2">
                <li>Click &quot;Start capture now&quot; below (or use Audio Settings later)</li>
                <li>Launch your game and join a match</li>
                <li>Translations appear as subtitles when teammates speak</li>
              </ol>
            )}
          </div>
          {captureError && (
            <p className="text-sm text-red-300">{captureError}</p>
          )}
          <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>Tip:</strong> If subtitles do not appear within 30 seconds,
              confirm game audio is playing and you selected your headphones or
              speakers (not a mic-only device).
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === STEP_LOOPBACK_DEVICE && !canAdvanceFromLoopback) {
      return;
    }
    if (currentStep === STEP_MICROPHONE_DEVICE && !canAdvanceFromMicrophone) {
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await markSetupComplete();
    onClose?.();
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {steps[currentStep].title}
            </h2>
            <button
              type="button"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-200 text-2xl"
              aria-label="Close setup"
            >
              {"\u00D7"}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="mb-6">{steps[currentStep].content}</div>

          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              {!isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Skip
                </button>
              )}
              {isLastStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    disabled={startingCapture}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md disabled:opacity-50"
                  >
                    Done for now
                  </button>
                  {isWindows && onStartCapture && (
                    <button
                      type="button"
                      onClick={() => handleFinish(true)}
                      disabled={
                        startingCapture ||
                        selectedLoopbackIndex === null ||
                        selectedMicIndex === null
                      }
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                    >
                      {startingCapture ? "Starting..." : "Start capture now"}
                    </button>
                  )}
                  {(!isWindows || !onStartCapture) && (
                    <button
                      type="button"
                      onClick={() => handleFinish(false)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                      Complete
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (currentStep === STEP_LOOPBACK_DEVICE &&
                      !canAdvanceFromLoopback) ||
                    (currentStep === STEP_MICROPHONE_DEVICE &&
                      !canAdvanceFromMicrophone)
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
