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
} from "react-icons/fa";
import api from "../services/api";
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

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google Sign-In is temporarily unavailable. Please try again later or sign in with email.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });
      if (res.data?.success) {
        localStorage.setItem("consumerTrustToken", res.data.token);
        localStorage.setItem("consumerTrustUser", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("authChange"));
        setSuccessMsg(`Welcome, ${res.data.user.name}. Redirecting...`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.data.user);
          else navigate("/my-complaints");
        }, 500);
      } else {
        throw new Error(res.data?.message || "Google Sign-In failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google Sign-In is temporarily unavailable. Please try again later or sign in with email."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In is temporarily unavailable. Please try again later or sign in with email.");
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
                setError("Google Sign-In is temporarily unavailable. Please try again later or sign in with email.");
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
    </div>
  );
}
