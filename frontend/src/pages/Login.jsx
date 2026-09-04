import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  FaEye,
  FaEyeSlash,
  FaUserShield,
} from "react-icons/fa";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminParam = searchParams.get("role") === "admin";
  const [isRegisterMode, setIsRegisterMode] = useState(
    searchParams.get("mode") === "signup"
  );

  // Step: 'credentials' or '2fa'
  const [authStep, setAuthStep] = useState("credentials");

  // Form State
  const [formData, setFormData] = useState({
    name: isAdminParam ? "System Administrator" : "",
    email: isAdminParam ? "admin@consumertrust.gov" : "",
    password: isAdminParam ? "Admin@123" : "",
    phone: "",
    role: isAdminParam ? "admin" : "user",
  });

  // 2FA State
  const [tempToken, setTempToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  useEffect(() => {
    if (isAdminParam) {
      setSuccessMsg("Administrator mode selected. Pre-filled admin credentials — click 'Sign In' below.");
    }
  }, [isAdminParam]);

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
            requestedRole: formData.role,
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
      const errData = err.response?.data;
      const errMsg =
        errData?.message ||
        err.message ||
        "Authentication failed. Please check your credentials.";

      // Seamless Auto-Recovery: If user is on Sign Up but account already exists
      if (
        isRegisterMode &&
        (errData?.code === "USER_EXISTS" ||
          errMsg.toLowerCase().includes("already exists"))
      ) {
        setIsRegisterMode(false);
        // Automatically attempt login since user already entered their credentials!
        try {
          const loginResp = await api.post("/auth/login", {
            email: formData.email,
            password: formData.password,
          });

          if (loginResp.data?.requires2FA) {
            setTempToken(loginResp.data.tempToken);
            setUserEmail(loginResp.data.email || formData.email);
            setDevOtp(loginResp.data.devOtp || "");
            setAuthStep("2fa");
            setCountdown(60);
            setCanResend(false);
            setSuccessMsg("Account found! Switched to Sign In & verification code sent.");
            return;
          } else if (loginResp.data?.token) {
            handleAuthSuccess(loginResp.data);
            return;
          }
        } catch (loginErr) {
          setError(
            loginErr.response?.data?.message ||
              "An account with this email already exists. We switched you to Sign In — please check your password."
          );
          return;
        }
      }

      setError(errMsg);
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
              {(userEmail.endsWith("@consumertrust.gov") ||
                userEmail.endsWith("@consumertrust.com")) && (
                <span style={{ display: "block", marginTop: "6px", fontSize: "12px", color: "#1565c0", fontWeight: "600" }}>
                  ℹ️ Admin OTP forwarded to your Gmail (manojpuchakayala321@gmail.com)
                </span>
              )}
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
                <FaExclamationCircle />
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                  <span>{error}</span>
                  {(isRegisterMode || error.toLowerCase().includes("already exists")) && (
                    <button
                      type="button"
                      className="switch-tab-inline-btn"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setError("");
                        setSuccessMsg("Switched to Sign In. Enter your password to continue.");
                      }}
                    >
                      👉 Click here to switch to Sign In
                    </button>
                  )}
                </div>
              </div>
            )}

            {successMsg && !error && (
              <div className="login-success">
                <FaCheckCircle /> <span>{successMsg}</span>
              </div>
            )}

            {/* Quick Demo Credentials Presets */}
            <div className="quick-access-box">
              <span className="quick-access-title">1-Click Quick Fill:</span>
              <div className="quick-chips-row">
                <button
                  type="button"
                  className="quick-chip citizen-chip"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError("");
                    setSuccessMsg("Loaded Customer credentials. Click 'Sign In' below to access Citizen Portal.");
                    setFormData((prev) => ({
                      ...prev,
                      email: "consumer@consumertrust.gov",
                      password: "Consumer@123",
                      role: "user",
                    }));
                  }}
                  title="Fill Customer demo credentials"
                >
                  <FaUser style={{ marginRight: 6 }} /> Customer Account
                </button>
                <button
                  type="button"
                  className="quick-chip admin-chip"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setError("");
                    setSuccessMsg("Loaded Administrator credentials. Click 'Sign In' below to access Admin Control Center.");
                    setFormData((prev) => ({
                      ...prev,
                      email: "admin@consumertrust.gov",
                      password: "Admin@123",
                      role: "admin",
                    }));
                  }}
                  title="Fill Administrator demo credentials"
                >
                  <FaUserShield style={{ marginRight: 6 }} /> Admin Account
                </button>
              </div>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="login-form">
              {!isRegisterMode && (
                <div className="signin-role-toggle">
                  <span className="signin-role-label">Sign in to portal as:</span>
                  <div className="signin-role-buttons">
                    <button
                      type="button"
                      className={`signin-role-btn ${formData.role === "user" ? "active" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, role: "user" }))}
                    >
                      <FaUser style={{ marginRight: 6 }} /> Customer / Consumer
                    </button>
                    <button
                      type="button"
                      className={`signin-role-btn ${formData.role === "admin" ? "active" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, role: "admin" }))}
                    >
                      <FaUserShield style={{ marginRight: 6 }} /> Administrator
                    </button>
                  </div>
                </div>
              )}
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
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password (minimum 6 characters)"
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
                    setSuccessMsg("");
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
