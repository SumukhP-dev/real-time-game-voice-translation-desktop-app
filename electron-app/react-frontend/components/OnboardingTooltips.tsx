import React, { useState, useEffect, createContext, useContext } from "react";
import { useConfig } from "../hooks/useConfig";

interface OnboardingContextType {
  hasSeenTooltips: boolean;
  markTooltipSeen: (tooltipId: string) => void;
  shouldShowTooltip: (tooltipId: string) => boolean;
  skipOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { config, updateConfig, loading } = useConfig();
  const [seenTooltips, setSeenTooltips] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load seen tooltips from config
    if (!loading && config) {
      try {
        const seen = config?.app?.setup_complete
          ? new Set<string>(["setup_complete"])
          : new Set<string>();
        setSeenTooltips(seen);
      } catch (error) {
        console.error("Error loading onboarding state:", error);
        setSeenTooltips(new Set());
      }
    }
  }, [config?.app?.setup_complete, loading]);

  // Show loading state while config is loading
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  const markTooltipSeen = (tooltipId: string) => {
    setSeenTooltips((prev) => {
      const next = new Set(prev);
      next.add(tooltipId);
      return next;
    });
  };

  const shouldShowTooltip = (tooltipId: string): boolean => {
    return !seenTooltips.has(tooltipId);
  };

  const skipOnboarding = () => {
    setSeenTooltips(new Set(["all"]));
    if (config) {
      updateConfig({
        ...config,
        app: { ...config.app, setup_complete: true },
      });
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasSeenTooltips: seenTooltips.has("all"),
        markTooltipSeen,
        shouldShowTooltip,
        skipOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

interface TooltipProps {
  id: string;
  message: string;
  position?: "top" | "bottom" | "left" | "right";
  target: React.RefObject<HTMLElement>;
  children?: React.ReactNode;
}

export function Tooltip({ id, message, position = "top", target, children }: TooltipProps) {
  const { shouldShowTooltip, markTooltipSeen } = useOnboarding();
  const [show, setShow] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!shouldShowTooltip(id)) {
      setShow(false);
      return;
    }

    if (target.current) {
      const rect = target.current.getBoundingClientRect();
      const positions = {
        top: { top: rect.top - 10, left: rect.left + rect.width / 2 },
        bottom: { top: rect.bottom + 10, left: rect.left + rect.width / 2 },
        left: { top: rect.top + rect.height / 2, left: rect.left - 10 },
        right: { top: rect.top + rect.height / 2, left: rect.right + 10 },
      };
      setTooltipPosition(positions[position]);
      setShow(true);
    }
  }, [id, position, target, shouldShowTooltip]);

  if (!show) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        className="fixed z-50 px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg shadow-lg max-w-xs"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: position === "top" || position === "bottom" ? "translateX(-50%)" : "translateY(-50%)",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <p>{message}</p>
          <button
            onClick={() => {
              markTooltipSeen(id);
              setShow(false);
            }}
            className="text-white hover:text-gray-200 text-xs"
          >
            ✕
          </button>
        </div>
        <div
          className={`absolute w-0 h-0 border-4 ${
            position === "top"
              ? "bottom-0 left-1/2 -translate-x-1/2 border-t-yellow-600 border-transparent"
              : position === "bottom"
              ? "top-0 left-1/2 -translate-x-1/2 border-b-yellow-600 border-transparent"
              : position === "left"
              ? "right-0 top-1/2 -translate-y-1/2 border-l-yellow-600 border-transparent"
              : "left-0 top-1/2 -translate-y-1/2 border-r-yellow-600 border-transparent"
          }`}
        />
      </div>
    </>
  );
}

interface FeatureHighlightProps {
  featureId: string;
  title: string;
  description: string;
  target: React.RefObject<HTMLElement>;
}

export function FeatureHighlight({
  featureId,
  title,
  description,
  target,
}: FeatureHighlightProps) {
  const { shouldShowTooltip, markTooltipSeen } = useOnboarding();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(shouldShowTooltip(featureId));
  }, [featureId, shouldShowTooltip]);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border-2 border-yellow-500">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 text-sm">{description}</p>
          </div>
          <button
            onClick={() => {
              markTooltipSeen(featureId);
              setShow(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              markTooltipSeen(featureId);
              setShow(false);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            Got it!
          </button>
          <button
            onClick={() => {
              markTooltipSeen("all");
              setShow(false);
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          >
            Skip All
          </button>
        </div>
      </div>
    </div>
  );
}

