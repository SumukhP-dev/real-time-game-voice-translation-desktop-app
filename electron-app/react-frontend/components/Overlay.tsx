import React, { useEffect, useState } from "react";
import { buildOverlayStyles } from "../utils/overlayStyle";
import type { OverlayConfigLike } from "../utils/overlayStyle";

interface OverlayText {
  text: string;
  timestamp: number;
  config?: OverlayConfigLike;
}

export function Overlay() {
  const [currentText, setCurrentText] = useState<OverlayText | null>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const api = (
      window as unknown as {
        electronAPI?: {
          subscribeSubtitleOverlay?: (
            cb: (p: { text: string; config?: OverlayConfigLike }) => void
          ) => () => void;
          notifyOverlayRendererReady?: () => void;
        };
      }
    ).electronAPI;

    if (!api?.subscribeSubtitleOverlay) {
      console.warn("Overlay: subscribeSubtitleOverlay unavailable");
      return;
    }

    const unsubscribe = api.subscribeSubtitleOverlay((payload) => {
      const text = String(payload.text ?? "").trim();
      const config = payload.config || {};

      if (!text) {
        return;
      }

      setFadeOut(false);
      setCurrentText({
        text,
        timestamp: Date.now(),
        config,
      });

      const fadeDuration = (Number(config.fade_duration) || 5.0) * 1000;
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setCurrentText(null), 500);
      }, fadeDuration);
    });

    api.notifyOverlayRendererReady?.();
    return () => unsubscribe();
  }, []);

  if (!currentText) {
    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ backgroundColor: "transparent" }}
      />
    );
  }

  const { container, box } = buildOverlayStyles(currentText.config);

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={container}
    >
      <div style={box}>{currentText.text}</div>
    </div>
  );
}
