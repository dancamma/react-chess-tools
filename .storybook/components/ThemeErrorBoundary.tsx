import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary for Theme Playground
 * Catches and handles theme-related errors gracefully
 */
export class ThemeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error("Theme Playground Error:", error, errorInfo);

    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom error fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error fallback
      return (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            background: "linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            borderRadius: "16px",
            border: "1px solid #fca5a5",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎨💥</div>
          <h2 style={{ color: "#991b1b", marginBottom: "16px" }}>
            Theme Playground Error
          </h2>
          <p
            style={{
              color: "#7f1d1d",
              marginBottom: "24px",
              maxWidth: "600px",
            }}
          >
            Something went wrong while rendering the theme playground. This
            could be due to an invalid theme configuration, color parsing error,
            or other theme-related issue.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px",
                border: "1px solid #fca5a5",
                maxWidth: "800px",
                width: "100%",
                textAlign: "left",
              }}
            >
              <summary style={{ fontWeight: "bold", cursor: "pointer" }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#7f1d1d",
                  overflow: "auto",
                  maxHeight: "200px",
                }}
              >
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: "12px 24px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#b91c1c";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            🔄 Reset Theme Playground
          </button>

          <p
            style={{
              fontSize: "14px",
              color: "#7f1d1d",
              marginTop: "16px",
              fontStyle: "italic",
            }}
          >
            The playground will reset to default theme and clear any custom
            changes.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
