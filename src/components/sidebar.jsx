import React, { useState, useEffect } from "react";
import "./sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import add from "../assets/add.png";
import dash from "../assets/dash.png";
import profile from "../assets/profile.png";
import out from "../assets/out.png";
import people from "../assets/people.png";
import { Menu, X, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LogoutModal from "./LogoutModal";
import OrganizationProfileService from "../lib/OrganizationProfileService";

const Sidebar = ({ isOpen, onToggle, onCollapsedChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const [organizationData, setOrganizationData] = useState({
    company_name: "Organization Portal",
    logo_url: null,
  });

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
    // Persist collapsed state to localStorage
    localStorage.setItem("sidebar_collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed, onCollapsedChange]);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (user && user.id) {
        try {
          // Check if we have cached organization data
          const cachedData = localStorage.getItem(`org_${user.id}`);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            setOrganizationData(parsed);
            console.log("Using cached organization data:", parsed);
          }

          console.log("Fetching organization data for user:", user.id);
          const data = await OrganizationProfileService.getOrganizationByUserId(
            user.id
          );
          console.log("Organization data received:", data);

          if (data && data.company_name) {
            const newData = {
              company_name: data.company_name,
              logo_url: data.logo_url || null,
            };
            setOrganizationData(newData);
            // Cache the data
            localStorage.setItem(`org_${user.id}`, JSON.stringify(newData));
            console.log("Cached organization data:", newData);
          } else {
            console.log("No company name found in data");
          }
        } catch (error) {
          console.error("Failed to fetch organization data:", error);
          // Keep cached or default fallback
        }
      } else {
        console.log("User not available or no ID");
      }
    };

    fetchOrganizationData();
  }, [user]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
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
      <aside
        className={`sidebar ${isOpen ? "open" : ""} ${
          isCollapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          <div className="company-info">
            {organizationData.logo_url && (
              <img
                src={organizationData.logo_url}
                alt="Company Logo"
                className="company-logo"
              />
            )}
            {!isCollapsed && <h2>{organizationData.company_name}</h2>}
          </div>
          <div className="sidebar-header-buttons">
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              className="collapse-toggle-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle collapse"
            >
              {isCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>
          </div>
        </div>

        <nav className={`sidebar-nav ${isCollapsed ? "collapsed" : ""}`}>
          <Link
            to="/dashboard-overview"
            className={`side-nav-item ${
              location.pathname === "/dashboard-overview" ? "active" : ""
            }`}
          >
            <div className="nav-icon dashboard-icon">
              <img src={dash} alt="Dashboard Icon" className="sidebar-icon" />
            </div>
            <span className="nav-label">Dashboard</span>
          </Link>

          <Link
            to="/applications"
            className={`side-nav-item ${
              location.pathname.startsWith("/application") ? "active" : ""
            }`}
          >
            <div className="nav-icon applications-icon">
              <img src={people} alt="People Icon" className="sidebar-icon" />
            </div>
            <span className="nav-label">Applications</span>
          </Link>

          <Link
            to="/posted-internship"
            className={`side-nav-item ${
              location.pathname.startsWith("/post") ? "active" : ""
            }`}
          >
            <div className="nav-icon post-icon">
              <img src={add} alt="Add Icon" className="sidebar-icon" />
            </div>
            <span className="nav-label">Posted Internship</span>
          </Link>

          <Link
            to="/organization-profile"
            className={`side-nav-item ${
              location.pathname.startsWith("/organization") ? "active" : ""
            }`}
          >
            <div className="nav-icon applications-icon">
              <img src={profile} alt="Profile Icon" className="sidebar-icon" />
            </div>
            <span className="nav-label">Organization Profile</span>
          </Link>

          <div className="side-nav-item logout" onClick={handleLogoutClick}>
            <div className="nav-icon">
              <img src={out} alt="Logout Icon" className="sidebar-icon" />
            </div>
            <span className="nav-label">Log Out</span>
          </div>
        </nav>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onClose={handleLogoutCancel}
      />
    </>
  );
};

export default Sidebar;
