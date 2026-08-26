import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaShieldAlt,
  FaExclamationCircle,
  FaKey,
  FaArrowLeft,
  FaCheckCircle,
  FaCopy,
  FaRedoAlt,
} from "react-icons/fa";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Step: 'credentials' or '2fa'
  const [authStep, setAuthStep] = useState("credentials");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  // 2FA State
  const [tempToken, setTempToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRefs = useRef([]);

  // Countdown timer for 2FA Resend
  useEffect(() => {
    let timer;
    if (authStep === "2fa" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Submit Email/Password -> Triggers 2FA
  const handleCredentialsSubmit = async (e) => {
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
            role: formData.role,
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const response = await api.post(endpoint, payload);

      if (response.data?.requires2FA) {
        setTempToken(response.data.tempToken);
        setUserEmail(response.data.email || formData.email);
        setDevOtp(response.data.devOtp || "");
        setAuthStep("2fa");
        setCountdown(60);
        setCanResend(false);
        setSuccessMsg("Security verification code sent! Please enter the 6-digit code.");
      } else if (response.data?.token) {
        // Direct login if 2FA not required
        handleAuthSuccess(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 6-Digit OTP
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste of 6 digits
      const pastedDigits = value.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      pastedDigits.forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setOtpDigits(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto advance focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        tempToken,
        email: userEmail,
        otp: fullOtp,
      });

      if (response.data?.token) {
        handleAuthSuccess(response.data);
      } else {
        throw new Error(response.data?.message || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await api.post("/auth/resend-otp", {
        tempToken,
        email: userEmail,
      });

      setDevOtp(response.data.devOtp || "");
      setCountdown(60);
      setCanResend(false);
      setOtpDigits(["", "", "", "", "", ""]);
      setSuccessMsg("A fresh 6-digit verification code has been dispatched!");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code");
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
      setError(err.response?.data?.message || "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Sign-In popup was closed or unavailable. Please check your Google OAuth credentials.");
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

  const copyDevOtp = () => {
    if (devOtp) {
      navigator.clipboard.writeText(devOtp);
      const digits = devOtp.split("");
      setOtpDigits(digits);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2500);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-badge-wrap">
          <FaShieldAlt className="login-badge-icon" />
        </div>

        {authStep === "2fa" ? (
          /* ================= TWO-STEP VERIFICATION SCREEN ================= */
          <div className="two-step-container">
            <button
              type="button"
              className="back-step-btn"
              onClick={() => {
                setAuthStep("credentials");
                setError("");
                setSuccessMsg("");
              }}
            >
              <FaArrowLeft /> Back to Login
            </button>

            <div className="key-icon-box">
              <FaKey />
            </div>

            <h1>Two-Step Verification</h1>
            <p className="login-subtitle">
              We have sent a 6-digit security verification code to{" "}
              <strong>{userEmail}</strong>.
            </p>

            {devOtp && (
              <div className="dev-otp-card">
                <div className="dev-otp-header">
                  <FaCheckCircle className="check-icon" />
                  <span>Security Code (Dev Mode):</span>
                </div>
                <div className="dev-otp-row">
                  <span className="dev-otp-digits">{devOtp}</span>
                  <button
                    type="button"
                    className="dev-copy-btn"
                    onClick={copyDevOtp}
                  >
                    <FaCopy /> {copiedOtp ? "Filled!" : "Auto-Fill Code"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="login-error">
                <FaExclamationCircle /> <span>{error}</span>
              </div>
            )}

            {successMsg && !error && (
              <div className="login-success">
                <FaCheckCircle /> <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="otp-form">
              <div className="otp-inputs-grid">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value)}
                    className="otp-digit-box"
                    autoFocus={idx === 0}
                    required
                  />
                ))}
              </div>

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? "Verifying Security Code..." : "Verify & Complete Login"}
              </button>

              <div className="resend-box">
                {canResend ? (
                  <button
                    type="button"
                    className="resend-link"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    <FaRedoAlt /> Resend Code
                  </button>
                ) : (
                  <span className="timer-text">
                    Resend code in <strong>{countdown}s</strong>
                  </span>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* ================= CREDENTIALS SCREEN ================= */
          <>
            <h1>{isRegisterMode ? "Create Consumer Account" : "Portal Access Login"}</h1>
            <p className="login-subtitle">
              {isRegisterMode
                ? "Sign up with email or continue instantly with Google."
                : "Sign in with your verified credentials or Google account."}
            </p>

            {/* Mode Switch Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`tab-btn ${!isRegisterMode ? "active" : ""}`}
                onClick={() => {
                  setIsRegisterMode(false);
                  setError("");
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
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Official Google Sign-In */}
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
              <span>OR WITH EMAIL & PASSWORD</span>
            </div>

            {error && (
              <div className="login-error">
                <FaExclamationCircle /> <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="login-form">
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
                    type="password"
                    name="password"
                    placeholder="Password (minimum 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div className="role-selector">
                  <label>Account Role:</label>
                  <div className="role-options">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={formData.role === "user"}
                        onChange={handleChange}
                      />
                      <span>Consumer</span>
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="role"
                        value="admin"
                        checked={formData.role === "admin"}
                        onChange={handleChange}
                      />
                      <span>Administrator</span>
                    </label>
                  </div>
                </div>
              )}

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading
                  ? "Processing..."
                  : isRegisterMode
                  ? "Continue with Two-Step Setup"
                  : "Sign In (with 2FA)"}
              </button>
            </form>

            <div className="login-footer-info">
              <p>
                {isRegisterMode ? "Already have an account?" : "Need a consumer account?"}{" "}
                <button
                  type="button"
                  className="toggle-link"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError("");
                  }}
                >
                  {isRegisterMode ? "Sign In here" : "Sign Up now"}
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
