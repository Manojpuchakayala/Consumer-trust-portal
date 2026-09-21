import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { LANGUAGES, t } from "../utils/translations";
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
    window.addEventListener("storage", checkUser);
    window.addEventListener("authChange", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("authChange", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("consumerTrustToken");
    localStorage.removeItem("consumerTrustUser");
    setUser(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/");
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
            {/* Language Selector */}
            <div className="lang-menu-wrapper">
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
