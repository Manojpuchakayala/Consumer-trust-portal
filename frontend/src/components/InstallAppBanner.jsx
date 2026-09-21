import { useState, useEffect } from "react";
import { FaShieldAlt, FaDownload, FaTimes } from "react-icons/fa";
import "./InstallAppBanner.css";

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if previously dismissed
    const dismissed = localStorage.getItem("ctp_pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("ctp_pwa_dismissed", Date.now().toString());
  };

  if (!visible) return null;

  return (
    <div className="pwa-banner-root" role="alert">
      <div className="pwa-banner-content">
        <div className="pwa-icon-wrap">
          <FaShieldAlt className="pwa-shield" />
        </div>
        <div className="pwa-text-wrap">
          <strong>Install Consumer Trust App</strong>
          <span>Add to your Home Screen for instant offline case tracking and alerts.</span>
        </div>
        <div className="pwa-actions-group">
          <button type="button" className="btn-pwa-install" onClick={handleInstallClick}>
            <FaDownload /> Install App
          </button>
          <button type="button" className="btn-pwa-close" onClick={handleDismiss} aria-label="Dismiss">
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
}
