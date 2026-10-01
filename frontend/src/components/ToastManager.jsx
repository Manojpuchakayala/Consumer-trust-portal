import { useState, useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "../utils/toast";
import "./ToastManager.css";

export default function ToastManager() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, newToast.duration || 4000);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-bubble ${t.type}`}>
          <div className="toast-icon">
            {t.type === "success" && <FaCheckCircle />}
            {t.type === "error" && <FaExclamationCircle />}
            {t.type === "warning" && <FaExclamationTriangle />}
            {t.type === "info" && <FaInfoCircle />}
          </div>
          <div className="toast-content">{t.message}</div>
          <button
            type="button"
            className="toast-close-btn"
            onClick={() => removeToast(t.id)}
            aria-label="Close notification"
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  );
}
