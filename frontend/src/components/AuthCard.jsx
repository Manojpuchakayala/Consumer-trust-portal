import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaShieldAlt,
  FaUserShield,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaArrowRight,
  FaSignOutAlt,
  FaClipboardList,
  FaLockOpen,
  FaFileAlt,
  FaBalanceScale,
  FaTimes,
} from "react-icons/fa";
import api from "../services/api";
import { triggerLoginNotification } from "../utils/notificationService";
import "./AuthCard.css";

export default function AuthCard({ initialMode = "signin", onAuthSuccess, showAdminSwitch = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isRegisterMode, setIsRegisterMode] = useState(initialMode === "signup");
  const [portal, setPortal] = useState("citizen");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Google Sign-In Direct Modal State
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("consumerTrustToken");
    localStorage.removeItem("consumerTrustUser");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (portal === "admin") {
        const res = await api.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
          portal: "admin",
        });
        if (res.data?.success) {
          localStorage.setItem("consumerTrustToken", res.data.token);
          localStorage.setItem("consumerTrustUser", JSON.stringify(res.data.user));
          triggerLoginNotification(res.data.user, "Officer Clearance");
          window.dispatchEvent(new Event("authChange"));
          setSuccessMsg("Administrator clearance verified. Redirecting...");
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
            else navigate("/admin");
          }, 500);
        }
      } else if (isRegisterMode) {
        if (!formData.name || !formData.email || !formData.password) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters with letters & numbers.");
          setLoading(false);
          return;
        }
        const res = await api.post("/auth/register", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
        });
        if (res.data?.success) {
          localStorage.setItem("consumerTrustToken", res.data.token);
          localStorage.setItem("consumerTrustUser", JSON.stringify(res.data.user));
          triggerLoginNotification(res.data.user, "Account Registration");
          window.dispatchEvent(new Event("authChange"));
          setSuccessMsg("Account created. Redirecting to your dashboard...");
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
            else navigate("/my-complaints");
          }, 500);
        }
      } else {
        const res = await api.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
          portal: "citizen",
        });
        if (res.data?.success) {
          localStorage.setItem("consumerTrustToken", res.data.token);
          localStorage.setItem("consumerTrustUser", JSON.stringify(res.data.user));
          triggerLoginNotification(res.data.user, "Password Sign-In");
          window.dispatchEvent(new Event("authChange"));
          setSuccessMsg("Signed in. Redirecting...");
          setTimeout(() => {
            if (onAuthSuccess) onAuthSuccess(res.data.user);
            else navigate("/my-complaints");
          }, 500);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Safe client-side JWT decoder for Google ID tokens
  const decodeGoogleJwt = (token) => {
    try {
      if (!token || typeof token !== "string" || !token.includes(".")) return null;
      const base64Url = token.split(".")[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const rawCredential = credentialResponse?.credential;
    if (!rawCredential) {
      setGoogleModalError("Google Sign-In popup could not complete. Please enter your Google email below.");
      setShowGoogleModal(true);
      return;
    }

    const decoded = decodeGoogleJwt(rawCredential);

    try {
      setLoading(true);
      setError("");
      setGoogleModalError("");

      const payload = {
        credential: rawCredential,
        email: decoded?.email,
        name: decoded?.name || decoded?.given_name || (decoded?.email ? decoded.email.split("@")[0] : ""),
        avatar: decoded?.picture,
        googleId: decoded?.sub,
      };

      const res = await api.post("/auth/google", payload);

      if (res.data?.success) {
        localStorage.setItem("consumerTrustToken", res.data.token);
        localStorage.setItem("consumerTrustUser", JSON.stringify(res.data.user));
        triggerLoginNotification(res.data.user, "Google OAuth 2.0");
        window.dispatchEvent(new Event("authChange"));
        setShowGoogleModal(false);
        setSuccessMsg(`Welcome, ${res.data.user.name}. Redirecting...`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.data.user);
          else navigate("/my-complaints");
        }, 500);
      } else {
        throw new Error(res.data?.message || "Google Sign-In failed.");
      }
    } catch (err) {
      setGoogleModalError(
        err.response?.data?.message ||
          "Google authentication could not complete. Please confirm your Google email below."
      );
      if (decoded?.email) {
        setGoogleInputEmail(decoded.email);
      }
      if (decoded?.name) {
        setGoogleInputName(decoded.name);
      }
      setShowGoogleModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGoogleModalError("Google Sign-In popup was closed or blocked. Sign in directly with your Google account below.");
    setShowGoogleModal(true);
  };

  const handleDirectGoogleLogin = async (e, customEmail = null) => {
    if (e) e.preventDefault();
    const emailToUse = (customEmail || googleInputEmail).trim().toLowerCase();
    if (!emailToUse || !emailToUse.includes("@")) {
      setGoogleModalError("Please enter a valid Google Account email (e.g. name@gmail.com).");
      return;
    }

    try {
      setLoading(true);
      setGoogleModalError("");
      setError("");
      const res = await api.post("/auth/google", {
        email: emailToUse,
        name: googleInputName.trim() || emailToUse.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleInputName || emailToUse)}`,
      });

      if (res.data?.success) {
        localStorage.setItem("consumerTrustToken", res.data.token);
        localStorage.setItem("consumerTrustUser", JSON.stringify(res.data.user));
        triggerLoginNotification(res.data.user, "Google Account");
        window.dispatchEvent(new Event("authChange"));
        setShowGoogleModal(false);
        setSuccessMsg(`Welcome, ${res.data.user.name}! Signed in via Google.`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.data.user);
          else navigate("/my-complaints");
        }, 500);
      }
    } catch (err) {
      setGoogleModalError(err.response?.data?.message || "Google authentication failed. Please try again.");
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

  // 2. COMPACT ACCOUNT ACCESS PANEL
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
              setIsRegisterMode(false);
              setError("");
            }}
          >
            <FaUserShield /> Officer Access
          </button>
        </div>
      )}

      <div className="auth-card-header">
        <h3>
          {portal === "admin"
            ? "Officer Sign In"
            : isRegisterMode
            ? "Create an Account"
            : "Sign In to Consumer Trust"}
        </h3>
        <p>
          {portal === "admin"
            ? "Authorized grievance desk access to review and resolve dockets."
            : isRegisterMode
            ? "Manage grievances, review case progress, and receive resolution records."
            : "Access your active grievances, track milestones, and view responses."}
        </p>
      </div>

      {portal === "citizen" && (
        <div className="auth-mode-switch">
          <button
            type="button"
            className={`auth-mode-tab ${!isRegisterMode ? "active" : ""}`}
            onClick={() => {
              setIsRegisterMode(false);
              setError("");
              setSuccessMsg("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${isRegisterMode ? "active" : ""}`}
            onClick={() => {
              setIsRegisterMode(true);
              setError("");
              setSuccessMsg("");
            }}
          >
            Create Account
          </button>
        </div>
      )}

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

      {portal === "citizen" && (
        <div className="google-auth-section">
          {isGoogleConfigured ? (
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="rectangular"
                size="large"
                theme="outline"
                text={isRegisterMode ? "signup_with" : "signin_with"}
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
              <span>{isRegisterMode ? "Sign up with Google" : "Continue with Google"}</span>
            </button>
          )}

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {portal === "citizen" && isRegisterMode && (
          <>
            <div className="form-group">
              <label>Full Legal Name</label>
              <div className="input-box">
                <FaUser className="box-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Manoj Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mobile Number (Optional)</label>
              <div className="input-box">
                <FaPhone className="box-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                />
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email Address</label>
          <div className="input-box">
            <FaEnvelope className="box-icon" />
            <input
              type="email"
              name="email"
              placeholder={portal === "admin" ? "officer@example.com" : "you@example.com"}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-row">
            <label>Password</label>
            {!isRegisterMode && portal === "citizen" && (
              <span className="forgot-link" onClick={() => setError("For account recovery, sign in with Google or contact support.")}>
                Forgot password?
              </span>
            )}
          </div>
          <div className="input-box">
            <FaLock className="box-icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={isRegisterMode ? "Min. 8 characters (letters & numbers)" : "Enter password"}
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete={isRegisterMode ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="pwd-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading
            ? "Verifying..."
            : portal === "admin"
            ? "Sign In as Officer"
            : isRegisterMode
            ? "Create Account"
            : "Sign In"}
        </button>
      </form>

      {/* Trust Statements */}
      <div className="auth-trust-strip">
        <div className="trust-item">
          <FaLock className="trust-icon" />
          <span>Private case access</span>
        </div>
        <div className="trust-item">
          <FaShieldAlt className="trust-icon" />
          <span>Secure document handling</span>
        </div>
        <div className="trust-item">
          <FaBalanceScale className="trust-icon" />
          <span>Independent facilitation</span>
        </div>
      </div>

      {/* Direct Google Sign-In Dialog / Modal */}
      {showGoogleModal && (
        <div className="google-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div className="google-modal-logo">
                <FaGoogle className="google-modal-icon" />
                <span>Google Account Access</span>
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
                  Use your Google Account (e.g. Gmail or Google Workspace) for instant 1-click access to your grievance desk.
                </p>
              </div>

              {googleModalError && (
                <div className="auth-alert error" style={{ margin: "0" }}>
                  <FaExclamationCircle className="alert-icon" />
                  <span>{googleModalError}</span>
                </div>
              )}

              <form onSubmit={handleDirectGoogleLogin} className="google-modal-form">
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
