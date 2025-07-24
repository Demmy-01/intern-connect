import React, { useState, useEffect } from "react";
import { Bell, User, Menu, X, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import "../style/navbar.css";
import logo_blue from "../assets/logo_blue.png";
import { Button } from "./button.jsx";
import { Buttons } from "./button-1.jsx";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleTheme = () => {
    const newTheme = !darkMode ? "dark" : "light";
    setDarkMode(!darkMode);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setDarkMode(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

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
                className={`nav-link ${isActive("/about") ? "active" : ""}`}
              >
                About us
              </Link>
              <div className="dropdown">
                <button
                  className={`nav-link dropdown-toggle ${
                    isActive("/create-cv") || isActive("/interview-prep")
                      ? "active"
                      : ""
                  }`}
                >
                  AI Tools <span className="dropdown-arrow">▼</span>
                </button>
                <div className="dropdown-menu">
                  <Link
                    to="/create-cv"
                    className={`dropdown-item ${
                      isActive("/create-cv") ? "active" : ""
                    }`}
                  >
                    Create CV
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

              {/* Bell Icon */}
              <button className="icon-button">
                <Bell size={20} />
              </button>

              {/* Profile Picture */}
              <button className="icon-button">
                <User size={20} />
              </button>

              <Link to="/login">
                <Button label="Login" />
              </Link>
              <Link to="/signup">
                <Buttons label="Sign up" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="mobile-menu-button">
              <button onClick={toggleMenu} className="mobile-menu-button">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                  <div className="dropdown">
                    <button
                      className={`nav-link dropdown-toggle ${
                        isActive("/create-cv") || isActive("/interview-prep")
                          ? "active"
                          : ""
                      }`}
                    >
                      AI Tools <span className="dropdown-arrow">▼</span>
                    </button>
                    <div className="dropdown-menu">
                      <Link
                        to="/create-cv"
                        className={`dropdown-item ${
                          isActive("/create-cv") ? "active" : ""
                        }`}
                      >
                        Create CV
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
                    <button className="icon-button">
                      <Bell size={20} />
                    </button>
                    <button className="icon-button">
                      <User size={20} />
                    </button>
                  </div>

                  <div className="mobile-buttons">
                    <Link to="/login">
                      <Button label="Login" />
                    </Link>
                    <Link to="/signup">
                      <Button label="Sign up" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
