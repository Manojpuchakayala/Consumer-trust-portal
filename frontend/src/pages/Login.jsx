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
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
            shape="pill"
            size="large"
            text={isRegisterMode ? "signup_with" : "signin_with"}
            width="100%"
          />
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
      </div>
    </div>
  );
}

export default Login;

