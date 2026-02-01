import React, { useState, useEffect } from "react";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import * as tauri from "../services/tauri";

interface AudioSetupWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export function AudioSetupWizard({ onComplete, onClose }: AudioSetupWizardProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [vbAudioInstalled, setVbAudioInstalled] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configurationStatus, setConfigurationStatus] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkVbAudioStatus();
  }, []);

  const checkVbAudioStatus = async () => {
    setIsChecking(true);
    setError(null);
    try {
      // Check if VB-Audio is installed by looking for CABLE devices
      const devices = await tauri.listAudioDevices();
      const hasCable = devices.some(
        (d: any) =>
          d.name.toLowerCase().includes("cable") ||
          d.name.toLowerCase().includes("vb-audio")
      );
      setVbAudioInstalled(hasCable);
    } catch (err) {
      console.error("Failed to check VB-Audio status:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsChecking(false);
    }
  };

  const handleAutoConfigure = async () => {
    setIsConfiguring(true);
    setError(null);
    setConfigurationStatus("Configuring audio routing...");

    try {
      // Try to configure audio routing automatically
      // This will be implemented in the Rust backend
      const result = await tauri.configureAudioRouting();
      setConfigurationStatus("Audio routing configured successfully!");
      
      // Verify the setup
      setTimeout(async () => {
        try {
          const verified = await tauri.verifyAudioSetup();
          if (verified) {
            setConfigurationStatus("Setup verified! Audio routing is working.");
            setTimeout(() => {
              onComplete?.();
            }, 2000);
          } else {
            setError("Setup completed but verification failed. Please check manually.");
          }
        } catch (err) {
          setError("Verification failed. Please check your audio settings manually.");
        } finally {
          setIsConfiguring(false);
        }
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to configure audio routing");
      setIsConfiguring(false);
    }
  };

  const steps = [
    {
      title: "Audio Setup Wizard",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            This wizard will help you set up audio routing for game voice capture.
            We'll check if VB-Audio Virtual Cable is installed and configure it automatically.
          </p>
          {isChecking ? (
            <div className="flex items-center space-x-2 text-blue-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span>Checking for VB-Audio Virtual Cable...</span>
            </div>
          ) : vbAudioInstalled === false ? (
            <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-yellow-200">
                VB-Audio Virtual Cable Not Found
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                VB-Audio Virtual Cable is required for capturing game audio. You need to install it first.
              </p>
              <div className="space-y-2">
                <a
                  href="https://vb-audio.com/Cable/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Download VB-Audio Virtual Cable
                </a>
                <p className="text-xs text-gray-400">
                  After installing, restart your computer and run this wizard again.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-green-200">
                ✓ VB-Audio Virtual Cable Detected
              </h3>
              <p className="text-sm text-gray-300">
                VB-Audio is installed. Click "Auto-Configure" to set up audio routing automatically.
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Auto-Configure Audio",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            We'll automatically configure Windows audio settings to route game audio through VB-Audio Virtual Cable.
          </p>
          {error && (
            <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          {configurationStatus && (
            <div className="bg-blue-900 bg-opacity-50 p-4 rounded-lg">
              <p className="text-blue-200 text-sm">{configurationStatus}</p>
            </div>
          )}
          <div className="space-y-2">
            <button
              onClick={handleAutoConfigure}
              disabled={isConfiguring || vbAudioInstalled === false}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-medium"
            >
              {isConfiguring ? "Configuring..." : "Auto-Configure Audio"}
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              Manual Setup Guide
            </button>
          </div>
        </div>
      ),
    },
    {
      title: "Manual Setup Guide",
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            If automatic configuration didn't work, follow these steps manually:
          </p>
          <div className="bg-gray-900 p-4 rounded-lg space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-1">Step 1: Set Default Playback Device</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                <li>Right-click the speaker icon in Windows system tray</li>
                <li>Select "Sounds" or "Sound settings"</li>
                <li>Go to "Playback" tab</li>
                <li>Find "CABLE Input (VB-Audio Virtual Cable)"</li>
                <li>Right-click → "Set as Default Device"</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Step 2: Enable Listen to This Device</h4>
              <ol className="list-decimal list-inside space-y-1 text-gray-300 ml-2">
                <li>In the same window, go to "Recording" tab</li>
                <li>Find "CABLE Output (VB-Audio Virtual Cable)"</li>
                <li>Right-click → "Properties"</li>
                <li>Go to "Listen" tab</li>
                <li>Check "Listen to this device"</li>
                <li>Select your headphones in the dropdown</li>
                <li>Click "Apply" and "OK"</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Step 3: Test</h4>
              <p className="text-gray-300 ml-2">
                Play a YouTube video or start your game. You should hear audio through your headphones.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
            >
              Back to Auto-Configure
            </button>
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              I've Completed Setup
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            {steps[currentStep].title}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mb-6">
          {steps[currentStep].content}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < steps.length - 1 && currentStep !== 1 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                Next
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx === currentStep
                    ? "bg-blue-500"
                    : idx < currentStep
                    ? "bg-green-500"
                    : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

