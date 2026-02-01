import React, { useState, useEffect } from "react";
import { useConfig } from "../hooks/useConfig";
import * as tauri from "../services/tauri";
import { AudioSetupWizard } from "./AudioSetupWizard";

interface SetupWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export function SetupWizard({ onComplete, onClose }: SetupWizardProps) {
  const { config, updateConfig } = useConfig();
  const [currentStep, setCurrentStep] = useState(0);
  const [audioDevices, setAudioDevices] = useState<any[]>([]);
  const [showAudioSetupWizard, setShowAudioSetupWizard] = useState(false);

  useEffect(() => {
    // Load audio devices
    tauri
      .listAudioDevices()
      .then((devices) => setAudioDevices(devices))
      .catch((err) => console.error("Failed to load audio devices:", err));
  }, []);

  const steps = [
    {
      title: "Welcome!",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Welcome to CS:GO 2 Live Voice Translation! This quick setup will
            help you get started.
          </p>
          <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-white">
              What this app does:
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
              <li>Captures voice chat from your game</li>
              <li>Transcribes speech using AI</li>
              <li>Translates to your preferred language</li>
              <li>Shows subtitles on your screen</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: "Audio Setup",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Select your audio input device. For game audio, use VB-Audio Virtual
            Cable or Stereo Mix.
          </p>

          {/* Quick Audio Setup Card */}
          <div className="p-3 bg-blue-900 bg-opacity-50 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  Quick Audio Setup
                </h3>
                <p className="text-xs text-gray-300">
                  Automatically configure VB-Audio Virtual Cable for game audio capture
                </p>
              </div>
              <button
                onClick={() => setShowAudioSetupWizard(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium whitespace-nowrap"
              >
                Auto-Setup Audio
              </button>
            </div>
          </div>

          {audioDevices.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Audio Input Device:
              </label>
              <select
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                value={config?.audio?.device_index ?? ""}
                onChange={(e) => {
                  const deviceIndex = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  updateConfig({
                    ...config!,
                    audio: { ...config!.audio, device_index: deviceIndex },
                  });
                  if (deviceIndex !== undefined) {
                    tauri.setAudioDevice(deviceIndex).catch(console.error);
                  }
                }}
              >
                <option value="">Select a device...</option>
                {audioDevices.map((device, idx) => (
                  <option key={idx} value={device.index}>
                    {device.name} ({device.sample_rate}Hz, {device.channels}ch)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Loading audio devices...</p>
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
                updateConfig({
                  ...config!,
                  translation: {
                    ...config!.translation,
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
      title: "Complete!",
      content: (
        <div className="space-y-4">
          <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-300 mb-2">
              Setup Complete! 🎉
            </h3>
            <p className="text-sm text-green-200">
              You're all set! Here's how to use the app:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-green-200 mt-2">
              <li>Click "Start Capture" to begin listening</li>
              <li>Launch your game and join a match</li>
              <li>Translations will appear as subtitles on your screen</li>
            </ol>
          </div>
          <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-200">
              <strong>Tip:</strong> Make sure game audio is playing and the
              overlay is enabled in Translation Settings.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark setup as complete
      updateConfig({
        ...config!,
        app: { ...config!.app, setup_complete: true },
      });
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    updateConfig({
      ...config!,
      app: { ...config!.app, setup_complete: true },
    });
    onClose?.();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {steps[currentStep].title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress indicator */}
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

          {/* Content */}
          <div className="mb-6 min-h-[200px]">{steps[currentStep].content}</div>

          {/* Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-md hover:bg-gray-600"
                >
                  ← Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Skip Setup
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Setup Wizard Modal */}
      {showAudioSetupWizard && (
        <AudioSetupWizard
          onComplete={() => {
            setShowAudioSetupWizard(false);
            // Refresh audio devices after setup
            tauri
              .listAudioDevices()
              .then((devices) => setAudioDevices(devices))
              .catch((err) => console.error("Failed to load audio devices:", err));
          }}
          onClose={() => setShowAudioSetupWizard(false)}
        />
      )}
    </div>
  );
}
