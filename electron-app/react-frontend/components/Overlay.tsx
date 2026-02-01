import React, { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import "../index.css";

interface OverlayText {
  text: string;
  timestamp: number;
  config?: any;
}

// Style presets
const stylePresets: Record<string, React.CSSProperties> = {
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
    textShadow: "2px 2px 8px rgba(0,0,0,1), 0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)",
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

// Position presets
const positionPresets: Record<string, React.CSSProperties> = {
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

export function Overlay() {
  const [currentText, setCurrentText] = useState<OverlayText | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    console.log("Overlay component mounted, listening for 'show-text' events");

    // Log that overlay is ready
    console.log("=== OVERLAY WINDOW READY ===");

    const unlisten = listen("show-text", (event: any) => {
      console.log("=== OVERLAY RECEIVED EVENT ===", event);
      const { text, config } = event.payload;
      console.log("Overlay text:", text, "Config:", config);

      if (!text || text.trim() === "") {
        console.warn("Received empty text, ignoring");
        return;
      }

      setFadeOut(false);
      setCurrentText({
        text: text.trim(),
        timestamp: Date.now(),
        config: config,
      });
      console.log("Overlay text set, should be visible now");

      // Auto-hide after fade duration
      const fadeDuration = (config?.fade_duration || 5.0) * 1000;
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setCurrentText(null);
        }, 500); // Fade out animation
      }, fadeDuration);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // When no text, show nothing (completely transparent)
  if (!currentText) {
    return (
      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{
          backgroundColor: "transparent",
        }}
      />
    );
  }

  // Get config values with defaults
  const overlayConfig = currentText.config || {};
  const fontSize = overlayConfig.font_size || 24;
  const stylePreset = overlayConfig.style_preset || "minimal";
  const positionPreset = overlayConfig.position_preset || "center";
  const fontFamily = overlayConfig.font_family;

  // Get style and position from presets
  const style = stylePresets[stylePreset] || stylePresets.minimal;
  const position = positionPresets[positionPreset] || positionPresets.center;

  // Merge styles
  const subtitleStyle: React.CSSProperties = {
    ...style,
    fontSize: `${fontSize}px`,
    fontFamily: fontFamily || undefined,
    color: style.color || "#FFFFFF",
    padding: "20px 30px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    maxWidth: "80%",
    wordWrap: "break-word",
  };

  return (
    <div
      className={`fixed w-full h-full pointer-events-none z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        ...position,
        padding: "20px",
        backgroundColor: "transparent",
      }}
    >
      <div
        className="text-center shadow-2xl"
        style={subtitleStyle}
      >
        {currentText.text}
      </div>
    </div>
  );
}
