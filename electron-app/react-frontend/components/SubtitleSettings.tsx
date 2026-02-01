import React from "react";
import { useConfig } from "../hooks/useConfig";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import * as tauri from "../services/tauri";

const STYLE_PRESETS = [
  { value: "minimal", labelKey: I18N_KEYS.SUBTITLE_STYLE_MINIMAL },
  { value: "bold", labelKey: I18N_KEYS.SUBTITLE_STYLE_BOLD },
  { value: "outline", labelKey: I18N_KEYS.SUBTITLE_STYLE_OUTLINE },
  { value: "shadow", labelKey: I18N_KEYS.SUBTITLE_STYLE_SHADOW },
  { value: "gaming", labelKey: I18N_KEYS.SUBTITLE_STYLE_GAMING },
  { value: "classic", labelKey: I18N_KEYS.SUBTITLE_STYLE_CLASSIC },
];

const POSITION_PRESETS = [
  { value: "top", labelKey: I18N_KEYS.SUBTITLE_POSITION_TOP },
  { value: "bottom", labelKey: I18N_KEYS.SUBTITLE_POSITION_BOTTOM },
  { value: "center", labelKey: I18N_KEYS.SUBTITLE_POSITION_CENTER },
  { value: "top-left", labelKey: I18N_KEYS.SUBTITLE_POSITION_TOP_LEFT },
  { value: "top-right", labelKey: I18N_KEYS.SUBTITLE_POSITION_TOP_RIGHT },
  { value: "bottom-left", labelKey: I18N_KEYS.SUBTITLE_POSITION_BOTTOM_LEFT },
  { value: "bottom-right", labelKey: I18N_KEYS.SUBTITLE_POSITION_BOTTOM_RIGHT },
];

export function SubtitleSettings() {
  const { config, updateConfig } = useConfig();
  const { t } = useI18n();

  const handleSizeChange = async (size: number) => {
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        overlay: {
          ...config.overlay,
          font_size: size,
        },
      };
      await updateConfig(newConfig);
      await tauri.updateOverlayConfig(newConfig.overlay);
    } catch (error) {
      console.error("Failed to update subtitle size:", error);
    }
  };

  const handleStyleChange = async (style: string) => {
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        overlay: {
          ...config.overlay,
          style_preset: style,
        },
      };
      await updateConfig(newConfig);
      await tauri.updateOverlayConfig(newConfig.overlay);
    } catch (error) {
      console.error("Failed to update subtitle style:", error);
    }
  };

  const handlePositionChange = async (position: string) => {
    if (!config) return;
    try {
      const newConfig = {
        ...config,
        overlay: {
          ...config.overlay,
          position_preset: position,
        },
      };
      await updateConfig(newConfig);
      await tauri.updateOverlayConfig(newConfig.overlay);
    } catch (error) {
      console.error("Failed to update subtitle position:", error);
    }
  };

  if (!config) return null;

  const currentSize = config.overlay?.font_size || 24;
  const currentStyle = config.overlay?.style_preset || "minimal";
  const currentPosition = config.overlay?.position_preset || "center";

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">
        {t(I18N_KEYS.SUBTITLE_SETTINGS)}
      </h2>

      <div className="space-y-4">
        {/* Size Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t(I18N_KEYS.SUBTITLE_SIZE)}: {currentSize}px
          </label>
          <input
            type="range"
            min="12"
            max="72"
            value={currentSize}
            onChange={(e) => handleSizeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((currentSize - 12) / (72 - 12)) * 100}%, #374151 ${((currentSize - 12) / (72 - 12)) * 100}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>12px</span>
            <span>72px</span>
          </div>
        </div>

        {/* Style Preset Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t(I18N_KEYS.SUBTITLE_STYLE)}
          </label>
          <select
            value={currentStyle}
            onChange={(e) => handleStyleChange(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            {STYLE_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {t(preset.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Position Preset Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t(I18N_KEYS.SUBTITLE_POSITION)}
          </label>
          <select
            value={currentPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            {POSITION_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {t(preset.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Preview:</p>
          <div
            className="px-4 py-2 rounded text-center"
            style={{
              fontSize: `${currentSize}px`,
              fontWeight: currentStyle === "bold" || currentStyle === "outline" || currentStyle === "gaming" ? "bold" : "normal",
              color: "#FFFFFF",
              backgroundColor: currentStyle === "minimal" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.85)",
              textShadow: currentStyle === "shadow" || currentStyle === "gaming" 
                ? "2px 2px 8px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8)" 
                : currentStyle === "bold" 
                ? "2px 2px 4px rgba(0,0,0,0.8)" 
                : "none",
              border: currentStyle === "outline" ? "2px solid #FFFFFF" : "2px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            Sample Subtitle Text
          </div>
        </div>
      </div>
    </div>
  );
}

