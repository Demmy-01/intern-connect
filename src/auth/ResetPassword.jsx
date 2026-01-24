// ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import InputField from "../components/InputField";
import "../style/login.css";
import "../style/forgot-password.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Check if we have an active session (set by properties of the link)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        // If no session, they might have refreshed or link expired
        // Try not to error immediately, but warn if submitting fails
        console.log("No active session found for password reset");
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.updatePassword(password);

      if (result.success) {
        setSuccess("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="logs">
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
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <h2><b>Set New Password</b></h2>

          <p className="instruction-text">
            Please enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <InputField
              type="password"
              placeholder="Enter new password"
              icon="lock"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setSuccess("");
              }}
            />

            <InputField
              type="password"
              placeholder="Confirm new password"
              icon="lock"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
                setSuccess("");
              }}
            />

            <button type="submit" className="reset-button" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </form>
        </div>
      </div>

      <center className="year">
        <p>© {currentYear} Intern Connect</p>
      </center>
    </div>
  );
};

export default ResetPassword;
