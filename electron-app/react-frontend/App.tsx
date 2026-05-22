import React, { useCallback, useEffect, useState, Component, ErrorInfo, ReactNode } from "react";
import { MainWindow } from "./components/MainWindow";
import { MLServiceStartupScreen } from "./components/MLServiceStartupScreen";
import { I18nProvider } from "./hooks/useI18n";
import { OnboardingProvider } from "./components/OnboardingTooltips";
import { TranslationProvider } from "./hooks/useTranslation";
import { ConfigProvider } from "./hooks/useConfig";
import { MatchHistoryProvider } from "./hooks/useMatchHistory";
import electronService, {
  type MLServiceStartupState,
} from "./services/electron";
import "./index.css";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", fontFamily: "monospace", backgroundColor: "#1a1a1a", minHeight: "100vh", color: "#fff" }}>
          <h1 style={{ color: "#ff4444" }}>Application Error</h1>
          <p style={{ color: "#ff8888" }}>{this.state.error?.message || "Unknown error"}</p>
          <details style={{ marginTop: "20px" }}>
            <summary style={{ cursor: "pointer", color: "#4a9eff" }}>Stack Trace</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflow: "auto", backgroundColor: "#000", padding: "10px", borderRadius: "4px" }}>
              {this.state.error?.stack}
            </pre>
            {this.state.errorInfo && (
              <pre style={{ whiteSpace: "pre-wrap", overflow: "auto", marginTop: "10px", backgroundColor: "#000", padding: "10px", borderRadius: "4px" }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer", backgroundColor: "#4a9eff", color: "#fff", border: "none", borderRadius: "4px" }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const INITIAL_STARTUP_STATE: MLServiceStartupState = {
  progress: 0,
  message: "First launch: models loading (~1 min)",
  phase: "connecting",
};

function App() {
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
    console.log("App component mounted");
    console.log("React version:", React.version);
    console.log("Running in Electron:", electronService.isElectronApp());
    runStartup();
  }, [runStartup, startupAttempt]);

  const handleRetryStartup = () => {
    electronService.resetMLServiceStartup();
    setMlReady(false);
    setStartupAttempt((n) => n + 1);
  };

  console.log("App component rendering");

  try {
    if (!mlReady) {
      return (
        <ErrorBoundary>
          <MLServiceStartupScreen
            state={startupState}
            error={startupError}
            onRetry={handleRetryStartup}
          />
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary>
        <ConfigProvider>
          <MatchHistoryProvider>
            <I18nProvider>
              <OnboardingProvider>
                <TranslationProvider>
                  <MainWindow />
                </TranslationProvider>
              </OnboardingProvider>
            </I18nProvider>
          </MatchHistoryProvider>
        </ConfigProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("App render error:", error);
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>App Failed to Render</h1>
        <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
}

export default App;
