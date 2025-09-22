import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import authService from "../lib/authService";
import { Button } from "../components/button";
import "../style/organization-login.css";
import logo from "../assets/logo_blue.png";

const OrganizationLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const currentYear = new Date().getFullYear();

  // Check for messages from email verification or other sources
  useEffect(() => {
    const state = location.state;
    if (state?.message) {
      setSuccess(state.message);
      if (state?.email) {
        setEmail(state.email);
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const result = await authService.signInOrganization(email, password);
      console.log("Organization login result:", result);

      if (result.success) {
        setSuccess("Login successful! Redirecting to dashboard...");

        // Navigate to dashboard overview
        setTimeout(() => {
          navigate("/dashboard-overview");
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="login-logo-container">
        <img
          src={logo}
          alt="Logo"
          className="login-logo"
          height={"30px"}
          width={"30px"}
        />
        <p>Intern connect</p>
      </div>

      <div className="org-login-container">
        <div className="org-login-card">
          <h2 className="org-login-title">Organization Login</h2>
          <p className="org-login-subtitle">
            Sign in to your organization dashboard
          </p>

          <form className="org-login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Organization email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess("");
              }}
              disabled={isLoading}
              required
              className="org-input-field"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setSuccess("");
              }}
              disabled={isLoading}
              required
              className="org-input-field"
            />

            {error && <div className="org-error-message">{error}</div>}
            {success && <div className="org-success-message">{success}</div>}

            <Button
              type="submit"
              label={isLoading ? "Signing in..." : "Sign in to Dashboard"}
              disabled={isLoading}
              className="org-submit-button"
            />
          </form>

          <div className="org-login-links">
            <p>
              <Link to="/forgot-password">Forgot your password?</Link>
            </p>
            <p>
              Don't have an organization account?{" "}
              <Link to="/organization-signup">Sign up here</Link>
            </p>
            <p>
              Looking to join as a student?{" "}
              <Link to="/login">Student Login</Link>
            </p>
          </div>
        </div>
      </div>

      <center>
        <p>© {currentYear} Intern Connect</p>
      </center>
    </>
  );
};

export default OrganizationLogin;
