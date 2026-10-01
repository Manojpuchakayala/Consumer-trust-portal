import React from "react";
import { FaExclamationTriangle, FaRedo, FaHome } from "react-icons/fa";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Portal Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "var(--bg-primary, #F8FAFC)",
          color: "var(--text-primary, #10213A)",
        }}>
          <div style={{
            maxWidth: "520px",
            width: "100%",
            background: "var(--card-bg-solid, #ffffff)",
            borderRadius: "16px",
            padding: "36px 28px",
            boxShadow: "0 10px 30px rgba(11, 31, 58, 0.1)",
            border: "1px solid var(--border-color, rgba(16, 42, 76, 0.1))",
            textAlign: "center",
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              color: "#dc2626",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              marginBottom: "16px",
            }}>
              <FaExclamationTriangle />
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "8px", color: "var(--text-heading, #10213A)" }}>
              Portal View Interrupted
            </h2>

            <p style={{ fontSize: "14px", color: "var(--text-secondary, #526176)", lineHeight: "1.6", marginBottom: "24px" }}>
              We encountered a temporary interface state. Click below to recover and resume your session immediately.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--brand-primary, #102A4C)",
                  color: "#ffffff",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <FaRedo /> Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "var(--bg-secondary, #f1f5f9)",
                  color: "var(--text-heading, #10213A)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "13.5px",
                  border: "1px solid var(--border-color, #e2e8f0)",
                  cursor: "pointer",
                }}
              >
                <FaHome /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
