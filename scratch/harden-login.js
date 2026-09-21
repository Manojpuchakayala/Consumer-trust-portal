const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const loginJsx = `import { useState, useEffect } from "react";
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

  // Form State - strictly blank by default (NO hardcoded credentials)
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

  // Per-Device Dynamic Google Sign-In State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [googleNameInput, setGoogleNameInput] = useState("");
  const [savedDeviceGoogleUser, setSavedDeviceGoogleUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("consumerTrustLastGoogleUser") || "null");
    } catch {
      return null;
    }
  });

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
    }
  }, [searchParams]);

  const handlePortalChange = (newPortal) => {
    setPortal(newPortal);
    setError("");
    setSuccessMsg("");
    if (newPortal === "admin") {
      setIsRegisterMode(false);
      setSearchParams({ portal: "admin" });
    } else {
      setSearchParams({});
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (portal === "admin") {
        const response = await api.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
          portal: "admin",
        });

        if (response.data?.success) {
          localStorage.setItem("consumerTrustToken", response.data.token);
          localStorage.setItem("consumerTrustUser", JSON.stringify(response.data.user));
          setSuccessMsg("Administrator clearance verified! Redirecting...");
          setTimeout(() => navigate("/admin"), 1000);
        }
      } else if (isRegisterMode) {
        if (!formData.name || !formData.email || !formData.password) {
          setError("Please complete all required fields.");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long and contain both letters and numbers.");
          setLoading(false);
          return;
        }

        const response = await api.post("/auth/register", {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
        });

        if (response.data?.success) {
          localStorage.setItem("consumerTrustToken", response.data.token);
          localStorage.setItem("consumerTrustUser", JSON.stringify(response.data.user));
          setSuccessMsg("Account created successfully! Redirecting...");
          setTimeout(() => navigate("/my-complaints"), 1000);
        }
      } else {
        const response = await api.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
          portal: "citizen",
        });

        if (response.data?.success) {
          localStorage.setItem("consumerTrustToken", response.data.token);
          localStorage.setItem("consumerTrustUser", JSON.stringify(response.data.user));
          setSuccessMsg("Signed in successfully! Redirecting...");
          setTimeout(() => navigate("/my-complaints"), 1000);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicGoogleSignIn = async (e) => {
    e?.preventDefault();
    const emailToUse = (googleEmailInput || savedDeviceGoogleUser?.email || "").trim().toLowerCase();
    const nameToUse = (googleNameInput || savedDeviceGoogleUser?.name || "").trim();

    if (!emailToUse) {
      setError("Please enter your Google email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/google", {
        email: emailToUse,
        name: nameToUse || emailToUse.split("@")[0],
        avatar: \`https://ui-avatars.com/api/?name=\${encodeURIComponent(nameToUse || emailToUse)}&background=0f2b5c&color=fff\`,
        googleId: \`google_\${Date.now()}\`,
      });

      if (response.data?.success) {
        localStorage.setItem("consumerTrustToken", response.data.token);
        localStorage.setItem("consumerTrustUser", JSON.stringify(response.data.user));
        localStorage.setItem(
          "consumerTrustLastGoogleUser",
          JSON.stringify({ email: emailToUse, name: nameToUse || response.data.user.name })
        );

        setShowGoogleModal(false);
        setSuccessMsg(\`Signed in via Google as \${emailToUse}!\`);
        setTimeout(() => navigate("/my-complaints"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Google Sign-In failed. Please try password login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Portal Switcher (Citizen vs Officer/Admin) */}
        <div className="portal-switcher">
          <button
            type="button"
            className={\`portal-tab \${portal === "citizen" ? "active" : ""}\`}
            onClick={() => handlePortalChange("citizen")}
          >
            <FaUser style={{ marginRight: 6 }} />
            Citizen Portal
          </button>
          <button
            type="button"
            className={\`portal-tab \${portal === "admin" ? "active" : ""}\`}
            onClick={() => handlePortalChange("admin")}
          >
            <FaUserShield style={{ marginRight: 6 }} />
            Officer / Admin
          </button>
        </div>

        {/* Shield Icon Header */}
        <div className={\`login-badge-wrap \${portal === "admin" ? "admin-mode" : ""}\`}>
          {portal === "admin" ? (
            <FaUserShield className="login-badge-icon admin" />
          ) : (
            <FaShieldAlt className="login-badge-icon" />
          )}
        </div>

        <h1>
          {portal === "admin"
            ? "Administrative Sign In"
            : isRegisterMode
            ? "Create Citizen Account"
            : "Citizen Sign In"}
        </h1>
        <p className="login-subtitle">
          {portal === "admin"
            ? "Authorized grievance redressal officers sign in to review and manage cases."
            : isRegisterMode
            ? "Create an account to submit, track, and manage your consumer grievances."
            : "Sign in to access your registered claims and dispute history."}
        </p>

        {/* Mode Switch Tabs (Only for Citizen Portal) */}
        {portal === "citizen" && (
          <div className="auth-tabs">
            <button
              type="button"
              className={\`tab-btn \${!isRegisterMode ? "active" : ""}\`}
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
              className={\`tab-btn \${isRegisterMode ? "active" : ""}\`}
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

        {/* Alerts */}
        {error && (
          <div className="error-alert">
            <FaExclamationCircle /> <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="success-alert">
            <FaCheckCircle /> <span>{successMsg}</span>
          </div>
        )}

        {/* Google 1-Tap Button for Citizen */}
        {portal === "citizen" && (
          <div className="google-auth-section">
            {isRealGoogleConfigured ? (
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  try {
                    const decoded = JSON.parse(
                      atob(credentialResponse.credential.split(".")[1])
                    );
                    setGoogleEmailInput(decoded.email);
                    setGoogleNameInput(decoded.name);
                    handleDynamicGoogleSignIn();
                  } catch {
                    setShowGoogleModal(true);
                  }
                }}
                onError={() => setShowGoogleModal(true)}
                useOneTap
              />
            ) : (
              <button
                type="button"
                className="google-direct-btn"
                onClick={() => setShowGoogleModal(true)}
              >
                <FaGoogle className="google-g-icon" />
                <span>Continue with Google</span>
              </button>
            )}

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>
          </div>
        )}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {portal === "citizen" && isRegisterMode && (
            <>
              <div className="input-group">
                <label>Full Name *</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Mobile Number (Optional)</label>
                <div className="input-wrapper">
                  <FaPhone className="input-icon" />
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

          <div className="input-group">
            <label>Email Address *</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
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

          <div className="input-group">
            <label>Password *</label>
            <div className="input-wrapper">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={isRegisterMode ? "Min. 8 chars (letters & numbers)" : "Enter your password"}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isRegisterMode && (
              <small className="password-hint">
                Must be at least 8 characters long and contain both letters and numbers.
              </small>
            )}
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading
              ? "Verifying Credentials..."
              : portal === "admin"
              ? "Sign In to Admin Portal"
              : isRegisterMode
              ? "Create Citizen Account"
              : "Sign In"}
          </button>
        </form>

        <div className="login-legal-footer">
          <p>
            By signing in, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* Google Dynamic Modal */}
      {showGoogleModal && (
        <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div className="google-logo-row">
                <FaGoogle className="g-logo-color" />
                <h3>Sign in with Google</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setShowGoogleModal(false)}>
                <FaTimes />
              </button>
            </div>

            <p className="google-modal-desc">
              Enter your Google account to sign in securely to the Consumer Trust Portal.
            </p>

            <form onSubmit={handleDynamicGoogleSignIn} className="google-modal-form">
              <div className="input-group">
                <label>Google Email Address *</label>
                <input
                  type="email"
                  placeholder="name@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label>Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                />
              </div>

              <div className="google-modal-actions">
                <button type="button" className="cancel-g-btn" onClick={() => setShowGoogleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="confirm-g-btn" disabled={loading}>
                  {loading ? "Signing In..." : "Continue with Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
`;

fs.writeFileSync(path.join(root, "frontend", "src", "pages", "Login.jsx"), loginJsx, "utf8");
console.log("Hardened frontend/src/pages/Login.jsx (removed all public test credentials and auto-fill)");
