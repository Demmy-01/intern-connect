// login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import InputField from "../components/InputField";
import SocialLogin from "../components/SocialLogin";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
import securityService from "../lib/securityService";
const currentYear = new Date().getFullYear();

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for messages from email verification
    const state = location.state;
    if (state?.message) {
      setSuccess(state.message);
      if (state?.email) {
        setFormData((prev) => ({ ...prev, email: state.email }));
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate email and password
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Check email format
    if (!securityService.validateEmail(formData.email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    // Check rate limiting (max 5 attempts per 15 minutes)
    const rateLimit = securityService.checkLoginAttempt(formData.email);
    if (!rateLimit.allowed) {
      setError(rateLimit.message);
      setLoading(false);
      return;
    }

    try {
      const result = await authService.signInStudent(
        formData.email,
        formData.password
      );

      if (result.success) {
        // Log successful login
        await securityService.logAuthAttempt(formData.email, true);
        setSuccess(result.message);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Log failed login
        await securityService.logAuthAttempt(
          formData.email,
          false,
          result.message
        );
        setError(result.message);
      }
    } catch (error) {
      await securityService.logAuthAttempt(
        formData.email,
        false,
        error.message
      );
      setError("An unexpected error occurred. Please try again.");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await authService.signInWithGoogle();

      if (result.success) {
        setSuccess(result.message);
        // Google will handle the redirect through the callback
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (error) {
      setError("An unexpected error occurred with Google sign-in.");
      setLoading(false);
    }
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
      <div className="login-page">
        <div className="login-container">
          <h2 className="form-title">Login</h2>
          <SocialLogin onGoogleSignIn={handleGoogleSignIn} loading={loading} />

          <p className="separator">
            <span>Or</span>
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <InputField
              type="email"
              placeholder="Email address"
              icon="mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              type="password"
              placeholder="Password"
              icon="lock"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <Link to="/forgot-password" className="forgot-pass-link">
              Forgot password?
            </Link>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div
            className="login-links"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <p className="signup-text">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
            <p className="signup-text">
              Back to <Link to="/">Home Page</Link>
            </p>
          </div>
        </div>
      </div>

      <center>
        <p>© {currentYear} Intern Connect</p>
      </center>
    </div>
  );
};

export default Login;
