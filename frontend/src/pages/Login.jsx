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
  FaInfoCircle,
  FaGoogle,
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
          window.dispatchEvent(new Event("authChange"));
          setSuccessMsg("Administrator clearance verified! Redirecting...");
          setTimeout(() => navigate("/admin"), 800);
        }
      } else if (isRegisterMode) {
        if (!formData.name || !formData.email || !formData.password) {
          setError("Please fill in all required fields.");
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
          window.dispatchEvent(new Event("authChange"));
          setSuccessMsg("Account created successfully! Redirecting...");
          setTimeout(() => navigate("/my-complaints"), 800);
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
          window.dispatchEvent(new Event("authChange"));
          setSuccessMsg("Signed in successfully! Redirecting...");
          setTimeout(() => navigate("/my-complaints"), 800);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = Boolean(
    googleClientId &&
    !googleClientId.includes("example.apps.googleusercontent.com") &&
    !googleClientId.includes("unconfigured.apps.googleusercontent.com") &&
    googleClientId.includes(".apps.googleusercontent.com")
  );

  // Official Google OAuth 2.0 Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google Sign-In is temporarily unavailable. Please try again later or sign in with email.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      if (response.data?.success) {
        localStorage.setItem("consumerTrustToken", response.data.token);
        localStorage.setItem("consumerTrustUser", JSON.stringify(response.data.user));
        window.dispatchEvent(new Event("authChange"));
        setSuccessMsg(`Welcome, ${response.data.user.name}! Redirecting...`);
        setTimeout(() => navigate("/my-complaints"), 800);
      } else {
        throw new Error(response.data?.message || "Google Sign-In is temporarily unavailable. Please try again later or sign in with email.");
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

  return (
    <div className="login-page">
      <div className="login-card-container">
        {/* Portal Switcher */}
        <div className="login-portal-toggle">
          <button
            type="button"
            className={`portal-toggle-btn ${portal === "citizen" ? "active" : ""}`}
            onClick={() => handlePortalChange("citizen")}
          >
            <FaUser />
            <span>Citizen Portal</span>
          </button>
          <button
            type="button"
            className={`portal-toggle-btn ${portal === "admin" ? "active" : ""}`}
            onClick={() => handlePortalChange("admin")}
          >
            <FaUserShield />
            <span>Officer / Admin</span>
          </button>
        </div>

        {/* Header Badge */}
        <div className={`login-icon-badge ${portal === "admin" ? "admin" : ""}`}>
          {portal === "admin" ? <FaUserShield /> : <FaShieldAlt />}
        </div>

        <h1 className="login-heading">
          {portal === "admin"
            ? "Administrative Portal"
            : isRegisterMode
            ? "Create Citizen Account"
            : "Citizen Sign In"}
        </h1>
        <p className="login-subheading">
          {portal === "admin"
            ? "Authorized grievance redressal officers sign in to manage cases and review responses."
            : isRegisterMode
            ? "Register to file grievances, upload evidence, and monitor live resolution milestones."
            : "Sign in to manage your consumer grievances and review resolution settlements."}
        </p>

        {/* Mode Tabs for Citizen */}
        {portal === "citizen" && (
          <div className="login-mode-tabs">
            <button
              type="button"
              className={`mode-tab ${!isRegisterMode ? "active" : ""}`}
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
              className={`mode-tab ${isRegisterMode ? "active" : ""}`}
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

        {/* Alerts */}
        {error && (
          <div className="login-alert error">
            <FaExclamationCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="login-alert success">
            <FaCheckCircle className="alert-icon" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Official Google OAuth Sign-In (Citizen Portal Only) */}
        {portal === "citizen" && (
          <div className="google-oauth-wrap">
            <div className="google-btn-container">
              {isGoogleConfigured ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  shape="pill"
                  size="large"
                  theme="outline"
                  text={isRegisterMode ? "signup_with" : "signin_with"}
                  width="100%"
                />
              ) : (
                <button
                  type="button"
                  className="google-fallback-btn"
                  onClick={() => {
                    setError("Google Sign-In is temporarily unavailable. Please try again later or sign in with email.");
                  }}
                  title="Sign in with Google"
                >
                  <FaGoogle className="google-icon-colored" />
                  <span>{isRegisterMode ? "Sign up with Google" : "Sign in with Google"}</span>
                </button>
              )}
            </div>

            <div className="login-or-divider">
              <span>or continue with email</span>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="login-form-fields">
          {portal === "citizen" && isRegisterMode && (
            <>
              <div className="form-field">
                <label>Full Name *</label>
                <div className="field-input-wrap">
                  <FaUser className="field-icon" />
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

              <div className="form-field">
                <label>Mobile Number (Optional)</label>
                <div className="field-input-wrap">
                  <FaPhone className="field-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-field">
            <label>Email Address *</label>
            <div className="field-input-wrap">
              <FaEnvelope className="field-icon" />
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

          <div className="form-field">
            <label>Password *</label>
            <div className="field-input-wrap">
              <FaLock className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={isRegisterMode ? "Min. 8 characters (letters & numbers)" : "Enter your password"}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {isRegisterMode && (
              <span className="field-hint">
                <FaInfoCircle style={{ fontSize: 11, marginRight: 4 }} />
                Must be at least 8 characters long and contain both letters and numbers.
              </span>
            )}
          </div>

          <button type="submit" className="login-action-btn" disabled={loading}>
            {loading
              ? "Verifying..."
              : portal === "admin"
              ? "Sign In to Admin Portal"
              : isRegisterMode
              ? "Create Citizen Account"
              : "Sign In"}
          </button>
        </form>

        <div className="login-footer-links">
          <p>
            Protected by independent mediation protocols. Read our{" "}
            <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
