import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../lib/authService";
import { Button } from "../components/button";
import "../style/organization-signup.css";
import logo from "../assets/logo_blue.png";

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    organizationName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await authService.signUpOrganization(formData);
      console.log("Signup result:", result);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate("/email-verification", {
            state: {
              email: formData.email,
              userType: "organization",
            },
          });
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred during signup. Please try again.");
      console.error("Signup error:", error);
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

      <div className="org-signup-container">
        <div className="org-signup-card">
          <div className="org-signup-header">
            <h2 className="org-signup-title">Create Organization Account</h2>
            <p className="org-signup-subtitle">
              Join InternConnect as an organization and start posting
              internships
            </p>
          </div>

          <form className="org-signup-form" onSubmit={handleSubmit}>
            <div className="org-input-group">
              <div className="org-input-container">
                <label htmlFor="organizationName" className="org-sr-only">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  className="org-input-field"
                  placeholder="Organization Name *"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="org-input-container">
                <label htmlFor="email" className="org-sr-only">
                  Official Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="org-input-field"
                  placeholder="Official Email Address *"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="org-input-container">
                <label htmlFor="phone" className="org-sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="org-input-field"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="org-input-container">
                <label htmlFor="password" className="org-sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="org-input-field"
                  placeholder="Password (min 6 characters) *"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>

              <div className="org-input-container">
                <label htmlFor="confirmPassword" className="org-sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="org-input-field"
                  placeholder="Confirm Password *"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="org-input-container checkbox-container">
                <input type="checkbox" id="terms" name="terms" required />
                <label htmlFor="terms" className="org-terms-label">
                  I agree to the{" "}
                  <Link to="/terms" className="org-terms-link">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/terms" className="org-terms-link">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {error && (
              <div className="org-error-message">
                <div className="org-error-text">{error}</div>
              </div>
            )}

            {success && (
              <div className="org-success-message">
                <div className="org-success-text">{success}</div>
              </div>
            )}

            <div className="org-submit-container">
              <Button
                type="submit"
                label={
                  isLoading
                    ? "Creating Account..."
                    : "Create Organization Account"
                }
                disabled={isLoading}
                className="org-submit-button"
              />
            </div>

            <div className="org-login-links">
              <p className="org-login-text">
                Already have an account?{" "}
                <Link to="/organization-login" className="org-login-link">
                  Sign in
                </Link>
              </p>
              <p className="org-student-text">
                Looking to join as a student?{" "}
                <Link to="/signup" className="org-student-link">
                  Student Signup
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <center>
        <p>© {currentYear} Intern Connect</p>
      </center>
    </>
  );
};

export default OrganizationSignup;
