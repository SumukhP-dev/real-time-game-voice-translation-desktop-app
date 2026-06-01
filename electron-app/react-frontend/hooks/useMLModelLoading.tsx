import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import electronService, {
  type MLServiceStartupState,
} from "../services/electron";

const INITIAL_STARTUP_STATE: MLServiceStartupState = {
  progress: 0,
  message: "First launch: models loading (~1 min)",
  phase: "connecting",
};

type MLModelLoadingContextValue = {
  mlReady: boolean;
  startupState: MLServiceStartupState;
  startupError: string | null;
  retryStartup: () => void;
};

const MLModelLoadingContext =
  createContext<MLModelLoadingContextValue | null>(null);

export function MLModelLoadingProvider({ children }: { children: ReactNode }) {
  const [mlReady, setMlReady] = useState(false);
  const [startupState, setStartupState] =
    useState<MLServiceStartupState>(INITIAL_STARTUP_STATE);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [startupAttempt, setStartupAttempt] = useState(0);

  const runStartup = useCallback(() => {
    setStartupError(null);
    setStartupState(INITIAL_STARTUP_STATE);

    void electronService
      .waitForMLServiceReady(setStartupState)
      .then(() => {
        setMlReady(true);
        console.log("ML service ready for translation");
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Translation backend failed to start";
        console.warn("ML service startup failed:", err);
        setStartupError(msg);
        setStartupState((prev) => ({
          ...prev,
          phase: "error",
          message: "Could not load AI models",
        }));
      });
  }, []);

  useEffect(() => {
    runStartup();
  }, [runStartup, startupAttempt]);

  const retryStartup = useCallback(() => {
    electronService.resetMLServiceStartup();
    setMlReady(false);
    setStartupAttempt((n) => n + 1);
  }, []);

  return (
    <MLModelLoadingContext.Provider
      value={{ mlReady, startupState, startupError, retryStartup }}
    >
      {children}
    </MLModelLoadingContext.Provider>
  );
}

export function useMLModelLoading(): MLModelLoadingContextValue {
  const ctx = useContext(MLModelLoadingContext);
  if (!ctx) {
    throw new Error("useMLModelLoading must be used within MLModelLoadingProvider");
  }
  return ctx;
}
