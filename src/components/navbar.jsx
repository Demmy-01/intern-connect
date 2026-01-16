import React from "react";
import { Bell, User, Menu, X, Sun, Moon, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../style/navbar.css";
import logo_blue from "../assets/logo_blue.png";
import { Button } from "./button.jsx";
import { Buttons } from "./button-1.jsx";
import NotificationModal from "./notification.jsx";
import AccountTypeModal from "./AccountTypeModal";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";

const Navbar = ({ textColor }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = React.useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] =
    React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout, getDashboardUrl } = useAuth();
  const dashboardUrl = getDashboardUrl ? getDashboardUrl() : "/dashboard";
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

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(false);
    navigate("/login");
  };

  return (
    <>
      <NotificationModal
        isOpen={isNotificationOpen}
        closeModal={closeNotification}
      />
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-flex">
            {/* Logo */}
            <Link to="/" className="logo-link">
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
            </Link>

            {/* Desktop Navigation - Center */}
            <div className="desktop-nav">
              {!user && (
                <>
                  <Link
                    to="/"
                    className={`nav-link ${isActive("/") ? "active" : ""}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    className={`nav-link ${
                      isActive("/about") ? textColor : ""
                    }`}
                  >
                    About us
                  </Link>
                </>
              )}
              {user && (
                <>
                  <Link
                    to={dashboardUrl}
                    className={`nav-link ${
                      isActive(dashboardUrl) ? "active" : ""
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/internships"
                    className={`nav-link ${
                      isActive("/internships") ? "active" : ""
                    }`}
                  >
                    Internships
                  </Link>
                </>
              )}
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
                    className="icon-button notification-button"
                    onClick={toggleNotification}
                    aria-label="Toggle notifications"
                  >
                    <Bell size={20} />
                    <span className="notification-dot"></span>
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
                    onClick={() => setShowLogoutModal(true)}
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <>
                  <Button
                    label="Login"
                    onClick={() => setShowLoginModal(true)}
                    className="nav-button-link"
                  />
                  <Buttons
                    label="Sign up"
                    onClick={() => setShowSignupModal(true)}
                    className="nav-button-link"
                  />
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
                  {!user && (
                    <>
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
                    </>
                  )}
                  {user && (
                    <>
                      <Link
                        to={dashboardUrl}
                        className={`mobile-nav-link ${
                          isActive(dashboardUrl) ? "active" : ""
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/internships"
                        className={`mobile-nav-link ${
                          isActive("/internships") ? "active" : ""
                        }`}
                      >
                        Internships
                      </Link>
                    </>
                  )}
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
                      <button
                        onClick={() => {
                          setShowLoginModal(true);
                          setIsMenuOpen(false);
                        }}
                        className="mobile-button-link"
                      >
                        <Button label="Login" />
                      </button>
                      <button
                        onClick={() => {
                          setShowSignupModal(true);
                          setIsMenuOpen(false);
                        }}
                        className="mobile-button-link"
                      >
                        <Button label="Sign up" />
                      </button>
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
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
      <AccountTypeModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        type="login"
      />
      <AccountTypeModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        type="signup"
      />
    </>
  );
};

export default Navbar;
