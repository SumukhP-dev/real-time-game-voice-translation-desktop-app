import React, { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { MainWindow } from "./components/MainWindow";
import { I18nProvider } from "./hooks/useI18n";
import { OnboardingProvider } from "./components/OnboardingTooltips";
import electronService from "./services/electron";
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

function App() {
  useEffect(() => {
    console.log("App component mounted");
    console.log("React version:", React.version);
    console.log("Running in Electron:", electronService.isElectronApp());
    
    // Check ML service health on app load
    const checkMLService = async () => {
      try {
        const health = await electronService.healthCheck();
        console.log("ML service health check:", health);
      } catch (error) {
        console.warn("ML service not available:", error);
      }
    };

    checkMLService();
  }, []);

  console.log("App component rendering");

  try {
    return (
      <ErrorBoundary>
        <I18nProvider>
          <OnboardingProvider>
            <MainWindow />
          </OnboardingProvider>
        </I18nProvider>
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
