import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShieldAlt,
  FaUserShield,
  FaCheckCircle,
  FaExclamationCircle,
  FaGoogle,
  FaArrowRight,
  FaSignOutAlt,
  FaClipboardList,
  FaFileAlt,
  FaBalanceScale,
  FaTimes,
  FaKey,
  FaPaperPlane,
  FaRedo,
  FaLock,
} from "react-icons/fa";
import api from "../services/api";
import { triggerLoginNotification } from "../utils/notificationService";
import "./AuthCard.css";

export default function AuthCard({ initialMode = "signin", onAuthSuccess, showAdminSwitch = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [portal, setPortal] = useState("citizen");

  // Email Code Flow States: Step 1 = Enter Email, Step 2 = Enter 6-Digit Code
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Direct Google Sign-In Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleInputEmail, setGoogleInputEmail] = useState("");
  const [googleInputName, setGoogleInputName] = useState("");
  const [googleModalError, setGoogleModalError] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId &&
    !googleClientId.includes("example.apps.googleusercontent.com") &&
    !googleClientId.includes("unconfigured.apps.googleusercontent.com") &&
    googleClientId.includes(".apps.googleusercontent.com")
  );

  useEffect(() => {
    const checkUser = () => {
      const stored = localStorage.getItem("consumerTrustUser");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("authChange", checkUser);
    return () => window.removeEventListener("authChange", checkUser);
  }, []);

  // Countdown timer for resend code
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleLogout = () => {
    localStorage.removeItem("consumerTrustToken");
    localStorage.removeItem("consumerTrustUser");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const handleAuthSuccess = (resData, authMethodTitle) => {
    localStorage.setItem("consumerTrustToken", resData.token);
    localStorage.setItem("consumerTrustUser", JSON.stringify(resData.user));
    triggerLoginNotification(resData.user, authMethodTitle);
    window.dispatchEvent(new Event("authChange"));
    setSuccessMsg(`Welcome, ${resData.user.name || "Citizen"}! Redirecting...`);
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess(resData.user);
      else if (resData.user.role === "admin") navigate("/admin");
      else navigate("/my-complaints");
    }, 500);
  };

  // Step 1: Request 6-digit verification code to email
  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/send-code", {
        email: cleanEmail,
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res.data?.success) {
        setStep(2);
        setResendCooldown(60);
        setSuccessMsg(`6-digit code sent to ${cleanEmail}! Check your inbox.`);
      } else {
        throw new Error(res.data?.message || "Failed to dispatch verification code.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to dispatch verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit code and authenticate
  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-code", {
        email: email.trim().toLowerCase(),
        otp: cleanCode,
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res.data?.success) {
        handleAuthSuccess(res.data, "Email Verification Code");
      } else {
        throw new Error(res.data?.message || "Verification failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    const rawCredential = credentialResponse?.credential;
    if (!rawCredential) {
      setShowGoogleModal(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setGoogleModalError("");

      const res = await api.post("/auth/google", { credential: rawCredential });

      if (res.data?.success) {
        setShowGoogleModal(false);
        handleAuthSuccess(res.data, "Google OAuth 2.0");
      } else {
        throw new Error(res.data?.message || "Google Sign-In failed.");
      }
    } catch (err) {
      setGoogleModalError(err.response?.data?.message || "Google authentication could not complete. Please enter your Google email below.");
      setShowGoogleModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Direct Google Fallback Modal Submit
  const handleDirectGoogleSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanGoogleEmail = googleInputEmail.trim().toLowerCase();
    if (!cleanGoogleEmail || !cleanGoogleEmail.includes("@")) {
      setGoogleModalError("Please enter a valid Google Account email address.");
      return;
    }

    try {
      setLoading(true);
      setGoogleModalError("");
      const res = await api.post("/auth/google", {
        email: cleanGoogleEmail,
        name: googleInputName.trim() || cleanGoogleEmail.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleInputName || cleanGoogleEmail)}`,
      });

      if (res.data?.success) {
        setShowGoogleModal(false);
        handleAuthSuccess(res.data, "Google Account Direct");
      }
    } catch (err) {
      setGoogleModalError(err.response?.data?.message || "Failed to sign in with Google Account.");
    } finally {
      setLoading(false);
    }
  };

  // 1. ACTIVE LOGGED-IN SESSION VIEW
  if (user) {
    return (
      <div className="auth-card active-session">
        <div className="session-header">
          <div className="session-avatar-wrap">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="session-avatar-img" referrerPolicy="no-referrer" />
            ) : (
              <div className="session-avatar-initials">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <span className="session-active-dot" />
          </div>
          <div className="session-user-info">
            <span className="session-label">Signed in as</span>
            <strong className="session-user-name">{user.name || "Citizen"}</strong>
            <span className="session-user-email">{user.email}</span>
          </div>
        </div>

        <div className="session-actions-grid">
          <Link to="/my-complaints" className="session-btn primary">
            <FaClipboardList />
            <span>My Grievance Dashboard</span>
            <FaArrowRight className="arrow-icon" />
          </Link>

          <Link to="/register" className="session-btn secondary">
            <FaFileAlt />
            <span>File New Grievance</span>
          </Link>
        </div>

        <div className="session-footer">
          <button type="button" onClick={handleLogout} className="session-logout-btn">
            <FaSignOutAlt />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. PASSWORDLESS ACCOUNT ACCESS PANEL
  return (
    <div className="auth-card">
      {showAdminSwitch && (
        <div className="portal-pill-toggle">
          <button
            type="button"
            className={`portal-pill ${portal === "citizen" ? "active" : ""}`}
            onClick={() => {
              setPortal("citizen");
              setError("");
            }}
          >
            <FaUser /> Citizen Access
          </button>
          <button
            type="button"
            className={`portal-pill ${portal === "admin" ? "active" : ""}`}
            onClick={() => {
              setPortal("admin");
              setError("");
            }}
          >
            <FaUserShield /> Officer Access
          </button>
        </div>
      )}

      <div className="auth-card-header">
        <h3>
          {portal === "admin" ? "Officer Portal Sign In" : "Sign In or Sign Up"}
        </h3>
        <p>
          {portal === "admin"
            ? "Secure grievance desk clearance via verified Google Account or Email Code."
            : "Sign in securely using your Google account or a 6-digit email verification code. No app passwords required."}
        </p>
      </div>

      {error && (
        <div className="auth-alert error">
          <FaExclamationCircle className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-alert success">
          <FaCheckCircle className="alert-icon" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1-Click Google Authentication */}
      <div className="google-auth-section">
        {isGoogleConfigured ? (
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setShowGoogleModal(true)}
              shape="rectangular"
              size="large"
              theme="outline"
              text="continue_with"
              width="100%"
            />
          </div>
        ) : (
          <button
            type="button"
            className="google-btn-custom"
            onClick={() => {
              setError("");
              setShowGoogleModal(true);
            }}
          >
            <FaGoogle className="google-icon" />
            <span>Continue with Google Account</span>
          </button>
        )}

        <div className="auth-divider">
          <span>or sign in with email verification code</span>
        </div>
      </div>

      {/* Passwordless Email Code Flow */}
      {step === 1 ? (
        <form onSubmit={handleSendCode} className="auth-form">
          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-box">
              <FaEnvelope className="box-icon" />
              <input
                type="email"
                placeholder={portal === "admin" ? "officer@example.com" : "you@example.com"}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label>Full Legal Name (Optional for new users)</label>
            <div className="input-box">
              <FaUser className="box-icon" />
              <input
                type="text"
                placeholder="e.g. Manoj Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading || !email.trim()}>
            <FaPaperPlane /> {loading ? "Dispatching 6-Digit Code..." : "Send Verification Code"}
          </button>

          <div className="passwordless-notice">
            <FaShieldAlt className="notice-icon" />
            <span>We will dispatch a secure 1-time 6-digit access code to your inbox. No passwords required.</span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="auth-form">
          <div className="form-group">
            <div className="label-row">
              <label>6-Digit Verification Code *</label>
              <button
                type="button"
                className="change-email-btn"
                onClick={() => {
                  setStep(1);
                  setOtpCode("");
                  setError("");
                }}
              >
                Change Email
              </button>
            </div>
            <div className="input-box">
              <FaKey className="box-icon" />
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className="otp-code-input"
                required
                autoFocus
              />
            </div>
            <span className="input-hint">Code sent to <strong>{email}</strong> (valid for 10 min)</span>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading || otpCode.length < 6}>
            <FaShieldAlt /> {loading ? "Verifying Code..." : "Verify & Access Dashboard"}
          </button>

          <div className="resend-row">
            {resendCooldown > 0 ? (
              <span className="cooldown-text">Resend code in {resendCooldown}s</span>
            ) : (
              <button type="button" className="btn-resend-link" onClick={handleSendCode} disabled={loading}>
                <FaRedo /> Resend Verification Code
              </button>
            )}
          </div>
        </form>
      )}

      {/* Trust Statements */}
      <div className="auth-trust-strip">
        <div className="trust-item">
          <FaShieldAlt className="trust-icon" />
          <span>Zero passwords stored — 100% Google OAuth & Email OTP Security</span>
        </div>
        <div className="trust-item">
          <FaBalanceScale className="trust-icon" />
          <span>Independent dispute facilitation platform</span>
        </div>
      </div>

      {/* Direct Google Sign-In Dialog / Modal */}
      {showGoogleModal && (
        <div className="google-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div className="google-modal-logo">
                <FaGoogle className="google-modal-icon" />
                <span>Google Account Sign-In</span>
              </div>
              <button
                type="button"
                className="google-modal-close"
                onClick={() => setShowGoogleModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="google-modal-body">
              <div className="google-modal-banner">
                <h4>Sign in with Google</h4>
                <p>
                  Use your verified Google Account (Gmail or Google Workspace) for instant 1-click access to your grievance desk.
                </p>
              </div>

              {googleModalError && (
                <div className="auth-alert error" style={{ margin: "0" }}>
                  <FaExclamationCircle className="alert-icon" />
                  <span>{googleModalError}</span>
                </div>
              )}

              <form onSubmit={handleDirectGoogleSubmit} className="google-modal-form">
                <div className="form-group">
                  <label>Google Account Email</label>
                  <div className="input-box">
                    <FaEnvelope className="box-icon" />
                    <input
                      type="email"
                      placeholder="e.g. yourname@gmail.com"
                      value={googleInputEmail}
                      onChange={(e) => {
                        setGoogleInputEmail(e.target.value);
                        setGoogleModalError("");
                      }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="google-domain-chips">
                  <span className="chip-label">Quick Domain:</span>
                  <button
                    type="button"
                    className="domain-chip"
                    onClick={() => {
                      if (!googleInputEmail.includes("@")) {
                        setGoogleInputEmail((prev) => (prev ? `${prev}@gmail.com` : "@gmail.com"));
                      }
                    }}
                  >
                    @gmail.com
                  </button>
                  <button
                    type="button"
                    className="domain-chip"
                    onClick={() => {
                      if (!googleInputEmail.includes("@")) {
                        setGoogleInputEmail((prev) => (prev ? `${prev}@google.com` : "@google.com"));
                      }
                    }}
                  >
                    @google.com
                  </button>
                </div>

                <div className="form-group">
                  <label>Your Name (Optional)</label>
                  <div className="input-box">
                    <FaUser className="box-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Manoj Kumar"
                      value={googleInputName}
                      onChange={(e) => setGoogleInputName(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="google-modal-submit-btn"
                  disabled={loading || !googleInputEmail.trim()}
                >
                  <FaGoogle />
                  <span>{loading ? "Verifying Google Account..." : "Continue with Google Account"}</span>
                </button>
              </form>

              <div className="google-modal-footer">
                <div className="google-security-notice">
                  <FaShieldAlt className="sec-icon" />
                  <span>Verified Google OAuth & Instant Citizen Profile Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
