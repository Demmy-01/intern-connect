import React from "react";
import "./sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import add from "../assets/add.png";
import dash from "../assets/dash.png";
import profile from "../assets/profile.png";
import out from "../assets/out.png";
import people from "../assets/people.png";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Organization Portal</h2>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`side-nav-item ${
              location.pathname === "/dashboard-overview" ? "active" : ""
            }`}
          >
            <div className="nav-icon dashboard-icon">
              <img src={dash} alt="Dashboard Icon" className="sidebar-icon" />
            </div>
            <Link to="/dashboard-overview" className="side-nav-link">
              <span>Dashboard</span>
            </Link>
          </div>

          <div
            className={`side-nav-item ${
              location.pathname.startsWith("/application") ? "active" : ""
            }`}
          >
            <div className="nav-icon applications-icon">
              <img src={people} alt="People Icon" className="sidebar-icon" />
            </div>
            <Link to="/applications" className="side-nav-link">
              <span>Applications</span>
            </Link>
          </div>

          <div
            className={`side-nav-item ${
              location.pathname.startsWith("/post") ? "active" : ""
            }`}
          >
            <div className="nav-icon post-icon">
              <img src={add} alt="Add Icon" className="sidebar-icon" />
            </div>
            <Link to="/posted-internship" className="side-nav-link">
              <span>Posted Internship</span>
            </Link>
          </div>

          <div
            className={`side-nav-item ${
              location.pathname.startsWith("/organization") ? "active" : ""
            }`}
          >
            <div className="nav-icon profile-icon">
              <img src={profile} alt="Profile Icon" className="sidebar-icon" />
            </div>
            <Link to="/organization-profile" className="side-nav-link">
              <span>Organization Profile</span>
            </Link>
          </div>

          <div className="side-nav-item logout">
            <div
              className="nav-icon logout-icon"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              <img src={out} alt="Logout Icon" className="sidebar-icon" />
            </div>
            <span
              className="side-nav-link"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            >
              Log Out
            </span>
          </div>
        </nav>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
    </>
  );
};

export default Sidebar;
