import type { CSSProperties } from "react";

/** Shared stack for in-app preview and Electron overlay window (no Tailwind on overlay). */
export const SUBTITLE_FONT_FAMILY =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export type OverlayConfigLike = {
  font_size?: number;
  text_color?: string;
  background_color?: string;
  max_width?: number;
  style_preset?: string;
  position_preset?: string;
  font_family?: string;
};

const STYLE_PRESETS: Record<string, CSSProperties> = {
  minimal: {
    fontWeight: "normal",
    textShadow: "none",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  bold: {
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  outline: {
    fontWeight: "bold",
    textShadow: "none",
    WebkitTextStroke: "2px #000000",
    border: "3px solid #FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
  },
  shadow: {
    fontWeight: "bold",
    textShadow:
      "2px 2px 8px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  gaming: {
    fontWeight: "bold",
    textShadow: "0 0 10px rgba(0,255,255,0.8), 2px 2px 4px rgba(0,0,0,1)",
    border: "3px solid #00FFFF",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    color: "#00FFFF",
  },
  classic: {
    fontWeight: "normal",
    textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
};

const POSITION_PRESETS: Record<string, CSSProperties> = {
  top: {
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "auto",
    right: "auto",
  },
  bottom: {
    bottom: "10%",
    left: "50%",
    transform: "translateX(-50%)",
    top: "auto",
    right: "auto",
  },
  center: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bottom: "auto",
    right: "auto",
  },
  "top-left": {
    top: "10%",
    left: "5%",
    transform: "none",
    bottom: "auto",
    right: "auto",
  },
  "top-right": {
    top: "10%",
    right: "5%",
    left: "auto",
    transform: "none",
    bottom: "auto",
  },
  "bottom-left": {
    bottom: "10%",
    left: "5%",
    transform: "none",
    top: "auto",
    right: "auto",
  },
  "bottom-right": {
    bottom: "10%",
    right: "5%",
    left: "auto",
    transform: "none",
    top: "auto",
  },
};

export function buildOverlayStyles(
  overlayConfig: OverlayConfigLike = {}
): { container: CSSProperties; box: CSSProperties } {
  const fontSize = overlayConfig.font_size ?? 24;
  const stylePreset = overlayConfig.style_preset ?? "minimal";
  const positionPreset = overlayConfig.position_preset ?? "bottom";
  const presetStyle = STYLE_PRESETS[stylePreset] ?? STYLE_PRESETS.minimal;
  const position = POSITION_PRESETS[positionPreset] ?? POSITION_PRESETS.bottom;

  const textColor = overlayConfig.text_color;
  const backgroundColor = overlayConfig.background_color;
  const maxWidth = overlayConfig.max_width ?? 800;

  const box: CSSProperties = {
    ...presetStyle,
    position: "fixed",
    ...position,
    fontSize: `${fontSize}px`,
    fontFamily: overlayConfig.font_family || SUBTITLE_FONT_FAMILY,
    color: textColor || (presetStyle.color as string) || "#FFFFFF",
    backgroundColor:
      backgroundColor ||
      (presetStyle.backgroundColor as string) ||
      "rgba(0, 0, 0, 0.75)",
    padding: "12px 20px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    maxWidth: `${maxWidth}px`,
    width: "max-content",
    wordWrap: "break-word",
    textAlign: "center",
    lineHeight: 1.35,
    zIndex: 9999,
  };

  return {
    container: {
      backgroundColor: "transparent",
    },
    box,
  };
}
