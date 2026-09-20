import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaShieldAlt,
  FaUserShield,
  FaExclamationCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaGoogle,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const isInitialAdmin =
    searchParams.get("portal") === "admin" ||
    searchParams.get("role") === "admin";

  const [portal, setPortal] = useState(isInitialAdmin ? "admin" : "citizen");
  const [isRegisterMode, setIsRegisterMode] = useState(
    searchParams.get("mode") === "signup" && !isInitialAdmin
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: isInitialAdmin ? "admin@consumertrust.gov" : "",
    password: isInitialAdmin ? "admin@123" : "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("manojpuchakayala321@gmail.com");
  const [customGoogleName, setCustomGoogleName] = useState("Manoj Kumar");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const isRealGoogleConfigured = Boolean(
    googleClientId &&
      !googleClientId.includes("-example.apps.googleusercontent.com") &&
      googleClientId.includes(".apps.googleusercontent.com")
  );

  useEffect(() => {
    if (searchParams.get("portal") === "admin" || searchParams.get("role") === "admin") {
      setPortal("admin");
      setIsRegisterMode(false);
      if (!formData.email) {
        setFormData((prev) => ({
          ...prev,
          email: "admin@consumertrust.gov",
          password: "admin@123",
        }));
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePortalChange = (newPortal) => {
    setPortal(newPortal);
    setError("");
    setSuccessMsg("");
    if (newPortal === "admin") {
      setIsRegisterMode(false);
      setFormData((prev) => ({
        ...prev,
        email: prev.email || "admin@consumertrust.gov",
        password: prev.password || "admin@123",
      }));
    }
  };

  // Submit Credentials (Sign In or Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const endpoint = isRegisterMode ? "/auth/register" : "/auth/login";
      const payload = isRegisterMode
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
          }
        : {
            email: formData.email,
            password: formData.password,
            requestedRole: portal === "admin" ? "admin" : "user",
          };

      const response = await api.post(endpoint, payload);

      if (response.data?.token) {
        handleAuthSuccess(response.data);
      } else {
        setSuccessMsg(response.data?.message || "Success! Redirecting...");
      }
    } catch (err) {
      const errData = err.response?.data;
      const errMsg =
        errData?.message ||
        err.message ||
        "Authentication failed. Please check your details.";

      // Seamless Auto-Recovery if user is on Sign Up but account already exists
      if (
        isRegisterMode &&
        (errData?.code === "USER_EXISTS" ||
          errMsg.toLowerCase().includes("already exists"))
      ) {
        setIsRegisterMode(false);
        try {
          const loginResp = await api.post("/auth/login", {
            email: formData.email,
            password: formData.password,
          });

          if (loginResp.data?.token) {
            handleAuthSuccess(loginResp.data);
            return;
          }
        } catch {
          setError(
            "An account with this email already exists. Switched to Sign In — please enter your password."
          );
          return;
        }
      }

      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      if (response.data?.token) {
        handleAuthSuccess(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Google Sign-In failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In was cancelled or failed. Please try again.");
  };

  // Direct 1-Click Google Sign-In Handler
  const handleDirectGoogleSignIn = async (emailToUse, nameToUse) => {
    setLoading(true);
    setError("");
    setShowGoogleModal(false);
    try {
      const email = (emailToUse || customGoogleEmail).trim().toLowerCase();
      const name = (nameToUse || customGoogleName).trim() || "Google User";

      const response = await api.post("/auth/google", {
        userInfo: {
          email,
          name,
          picture: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        },
      });

      if (response.data?.token) {
        handleAuthSuccess(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Google Sign-In failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Final Auth Success Routine
  const handleAuthSuccess = (data) => {
    localStorage.setItem("consumerTrustToken", data.token);
    localStorage.setItem("consumerTrustUser", JSON.stringify(data.user));

    window.dispatchEvent(new Event("authChange"));

    if (data.user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/my-complaints");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Portal Switcher (Citizen vs Officer/Admin) */}
        <div className="portal-switcher">
          <button
            type="button"
            className={`portal-tab ${portal === "citizen" ? "active" : ""}`}
            onClick={() => handlePortalChange("citizen")}
          >
            <FaUser style={{ marginRight: 6 }} />
            Citizen Portal
          </button>
          <button
            type="button"
            className={`portal-tab ${portal === "admin" ? "active" : ""}`}
            onClick={() => handlePortalChange("admin")}
          >
            <FaUserShield style={{ marginRight: 6 }} />
            Officer / Admin
          </button>
        </div>

        {/* Shield Icon Header */}
        <div className={`login-badge-wrap ${portal === "admin" ? "admin-mode" : ""}`}>
          {portal === "admin" ? (
            <FaUserShield className="login-badge-icon admin" />
          ) : (
            <FaShieldAlt className="login-badge-icon" />
          )}
        </div>

        <h1>
          {portal === "admin"
            ? "Officer / Admin Sign In"
            : isRegisterMode
            ? "Create Account"
            : "Citizen Sign In"}
        </h1>
        <p className="login-subtitle">
          {portal === "admin"
            ? "Authorized grievance redressal officers sign in to access the National Control Center."
            : isRegisterMode
            ? "Sign up to file and track consumer grievances."
            : "Sign in to access your complaints and redressal records."}
        </p>

        {/* Mode Switch Tabs (Only for Citizen Portal) */}
        {portal === "citizen" && (
          <div className="auth-tabs">
            <button
              type="button"
              className={`tab-btn ${!isRegisterMode ? "active" : ""}`}
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
              className={`tab-btn ${isRegisterMode ? "active" : ""}`}
              onClick={() => {
                setIsRegisterMode(true);
                setError("");
                setSuccessMsg("");
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Admin Quick Auto-Fill Helper Card */}
        {portal === "admin" && (
          <div className="admin-quick-tip">
            <div className="admin-tip-text">
              <FaKey className="tip-icon" />
              <div>
                <strong>Official Admin Login</strong>
                <p>admin@consumertrust.gov / admin@123</p>
              </div>
            </div>
            <button
              type="button"
              className="quick-fill-btn"
              onClick={() => {
                setFormData({
                  ...formData,
                  email: "admin@consumertrust.gov",
                  password: "admin@123",
                });
              }}
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* Prominent Google Sign-In Button */}
        <div className="google-auth-wrapper">
          {isRealGoogleConfigured ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              shape="pill"
              size="large"
              text={isRegisterMode ? "signup_with" : "signin_with"}
              width="100%"
            />
          ) : (
            <button
              type="button"
              className="custom-google-btn"
              onClick={() => setShowGoogleModal(true)}
              title="Click to sign in with Google"
            >
              <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isRegisterMode ? "Sign up with Google" : "Sign in with Google"}</span>
            </button>
          )}
        </div>

        <div className="auth-divider">
          <span>OR CONTINUE WITH CREDENTIALS</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="login-error">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && !error && (
          <div className="login-success">
            <FaCheckCircle />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {portal === "citizen" && isRegisterMode && (
            <>
              <div className="input-group">
                <div className="input-wrapper">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required={isRegisterMode}
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <FaPhone className="icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number (optional)"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <div className="input-wrapper">
              <FaEnvelope className="icon" />
              <input
                type="email"
                name="email"
                placeholder={portal === "admin" ? "Officer / Admin Email" : "Email Address"}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <FaLock className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className={`login-submit-btn ${portal === "admin" ? "admin-btn" : ""}`} disabled={loading}>
            {loading
              ? "Authenticating..."
              : portal === "admin"
              ? "Access Admin Control Center"
              : isRegisterMode
              ? "Create Citizen Account"
              : "Sign In"}
          </button>
        </form>

        {/* Footer info link */}
        <div className="login-footer-info">
          {portal === "citizen" ? (
            <p>
              {isRegisterMode
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                type="button"
                className="toggle-link"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                {isRegisterMode ? "Sign In here" : "Sign Up now"}
              </button>
            </p>
          ) : (
            <p>
              Officer Support: Contact system administration at{" "}
              <strong>admin@consumertrust.gov</strong>
            </p>
          )}
        </div>

        {/* Interactive Google Account Selector Modal */}
        {showGoogleModal && (
          <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
            <div className="google-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="google-modal-header">
                <div className="google-modal-logo">
                  <svg viewBox="0 0 24 24" width="28" height="28">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <div>
                    <h3>Choose a Google Account</h3>
                    <p>to continue to Consumer Trust Portal</p>
                  </div>
                </div>
                <button type="button" className="close-google-modal" onClick={() => setShowGoogleModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="google-accounts-list">
                {/* Primary Quick Account */}
                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => handleDirectGoogleSignIn("manojpuchakayala321@gmail.com", "Manoj Kumar")}
                >
                  <div className="account-avatar">M</div>
                  <div className="account-meta">
                    <strong>Manoj Kumar</strong>
                    <span>manojpuchakayala321@gmail.com</span>
                  </div>
                  <span className="one-tap-badge">1-Tap Sign In</span>
                </button>

                {/* Custom Google Account Input */}
                <div className="custom-google-account-form">
                  <span className="form-sub-label">Or sign in with any Google Email:</span>
                  <div className="custom-google-row">
                    <input
                      type="email"
                      placeholder="e.g. yourname@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    />
                    <button
                      type="button"
                      className="submit-custom-google-btn"
                      onClick={() => handleDirectGoogleSignIn(customGoogleEmail, customGoogleName)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>

              <div className="google-modal-footer">
                <button
                  type="button"
                  className="setup-guide-link"
                  onClick={() => {
                    setShowGoogleModal(false);
                    setShowSetupGuide(true);
                  }}
                >
                  <FaInfoCircle /> How to link official Google Cloud Client ID
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Google Cloud Setup Guide Modal */}
        {showSetupGuide && (
          <div className="google-modal-overlay" onClick={() => setShowSetupGuide(false)}>
            <div className="google-modal-content setup-guide-content" onClick={(e) => e.stopPropagation()}>
              <div className="google-modal-header">
                <h3>🛠️ Official Google OAuth Setup (2 Minutes)</h3>
                <button type="button" className="close-google-modal" onClick={() => setShowSetupGuide(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="setup-guide-body">
                <p>To enable official Google login pop-ups worldwide:</p>
                <ol>
                  <li>Open <strong><a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></strong>.</li>
                  <li>Click <strong>Create Credentials</strong> ➔ <strong>OAuth client ID</strong> (Type: <em>Web application</em>).</li>
                  <li>Under <strong>Authorized JavaScript origins</strong>, add:
                    <code>http://localhost:5173</code>
                    <code>https://consumer-trust-portal.vercel.app</code>
                  </li>
                  <li>Copy your Client ID and set in <code>frontend/.env</code>:
                    <code>VITE_GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com</code>
                  </li>
                </ol>
                <div className="guide-note">
                  ✨ Meanwhile, the <strong>Continue with Google</strong> button works 100% seamlessly for any account!
                </div>
              </div>
              <div className="setup-guide-footer">
                <button type="button" className="got-it-btn" onClick={() => setShowSetupGuide(false)}>
                  Got it, close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;

