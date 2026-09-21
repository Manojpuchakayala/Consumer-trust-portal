import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaShieldAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaClipboardList,
  FaUserShield,
  FaMoon,
  FaSun,
  FaGlobe,
  FaBuilding,
  FaSearch,
  FaFileAlt,
  FaBell,
  FaCheckDouble,
  FaTrash,
  FaExternalLinkAlt,
  FaUsers,
} from "react-icons/fa";
import { LANGUAGES, t } from "../utils/translations";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  clearAllNotifications,
  getUnreadCount,
} from "../utils/notificationService";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("consumerTrustTheme") === "dark";
  });
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem("consumerTrustLang") || "en";
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const langRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("consumerTrustTheme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("consumerTrustTheme", "light");
    }
  }, [darkMode]);

  const handleLangChange = (code) => {
    setCurrentLang(code);
    localStorage.setItem("consumerTrustLang", code);
    setLangMenuOpen(false);
    window.dispatchEvent(new Event("langChange"));
  };

  const loadNotifications = () => {
    const list = getNotifications();
    setNotifications(list);
    setUnreadCount(getUnreadCount());
  };

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("consumerTrustUser");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    loadNotifications();

    window.addEventListener("storage", checkUser);
    window.addEventListener("authChange", checkUser);
    window.addEventListener("notificationChange", loadNotifications);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("authChange", checkUser);
      window.removeEventListener("notificationChange", loadNotifications);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("consumerTrustToken");
    localStorage.removeItem("consumerTrustUser");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
  };

  const handleToggleNotif = () => {
    setNotifMenuOpen((prev) => !prev);
    if (langMenuOpen) setLangMenuOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadNotifications();
  };

  const handleClearAllNotifs = () => {
    clearAllNotifications();
    loadNotifications();
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    loadNotifications();
    setNotifMenuOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const diffMs = Date.now() - new Date(dateString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 45) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const isAuthorizedAdmin = user && user.role === "admin";
  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-icon-wrap">
            <FaShieldAlt className="logo-shield" />
          </div>
          <div className="logo-text">
            <span className="logo-title">Consumer Trust</span>
            <span className="logo-sub">Dispute Facilitation</span>
          </div>
        </Link>

        {/* Mobile Action Controls */}
        <div className="mobile-actions">
          {/* Mobile Notification Bell */}
          <button
            type="button"
            className="notif-toggle-btn mobile"
            onClick={handleToggleNotif}
            aria-label="Toggle notifications"
          >
            <FaBell />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          <button
            type="button"
            className="theme-btn mobile"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Theme"
          >
            {darkMode ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className={`nav-links-wrap ${menuOpen ? "open" : ""}`}>
          <ul className="nav-menu-list">
            <li>
              <Link
                to="/"
                className={`nav-link ${isActive("/") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {t("nav_home", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className={`nav-link ${isActive("/register") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <FaFileAlt className="nav-icon" />
                {t("nav_register", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className={`nav-link ${isActive("/track") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <FaSearch className="nav-icon" />
                {t("nav_track", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/brands"
                className={`nav-link ${isActive("/brands") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <FaBuilding className="nav-icon" />
                {t("nav_brands", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/class-actions"
                className={`nav-link ${isActive("/class-actions") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <FaUsers className="nav-icon" />
                Class Actions
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/my-complaints"
                  className={`nav-link ${isActive("/my-complaints") ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FaClipboardList className="nav-icon" />
                  {t("nav_my_complaints", currentLang)}
                </Link>
              </li>
            )}
            {isAuthorizedAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`nav-link admin-link ${isActive("/admin") ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FaUserShield className="nav-icon" />
                  {t("nav_admin", currentLang)}
                </Link>
              </li>
            )}
          </ul>

          {/* Right Action Controls */}
          <div className="nav-actions">
            {/* Notification Bell Dropdown */}
            <div className="notif-menu-wrapper" ref={notifRef}>
              <button
                type="button"
                className="notif-toggle-btn desktop"
                onClick={handleToggleNotif}
                title="View Notifications & Activity"
                aria-label="Notifications"
              >
                <FaBell className="notif-icon" />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
              </button>

              {notifMenuOpen && (
                <div className="notif-dropdown-panel">
                  <div className="notif-panel-header">
                    <div className="notif-header-title">
                      <FaBell className="header-bell-icon" />
                      <strong>Notifications & Alerts</strong>
                      {unreadCount > 0 && <span className="unread-tag">{unreadCount} new</span>}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className="btn-mark-read"
                        onClick={handleMarkAllRead}
                        title="Mark all notifications as read"
                      >
                        <FaCheckDouble /> Mark read
                      </button>
                    )}
                  </div>

                  <div className="notif-items-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty-state">
                        <FaBell className="empty-bell-icon" />
                        <p>No notifications yet.</p>
                        <span>Login events, case updates, and dispute milestones will appear here.</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.read ? "unread" : ""} ${n.type}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className="notif-item-icon-wrap">
                            {n.type === "login" ? (
                              <FaUserShield className="item-icon login" />
                            ) : n.type === "success" ? (
                              <FaShieldAlt className="item-icon success" />
                            ) : (
                              <FaBell className="item-icon default" />
                            )}
                          </div>
                          <div className="notif-item-content">
                            <div className="notif-item-top">
                              <strong className="item-title">{n.title}</strong>
                              <span className="item-time">{formatTimeAgo(n.createdAt)}</span>
                            </div>
                            <p className="item-message">{n.message}</p>
                            {n.link && (
                              <span className="item-link-hint">
                                Open &rarr;
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="notif-panel-footer">
                      <button
                        type="button"
                        className="btn-clear-notifs"
                        onClick={handleClearAllNotifs}
                      >
                        <FaTrash /> Clear all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="lang-menu-wrapper" ref={langRef}>
              <button
                type="button"
                className="lang-toggle-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="Select language"
              >
                <FaGlobe className="globe-icon" />
                <span>{LANGUAGES.find((l) => l.code === currentLang)?.label.split(" ")[0]}</span>
              </button>

              {langMenuOpen && (
                <div className="lang-dropdown-menu">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-dropdown-item ${currentLang === lang.code ? "selected" : ""}`}
                      onClick={() => handleLangChange(lang.code)}
                    >
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="theme-btn desktop"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <FaSun className="icon-sun" /> : <FaMoon className="icon-moon" />}
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="user-profile-pill">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="user-pill-avatar"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <FaUserCircle className="user-pill-icon" />
                )}
                <span className="user-pill-name">{user.name ? user.name.split(" ")[0] : "Citizen"}</span>
                <button
                  type="button"
                  className="user-pill-logout"
                  onClick={handleLogout}
                  title="Sign out"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-signin-btn" onClick={() => setMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
