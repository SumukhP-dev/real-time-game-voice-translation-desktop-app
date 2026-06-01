import React, { Component, ErrorInfo, ReactNode } from "react";
import { MainWindow } from "./components/MainWindow";
import { MLServiceStartupScreen } from "./components/MLServiceStartupScreen";
import { I18nProvider } from "./hooks/useI18n";
import { OnboardingProvider } from "./components/OnboardingTooltips";
import { TranslationProvider } from "./hooks/useTranslation";
import { ConfigProvider } from "./hooks/useConfig";
import { MatchHistoryProvider } from "./hooks/useMatchHistory";
import {
  MLModelLoadingProvider,
  useMLModelLoading,
} from "./hooks/useMLModelLoading";
import { useConfig } from "./hooks/useConfig";
import electronService from "./services/electron";
import { getTranslation } from "./i18n/translations";
import "./index.css";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const getAppText = (key: string, params?: Record<string, string | number>) =>
  getTranslation(navigator.language || "en", key, params);

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
          <h1 style={{ color: "#ff4444" }}>{getAppText("app.error_title")}</h1>
          <p style={{ color: "#ff8888" }}>
            {this.state.error?.message || getAppText("app.unknown_error")}
          </p>
          <details style={{ marginTop: "20px" }}>
            <summary style={{ cursor: "pointer", color: "#4a9eff" }}>
              {getAppText("app.stack_trace")}
            </summary>
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
            {getAppText("app.reload_app")}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppShell() {
  const { mlReady, startupState, startupError, retryStartup } =
    useMLModelLoading();
  const { loading: configLoading } = useConfig();

  if (!mlReady) {
    return (
      <MLServiceStartupScreen
        state={startupState}
        error={startupError}
        onRetry={retryStartup}
      />
    );
  }

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800/60 p-6 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-white">SquadSpeak</h1>
          <p className="mt-3 text-sm text-gray-300">
            Loading your setup and audio preferences...
          </p>
        </div>
      </div>
    );
  }

  return <MainWindow />;
}

function App() {
  console.log("App component rendering");
  console.log("Running in Electron:", electronService.isElectronApp());

  try {
    return (
      <ErrorBoundary>
        <MLModelLoadingProvider>
          <ConfigProvider>
            <MatchHistoryProvider>
              <I18nProvider>
                <OnboardingProvider>
                  <TranslationProvider>
                    <AppShell />
                  </TranslationProvider>
                </OnboardingProvider>
              </I18nProvider>
            </MatchHistoryProvider>
          </ConfigProvider>
        </MLModelLoadingProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("App render error:", error);
    return (
      <div style={{ padding: "20px", color: "red" }}>
        <h1>{getAppText("app.failed_to_render")}</h1>
        <p>{error instanceof Error ? error.message : getAppText("app.unknown_error")}</p>
        <button onClick={() => window.location.reload()}>
          {getAppText("app.reload_app")}
        </button>
      </div>
    );
  }
}

export default App;
