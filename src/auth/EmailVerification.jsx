// EmailVerification.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo_blue.png";
import "../style/verification.css";
import authService from "../lib/authService";

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userType, setUserType] = useState("student");
  const currentYear = new Date().getFullYear();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user info from navigation state
    const state = location.state;
    if (state?.email) {
      setUserEmail(state.email);
    }
    if (state?.userType) {
      setUserType(state.userType);
    }

    // If no email provided, redirect to appropriate signup
    if (!state?.email) {
      navigate(
        userType === "organization" ? "/organization-signup" : "/signup"
      );
    }
  }, [location.state, navigate, userType]);

  const handleResendVerification = async () => {
    if (!userEmail) {
      setError("No email found. Please sign up again.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await authService.resetPassword(userEmail);

      if (result.success) {
        setSuccess("Verification email sent! Please check your inbox.");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An error occurred while sending the verification email.");
    }

    setLoading(false);
  };

  const getLoginLink = () => {
    return userType === "organization" ? "/organization-login" : "/login";
  };

  const getSignupLink = () => {
    return userType === "organization" ? "/organization-signup" : "/signup";
  };

  const getUserTypeText = () => {
    return userType === "organization" ? "Organization" : "Student";
  };

  return (
    <>
      <div className="email-verification-wrapper">
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
        <div className="verification-page">
          <div className="verification-container">
            <h2>Check Your Email</h2>

            <div className="email-illustration">📧</div>

            <p className="verification-message">
              We've sent a verification link to <strong>{userEmail}</strong>.
              Please check your inbox and click the link to verify your{" "}
              {getUserTypeText().toLowerCase()} account.
            </p>

            {userType === "organization" && (
              <div
                className="org-verification-note"
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  margin: "20px 0",
                  border: "1px solid #e9ecef",
                }}
              >
                <p style={{ margin: 0, fontSize: "14px", color: "#6c757d" }}>
                  <strong>Note:</strong> Organization accounts require email
                  verification before you can access your dashboard.
                </p>
              </div>
            )}

            <button
              onClick={handleResendVerification}
              className="resend-button"
              disabled={loading}
            >
              {loading ? "Sending..." : "Resend Verification Email"}
            </button>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <div className="verification-footer">
              <p>
                Didn't receive the email? Check your spam folder or{" "}
                <Link to={getSignupLink()}>try another email</Link>
              </p>
              <p style={{ marginTop: "15px" }}>
                Already verified your email?{" "}
                <Link to={getLoginLink()}>{getUserTypeText()} Login</Link>
              </p>
              {userType === "student" && (
                <p>
                  Are you an organization?{" "}
                  <Link to="/organization-signup">Organization Sign Up</Link>
                </p>
              )}
              {userType === "organization" && (
                <p>
                  Are you a student? <Link to="/signup">Student Sign Up</Link>
                </p>
              )}
            </div>
          </div>
        </div>

        <center>
        <p>© {currentYear} Intern Connect</p>
      </center>
      </div>
    </>
  );
};

export default EmailVerification;
