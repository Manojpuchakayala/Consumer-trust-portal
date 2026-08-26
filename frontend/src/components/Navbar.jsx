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
} from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          <div className="logo-badge">
            <FaShieldAlt className="logo-icon" />
          </div>
          <div className="logo-text">
            <span className="brand-title">Consumer Trust</span>
            <span className="brand-subtitle">Grievance Portal</span>
          </div>
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={isActive("/") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className={isActive("/register") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Register Complaint
              </Link>
            </li>
            <li>
              <Link
                to="/track"
                className={isActive("/track") ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                Track Status
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
                  My Complaints
                </Link>
              </li>
            )}
            <li>
              <Link
                to="/admin"
                className={`admin-link ${isActive("/admin") ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <FaUserShield style={{ marginRight: 6 }} />
                Admin Dashboard
              </Link>
            </li>
          </ul>

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
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="login-btn"
                onClick={() => setMenuOpen(false)}
              >
                <FaUserCircle />
                <span>Login / Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
