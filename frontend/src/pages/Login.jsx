import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaShieldAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRegisterMode, setIsRegisterMode] = useState(
    searchParams.get("mode") === "signup"
  );

  // Form State
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        {/* Shield Icon Header */}
        <div className="login-badge-wrap">
          <FaShieldAlt className="login-badge-icon" />
        </div>

        <h1>{isRegisterMode ? "Create Account" : "Sign In"}</h1>
        <p className="login-subtitle">
          {isRegisterMode
            ? "Sign up to file and track consumer grievances."
            : "Sign in to access your complaints and redressal records."}
        </p>

        {/* Simple Sign In / Sign Up Mode Switch Tabs */}
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
          <span>OR CONTINUE WITH EMAIL</span>
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

        {/* Simple & Clean Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isRegisterMode && (
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
                placeholder="Email Address"
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
                placeholder={
                  isRegisterMode
                    ? "Password (minimum 6 characters)"
                    : "Password"
                }
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

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegisterMode
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>

        {/* Clean Footer Link */}
        <div className="login-footer-info">
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
        </div>
      </div>
    </div>
  );
}

export default Login;
