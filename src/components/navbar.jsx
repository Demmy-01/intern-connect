import React from "react";
import { Bell, User, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/navbar.css";
import logo_blue from "../assets/logo_blue.png";
import { Button } from "./button.jsx";
import { Buttons } from "./button-1.jsx";
import NotificationModal from "./notification.jsx";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ textColor }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = React.useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] =
    React.useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isMenuOpen) {
      setIsMobileDropdownOpen(false); // Close dropdown when menu closes
    }
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const closeNotification = () => {
    setIsNotificationOpen(false);
  };

  const toggleMobileDropdown = () => {
    setIsMobileDropdownOpen(!isMobileDropdownOpen);
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-flex">
            {/* Logo */}
            <div className="logo-container">
              <div className="logo-flex">
                <div className="logo-icon">
                  <span className="logo-text">
                    <img
                      src={darkMode ? logo_blue : logo_blue}
                      alt="Intern Connect"
                      height={"25px"}
                      width={"25px"}
                    />
                  </span>
                </div>
                <span className="logo-title">INTERN CONNECT</span>
              </div>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="desktop-nav">
              <Link
                to="/"
                className={`nav-link ${isActive("/") ? "active" : ""}`}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`nav-link ${isActive("/about") ? textColor : ""}`}
              >
                About us
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className={`nav-link ${
                    isActive("/dashboard") ? "active" : ""
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <div
                className="dropdown"
                onMouseEnter={() => setIsDesktopDropdownOpen(true)}
                onMouseLeave={() => setIsDesktopDropdownOpen(false)}
              >
                <button
                  className={`nav-link dropdown-toggle ${
                    isActive("/cv-generator") || isActive("/interview-prep")
                      ? "active"
                      : ""
                  }`}
                >
                  AI Tools
                </button>
                <div
                  className={`dropdown-menu ${
                    isDesktopDropdownOpen ? "open" : ""
                  }`}
                >
                  <Link
                    to="/cv-generator"
                    className={`dropdown-item ${
                      isActive("/cv-generator") ? "active" : ""
                    }`}
                  >
                    CV Generator
                  </Link>
                  <Link
                    to="/interview-prep"
                    className={`dropdown-item ${
                      isActive("/interview-prep") ? "active" : ""
                    }`}
                  >
                    Interview Prep
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop Right Side - Icons and Buttons */}
            <div className="desktop-right">
              {/* Theme Toggle */}
              <button
                className="icon-button theme-toggle"
                onClick={toggleTheme}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <>
                  {/* Bell Icon */}
                  <button
                    className="icon-button"
                    onClick={toggleNotification}
                    aria-label="Toggle notifications"
                  >
                    <Bell size={20} />
                  </button>

                  {/* Profile Icon */}
                  <Link to="/profile">
                    <button className="icon-button">
                      <User size={20} />
                    </button>
                  </Link>

                  {/* Logout Icon */}
                  <button
                    className="icon-button"
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button label="Login" />
                  </Link>
                  <Link to="/signup">
                    <Buttons label="Sign up" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="mobile-menu-container">
              <button onClick={toggleMenu} className="mobile-menu-button">
                {isMenuOpen ? (
                  <X size={24} strokeWidth={2} />
                ) : (
                  <Menu size={24} strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-content">
                <div className="mobile-menu-links">
                  <Link
                    to="/"
                    className={`mobile-nav-link ${
                      isActive("/") ? "active" : ""
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className={`mobile-nav-link ${
                      isActive("/about") ? "active" : ""
                    }`}
                  >
                    About us
                  </Link>
                  {user && (
                    <Link
                      to="/dashboard"
                      className={`mobile-nav-link ${
                        isActive("/dashboard") ? "active" : ""
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                  <div className="dropdown">
                    <button
                      className={`nav-link dropdown-toggle ${
                        isActive("/cv-generator") || isActive("/interview-prep")
                          ? "active"
                          : ""
                      }`}
                      onClick={toggleMobileDropdown}
                      aria-expanded={isMobileDropdownOpen}
                      aria-haspopup="true"
                    >
                      AI Tools
                    </button>
                    <div
                      className={`dropdown-menu ${
                        isMobileDropdownOpen ? "open" : ""
                      }`}
                    >
                      <Link
                        to="/cv-generator"
                        className={`dropdown-item ${
                          isActive("/cv-generator") ? "active" : ""
                        }`}
                      >
                        CV Generator
                      </Link>
                      <Link
                        to="/interview-prep"
                        className={`dropdown-item ${
                          isActive("/interview-prep") ? "active" : ""
                        }`}
                      >
                        Interview Prep
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Mobile Icons and Buttons */}
                <div className="mobile-actions">
                  <div className="mobile-icons">
                    {/* Theme Toggle */}
                    <button
                      className="icon-button theme-toggle"
                      onClick={toggleTheme}
                    >
                      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {user ? (
                      <>
                        <button
                          className="icon-button"
                          onClick={toggleNotification}
                          aria-label="Toggle notifications"
                        >
                          <Bell size={20} />
                        </button>
                        <Link to="/profile">
                          <button className="icon-button">
                            <User size={20} />
                          </button>
                        </Link>
                        <button
                          className="icon-button"
                          onClick={async () => {
                            await logout();
                            navigate("/login");
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogOut size={20} />
                        </button>
                      </>
                    ) : null}
                  </div>

                  {!user && (
                    <div className="mobile-buttons">
                      <Link to="/login">
                        <Button label="Login" />
                      </Link>
                      <Link to="/signup">
                        <Button label="Sign up" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <NotificationModal
        isOpen={isNotificationOpen}
        closeModal={closeNotification}
      />
    </>
  );
};

export default Navbar;
