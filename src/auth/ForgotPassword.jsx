// ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import InputField from "../components/InputField";
import "../style/login.css";
import "../style/forgot-password.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
const currentYear = new Date().getFullYear();

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword(email);

      if (result.success) {
        setSuccess(result.message);
        setEmail("");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
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
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <h2>Reset Password</h2>

          <p className="instruction-text">
            Enter your email address and we&apos;ll send you instructions to
            reset your password.
          </p>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <InputField
              type="email"
              placeholder="Enter your email"
              icon="mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccess("");
              }}
            />

            <button type="submit" className="reset-button" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </form>

          <div className="back-to-login">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>

      <center>
        <p>© {currentYear} Intern Connect</p>
      </center>
    </>
  );
};

export default ForgotPassword;
