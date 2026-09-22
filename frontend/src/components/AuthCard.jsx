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
  FaFileAlt,
  FaBalanceScale,
  FaTimes,
  FaKey,
  FaPaperPlane,
  FaRedo,
} from "react-icons/fa";
import api from "../services/api";
import { triggerLoginNotification } from "../utils/notificationService";
import "./AuthCard.css";

export default function AuthCard({ initialMode = "signin", onAuthSuccess, showAdminSwitch = false }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Auth Mode: "password" | "otp" | "signup"
  const [authMode, setAuthMode] = useState(initialMode === "signup" ? "signup" : "password");
  const [portal, setPortal] = useState("citizen");

  // Form input state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  // Passwordless Email OTP state
  const [otpStep, setOtpStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP
  const [otpCode, setOtpCode] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP + New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState(null); // { isGoogleUser, notFound, wrongPassword }
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

  // Timer cooldown for OTP resend
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setErrorDetails(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("consumerTrustToken");
    localStorage.removeItem("consumerTrustUser");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const handleAuthSuccessRedirect = (authUser, authTitle) => {
    localStorage.setItem("consumerTrustToken", authUser.token);
    localStorage.setItem("consumerTrustUser", JSON.stringify(authUser.user));
    triggerLoginNotification(authUser.user, authTitle);
    window.dispatchEvent(new Event("authChange"));
    setSuccessMsg("Access verified. Redirecting...");
    setTimeout(() => {
      if (onAuthSuccess) onAuthSuccess(authUser.user);
      else if (authUser.user.role === "admin") navigate("/admin");
      else navigate("/my-complaints");
    }, 500);
  };

  // Submit Password Login or Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setErrorDetails(null);
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
          handleAuthSuccessRedirect(res.data, "Officer Clearance");
        }
      } else if (authMode === "signup") {
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
          handleAuthSuccessRedirect(res.data, "Account Registration");
        }
      } else {
        // Standard Password Citizen Login
        const res = await api.post("/auth/login", {
          email: formData.email.trim(),
          password: formData.password,
          portal: "citizen",
        });
        if (res.data?.success) {
          handleAuthSuccessRedirect(res.data, "Password Sign-In");
        }
      }
    } catch (err) {
      const data = err.response?.data;
      setError(data?.message || "Authentication failed. Please check your credentials.");
      setErrorDetails({
        isGoogleUser: data?.isGoogleUser,
        notFound: data?.notFound,
        wrongPassword: data?.wrongPassword,
      });
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Passwordless OTP Login: Step 1 Request Code
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (otpEmail || formData.email).trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      setError("Please enter a valid email address to receive your 6-digit login code.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/initiate-otp", { email: targetEmail });
      if (res.data?.success) {
        setOtpEmail(targetEmail);
        setOtpStep(2);
        setOtpCooldown(60);
        setSuccessMsg("6-digit verification code sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Passwordless OTP Login: Step 2 Verify Code
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setError("Please enter the 6-digit verification code received in your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/verify-otp", {
        email: otpEmail.trim().toLowerCase(),
        otp: otpCode.trim(),
      });
      if (res.data?.success) {
        handleAuthSuccessRedirect(res.data, "Email OTP Verification");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 1 Request Code
  const handleForgotRequestOtp = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail || !targetEmail.includes("@")) {
      setForgotError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setForgotError("");
    setForgotSuccess("");

    try {
      const res = await api.post("/auth/forgot-password", { email: targetEmail });
      if (res.data?.success) {
        setForgotStep(2);
        setForgotSuccess("Password reset code sent! Check your inbox.");
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to dispatch password reset code.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Step 2 Reset and Sign In
  const handleForgotResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
      setForgotError("Please enter the 6-digit reset code.");
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 8) {
      setForgotError("New password must be at least 8 characters with letters and numbers.");
      return;
    }

    setLoading(true);
    setForgotError("");

    try {
      const res = await api.post("/auth/reset-password", {
        email: forgotEmail.trim().toLowerCase(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });
      if (res.data?.success) {
        setShowForgotModal(false);
        handleAuthSuccessRedirect(res.data, "Password Reset & Sign-In");
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password. Please verify the code.");
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
      setErrorDetails(null);
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
        setShowGoogleModal(false);
        handleAuthSuccessRedirect(res.data, "Google OAuth 2.0");
      } else {
        throw new Error(res.data?.message || "Google Sign-In failed.");
      }
    } catch (err) {
      setGoogleModalError(
        err.response?.data?.message ||
          "Google authentication could not complete. Please confirm your Google email below."
      );
      if (decoded?.email) setGoogleInputEmail(decoded.email);
      if (decoded?.name) setGoogleInputName(decoded.name);
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
      setErrorDetails(null);
      const res = await api.post("/auth/google", {
        email: emailToUse,
        name: googleInputName.trim() || emailToUse.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleInputName || emailToUse)}`,
      });

      if (res.data?.success) {
        setShowGoogleModal(false);
        handleAuthSuccessRedirect(res.data, "Google Account Direct");
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
              setErrorDetails(null);
            }}
          >
            <FaUser /> Citizen Access
          </button>
          <button
            type="button"
            className={`portal-pill ${portal === "admin" ? "active" : ""}`}
            onClick={() => {
              setPortal("admin");
              setAuthMode("password");
              setError("");
              setErrorDetails(null);
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
            : authMode === "signup"
            ? "Create an Account"
            : authMode === "otp"
            ? "1-Click Email Code Sign In"
            : "Sign In to Consumer Trust"}
        </h3>
        <p>
          {portal === "admin"
            ? "Authorized grievance desk access to review and resolve dockets."
            : authMode === "signup"
            ? "Manage grievances, review case progress, and receive resolution records."
            : authMode === "otp"
            ? "Sign in securely with an instant 6-digit code sent to your email."
            : "Access your active grievances, track milestones, and view responses."}
        </p>
      </div>

      {portal === "citizen" && (
        <div className="auth-mode-switch three-tabs">
          <button
            type="button"
            className={`auth-mode-tab ${authMode === "password" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("password");
              setError("");
              setErrorDetails(null);
              setSuccessMsg("");
            }}
          >
            Password
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${authMode === "otp" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("otp");
              setError("");
              setErrorDetails(null);
              setSuccessMsg("");
              if (formData.email && !otpEmail) {
                setOtpEmail(formData.email);
              }
            }}
          >
            Email OTP
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${authMode === "signup" ? "active" : ""}`}
            onClick={() => {
              setAuthMode("signup");
              setError("");
              setErrorDetails(null);
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
          <div className="alert-content-wrap">
            <span>{error}</span>
            {/* Smart Contextual Action Buttons */}
            {errorDetails?.isGoogleUser && (
              <div className="alert-action-btns">
                <button
                  type="button"
                  className="btn-alert-action google"
                  onClick={() => {
                    setGoogleInputEmail(formData.email);
                    setShowGoogleModal(true);
                  }}
                >
                  <FaGoogle /> Sign In with Google
                </button>
                <button
                  type="button"
                  className="btn-alert-action otp"
                  onClick={() => {
                    setAuthMode("otp");
                    setOtpEmail(formData.email);
                    handleRequestOtp();
                  }}
                >
                  <FaPaperPlane /> Send Email Code
                </button>
              </div>
            )}
            {errorDetails?.notFound && (
              <div className="alert-action-btns">
                <button
                  type="button"
                  className="btn-alert-action primary"
                  onClick={() => {
                    setAuthMode("signup");
                    setError("");
                    setErrorDetails(null);
                  }}
                >
                  <FaUser /> Create Account Now
                </button>
              </div>
            )}
            {errorDetails?.wrongPassword && (
              <div className="alert-action-btns">
                <button
                  type="button"
                  className="btn-alert-action forgot"
                  onClick={() => {
                    setForgotEmail(formData.email);
                    setForgotStep(1);
                    setShowForgotModal(true);
                    setForgotError("");
                  }}
                >
                  <FaKey /> Reset Password via OTP
                </button>
                <button
                  type="button"
                  className="btn-alert-action otp"
                  onClick={() => {
                    setAuthMode("otp");
                    setOtpEmail(formData.email);
                    handleRequestOtp();
                  }}
                >
                  <FaPaperPlane /> Sign in with Email OTP
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="auth-alert success">
          <FaCheckCircle className="alert-icon" />
          <span>{successMsg}</span>
        </div>
      )}

      {portal === "citizen" && authMode !== "otp" && (
        <div className="google-auth-section">
          {isGoogleConfigured ? (
            <div className="google-login-container">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                shape="rectangular"
                size="large"
                theme="outline"
                text={authMode === "signup" ? "signup_with" : "signin_with"}
                width="100%"
              />
            </div>
          ) : (
            <button
              type="button"
              className="google-btn-custom"
              onClick={() => {
                setError("");
                setErrorDetails(null);
                setShowGoogleModal(true);
              }}
            >
              <FaGoogle className="google-icon" />
              <span>{authMode === "signup" ? "Sign up with Google" : "Continue with Google"}</span>
            </button>
          )}

          <div className="auth-divider">
            <span>or continue with email</span>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODE A: EMAIL OTP PASSWORDLESS LOGIN
          ------------------------------------------------------------- */}
      {portal === "citizen" && authMode === "otp" ? (
        <div className="otp-login-box">
          {otpStep === 1 ? (
            <form onSubmit={handleRequestOtp} className="auth-form">
              <div className="form-group">
                <label>Enter Your Email Address</label>
                <div className="input-box">
                  <FaEnvelope className="box-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <span className="input-hint">We will dispatch a 6-digit access code to this email.</span>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading || !otpEmail.trim()}>
                <FaPaperPlane /> {loading ? "Dispatching Code..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="form-group">
                <div className="label-row">
                  <label>6-Digit Verification Code</label>
                  <span
                    className="forgot-link"
                    onClick={() => {
                      setOtpStep(1);
                      setOtpCode("");
                    }}
                  >
                    Change email
                  </span>
                </div>
                <div className="input-box">
                  <FaKey className="box-icon" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    style={{ letterSpacing: "4px", fontSize: "16px", fontWeight: "bold" }}
                    required
                    autoFocus
                  />
                </div>
                <span className="input-hint">Sent to <strong>{otpEmail}</strong></span>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading || otpCode.length < 6}>
                {loading ? "Verifying Code..." : "Verify & Access Dashboard"}
              </button>

              <div className="resend-row">
                {otpCooldown > 0 ? (
                  <span className="cooldown-text">Resend code in {otpCooldown}s</span>
                ) : (
                  <button type="button" className="btn-resend-link" onClick={handleRequestOtp} disabled={loading}>
                    <FaRedo /> Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      ) : (
        /* -------------------------------------------------------------
            MODE B & C: STANDARD PASSWORD LOGIN OR SIGNUP
            ------------------------------------------------------------- */
        <form onSubmit={handleSubmit} className="auth-form">
          {portal === "citizen" && authMode === "signup" && (
            <>
              <div className="form-group">
                <label>Full Legal Name *</label>
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
            <label>Email Address *</label>
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
              <label>Password *</label>
              {authMode !== "signup" && portal === "citizen" && (
                <span
                  className="forgot-link"
                  onClick={() => {
                    setForgotEmail(formData.email);
                    setForgotStep(1);
                    setForgotError("");
                    setForgotSuccess("");
                    setShowForgotModal(true);
                  }}
                >
                  Forgot password?
                </span>
              )}
            </div>
            <div className="input-box">
              <FaLock className="box-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={authMode === "signup" ? "Min. 8 characters (letters & numbers)" : "Enter your password"}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
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
              : authMode === "signup"
              ? "Create Account"
              : "Sign In"}
          </button>
        </form>
      )}

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

      {/* -------------------------------------------------------------
          FORGOT PASSWORD MODAL
          ------------------------------------------------------------- */}
      {showForgotModal && (
        <div className="google-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="google-modal-header">
              <div className="google-modal-logo">
                <FaKey style={{ color: "#2563eb" }} />
                <span>Reset Account Password</span>
              </div>
              <button
                type="button"
                className="google-modal-close"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="google-modal-body">
              {forgotError && (
                <div className="auth-alert error" style={{ margin: "0" }}>
                  <FaExclamationCircle className="alert-icon" />
                  <span>{forgotError}</span>
                </div>
              )}
              {forgotSuccess && (
                <div className="auth-alert success" style={{ margin: "0" }}>
                  <FaCheckCircle className="alert-icon" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequestOtp} className="auth-form">
                  <div className="form-group">
                    <label>Registered Account Email</label>
                    <div className="input-box">
                      <FaEnvelope className="box-icon" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotError("");
                        }}
                        required
                        autoFocus
                      />
                    </div>
                    <span className="input-hint">We will dispatch a 6-digit reset code to this email.</span>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading || !forgotEmail.trim()}>
                    <FaPaperPlane /> {loading ? "Dispatching Code..." : "Send Password Reset Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotResetPassword} className="auth-form">
                  <div className="form-group">
                    <label>6-Digit Verification Code</label>
                    <div className="input-box">
                      <FaKey className="box-icon" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        style={{ letterSpacing: "4px", fontSize: "16px", fontWeight: "bold" }}
                        required
                        autoFocus
                      />
                    </div>
                    <span className="input-hint">Check code sent to <strong>{forgotEmail}</strong></span>
                  </div>

                  <div className="form-group">
                    <label>New Password (Min. 8 characters with letters & numbers)</label>
                    <div className="input-box">
                      <FaLock className="box-icon" />
                      <input
                        type={forgotShowPassword ? "text" : "password"}
                        placeholder="Enter new strong password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="pwd-toggle"
                        onClick={() => setForgotShowPassword(!forgotShowPassword)}
                        tabIndex={-1}
                      >
                        {forgotShowPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-submit-btn" disabled={loading || forgotOtp.length < 6 || forgotNewPassword.length < 8}>
                    {loading ? "Resetting Password..." : "Set New Password & Sign In"}
                  </button>

                  <div className="resend-row">
                    <button type="button" className="btn-resend-link" onClick={handleForgotRequestOtp} disabled={loading}>
                      <FaRedo /> Resend Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DIRECT GOOGLE SIGN-IN DIALOG / MODAL
          ------------------------------------------------------------- */}
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
