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
} from "react-icons/fa";
import { LANGUAGES, t } from "../utils/translations";
import "./Navbar.css";

function Navbar() {
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
        } catch (e) {
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

  const AUTHORIZED_ADMIN_EMAILS = [
    "manojpuchakayala321@gmail.com",
    "admin@consumertrust.gov",
  ];

  const userEmail = (user?.email || "").toLowerCase().trim();
  const isAuthorizedAdmin =
    user && user.role === "admin" && AUTHORIZED_ADMIN_EMAILS.includes(userEmail);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-badge">
            <FaShieldAlt className="logo-icon" />
          </div>
          <div className="logo-text">
            <span className="brand-name">Consumer Trust</span>
            <span className="tagline">Grievance Redressal Cell</span>
          </div>
        </Link>

        {/* Mobile Controls Wrap */}
        <div className="mobile-controls-wrap">
          <button
            type="button"
            className="theme-toggle-btn mobile-only"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
          </button>

          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Navigation & Actions */}
        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={isActive("/") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {t("nav_home", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className={isActive("/register") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {t("nav_register", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className={isActive("/track") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {t("nav_track", currentLang)}
              </Link>
            </li>
            <li>
              <Link
                to="/brands"
                className={`brands-nav-link ${isActive("/brands") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <FaBuilding style={{ marginRight: 6 }} />
                {t("nav_brands", currentLang)}
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  to="/my-complaints"
                  className={isActive("/my-complaints") ? "active" : ""}
                  onClick={() => setMenuOpen(false)}
                >
                  <FaClipboardList style={{ marginRight: 6 }} />
                  {t("nav_my_complaints", currentLang)}
                </Link>
              </li>
            )}
            {isAuthorizedAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`admin-link ${isActive("/admin") ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <FaUserShield style={{ marginRight: 6 }} />
                  {t("nav_admin", currentLang)}
                </Link>
              </li>
            )}
          </ul>

          <div className="nav-extra-controls">
            {/* Language Selector */}
            <div className="lang-selector-wrap">
              <button
                type="button"
                className="lang-btn"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="Select Language"
              >
                <FaGlobe className="globe-icon" />
                <span>{LANGUAGES.find((l) => l.code === currentLang)?.label.split(" ")[0]}</span>
              </button>

              {langMenuOpen && (
                <div className="lang-dropdown">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`lang-option ${currentLang === lang.code ? "selected" : ""}`}
                      onClick={() => handleLangChange(lang.code)}
                    >
                      <span className="flag">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              className="theme-toggle-btn desktop-only"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <FaSun className="sun-icon" /> : <FaMoon className="moon-icon" />}
            </button>
          </div>

          <div className="auth-section">
            {user ? (
              <div className="user-profile">
                <div className="user-info">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="user-avatar-img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FaUserCircle className="user-avatar" />
                  )}
                  <div className="user-meta">
                    <span className="user-name">{user.name}</span>
                    <span className={`user-role ${user.role}`}>
                      {user.role === "admin" ? "Admin" : "Consumer"}
                    </span>
                  </div>
                </div>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <FaSignOutAlt />
                  <span>{t("nav_logout", currentLang)}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="login-btn"
                onClick={() => setMenuOpen(false)}
              >
                <FaUserCircle />
                <span>{t("nav_login", currentLang)}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
