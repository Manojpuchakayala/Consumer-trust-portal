import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaUserShield,
  FaUser,
  FaTimes,
  FaBell,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import "./NotificationToast.css";

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleLoginAlert = (e) => {
      const { user, roleLabel, authMethod, timeStr } = e.detail || {};
      if (!user) return;

      const newToast = {
        id: `login_${Date.now()}`,
        type: "login",
        title: `Welcome back, ${user.name ? user.name.split(" ")[0] : "Citizen"}!`,
        message: `Signed in as ${roleLabel} (${authMethod}) at ${timeStr}.`,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
        link: user.role === "admin" ? "/admin" : "/my-complaints",
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);
    };

    const handleToastAlert = (e) => {
      const notif = e.detail;
      if (!notif) return;

      // Don't duplicate if loginAlert already handled it
      if (notif.type === "login") return;

      const newToast = {
        id: notif.id || `toast_${Date.now()}`,
        type: notif.type || "info",
        title: notif.title,
        message: notif.message,
        link: notif.link,
        createdAt: Date.now(),
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]);
    };

    window.addEventListener("loginAlert", handleLoginAlert);
    window.addEventListener("toastAlert", handleToastAlert);

    return () => {
      window.removeEventListener("loginAlert", handleLoginAlert);
      window.removeEventListener("toastAlert", handleToastAlert);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container-root" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    if (toast.type === "login") {
      return toast.role === "admin" ? (
        <div className="toast-icon-badge admin">
          <FaUserShield />
        </div>
      ) : (
        <div className="toast-icon-badge citizen">
          <FaShieldAlt />
        </div>
      );
    }
    if (toast.type === "success") {
      return (
        <div className="toast-icon-badge success">
          <FaCheckCircle />
        </div>
      );
    }
    if (toast.type === "warning") {
      return (
        <div className="toast-icon-badge warning">
          <FaExclamationTriangle />
        </div>
      );
    }
    return (
      <div className="toast-icon-badge info">
        <FaBell />
      </div>
    );
  };

  return (
    <div className={`toast-card ${toast.type}`}>
      <div className="toast-body-row">
        {toast.avatar ? (
          <img
            src={toast.avatar}
            alt="User avatar"
            className="toast-user-avatar"
            referrerPolicy="no-referrer"
          />
        ) : (
          getIcon()
        )}

        <div className="toast-text-content">
          <div className="toast-header-row">
            <strong className="toast-title">{toast.title}</strong>
            <span className="toast-time-tag">Just now</span>
          </div>
          <p className="toast-message">{toast.message}</p>
          {toast.link && (
            <Link to={toast.link} className="toast-action-link" onClick={onDismiss}>
              View details &rarr;
            </Link>
          )}
        </div>

        <button
          type="button"
          className="toast-close-btn"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <FaTimes />
        </button>
      </div>
      <div className="toast-progress-bar" />
    </div>
  );
}
