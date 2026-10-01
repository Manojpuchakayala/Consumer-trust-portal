import { NavLink } from "react-router-dom";
import { FaHome, FaFileAlt, FaSearch, FaFolderOpen, FaBuilding } from "react-icons/fa";
import "./MobileBottomNav.css";

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-dock" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        className={({ isActive }) => `dock-item ${isActive ? "active" : ""}`}
        end
      >
        <FaHome className="dock-icon" />
        <span className="dock-label">Home</span>
      </NavLink>

      <NavLink
        to="/register"
        className={({ isActive }) => `dock-item highlight ${isActive ? "active" : ""}`}
      >
        <div className="dock-fab-circle">
          <FaFileAlt className="dock-icon" />
        </div>
        <span className="dock-label">File Dispute</span>
      </NavLink>

      <NavLink
        to="/track"
        className={({ isActive }) => `dock-item ${isActive ? "active" : ""}`}
      >
        <FaSearch className="dock-icon" />
        <span className="dock-label">Track Case</span>
      </NavLink>

      <NavLink
        to="/my-complaints"
        className={({ isActive }) => `dock-item ${isActive ? "active" : ""}`}
      >
        <FaFolderOpen className="dock-icon" />
        <span className="dock-label">My Grievances</span>
      </NavLink>

      <NavLink
        to="/leaderboard"
        className={({ isActive }) => `dock-item ${isActive ? "active" : ""}`}
      >
        <FaBuilding className="dock-icon" />
        <span className="dock-label">Brands</span>
      </NavLink>
    </nav>
  );
}
