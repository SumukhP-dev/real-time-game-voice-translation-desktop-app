import React from "react";
import { useConfig } from "../hooks/useConfig";
import { useI18n } from "../hooks/useI18n";
import { I18N_KEYS } from "../i18n/keys";
import { buildOverlayStyles } from "../utils/overlayStyle";
import electronService from "../services/electron";

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

  const previewOnOverlay = async (overlay: NonNullable<typeof config>["overlay"]) => {
    try {
      await electronService.showOverlayText(t("subtitle.preview_text"), overlay);
    } catch (error) {
      console.warn("Overlay preview failed:", error);
    }
  };

  const applyOverlayUpdate = async (
    overlayPatch: Partial<NonNullable<typeof config>["overlay"]>
  ) => {
    if (!config) return;
    const newOverlay = { ...config.overlay, ...overlayPatch };
    const newConfig = { ...config, overlay: newOverlay };
    await updateConfig(newConfig);
    await previewOnOverlay(newOverlay);
  };

  const handleSizeChange = async (size: number) => {
    try {
      await applyOverlayUpdate({ font_size: size });
    } catch (error) {
      console.error("Failed to update subtitle size:", error);
    }
  };

  const handleStyleChange = async (style: string) => {
    try {
      await applyOverlayUpdate({ style_preset: style });
    } catch (error) {
      console.error("Failed to update subtitle style:", error);
    }
  };

  const handlePositionChange = async (position: string) => {
    try {
      await applyOverlayUpdate({ position_preset: position });
    } catch (error) {
      console.error("Failed to update subtitle position:", error);
    }
  };

  if (!config) return null;

  const currentSize = config.overlay?.font_size || 24;
  const currentStyle = config.overlay?.style_preset || "minimal";
  const currentPosition = config.overlay?.position_preset || "bottom";
  const previewStyles = buildOverlayStyles(config.overlay);

  return (
    <div className="p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
        {t(I18N_KEYS.SUBTITLE_SETTINGS)}
      </h2>

      <div className="space-y-6">
        {/* Size Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {t(I18N_KEYS.SUBTITLE_SIZE)}: <span className="text-blue-400 font-mono">{currentSize}px</span>
          </label>
          <input
            type="range"
            min="12"
            max="72"
            value={currentSize}
            onChange={(e) => handleSizeChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((currentSize - 12) / (72 - 12)) * 100}%, #374151 ${((currentSize - 12) / (72 - 12)) * 100}%, #374151 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>12px</span>
            <span>72px</span>
          </div>
        </div>

        {/* Style Preset Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {t(I18N_KEYS.SUBTITLE_STYLE)}
          </label>
          <select
            value={currentStyle}
            onChange={(e) => handleStyleChange(e.target.value)}
            className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
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
          <label className="block text-sm font-medium text-gray-300 mb-3">
            {t(I18N_KEYS.SUBTITLE_POSITION)}
          </label>
          <select
            value={currentPosition}
            onChange={(e) => handlePositionChange(e.target.value)}
            className="w-full p-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          >
            {POSITION_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {t(preset.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
          <p className="text-sm font-medium text-gray-300 mb-3">
            {t("subtitle.preview_label")}
          </p>
          <div className="flex justify-center p-2">
            <div
              style={{
                ...previewStyles.box,
                position: "relative",
                top: "auto",
                left: "auto",
                right: "auto",
                bottom: "auto",
                transform: "none",
              }}
            >
              {t("subtitle.preview_text")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

