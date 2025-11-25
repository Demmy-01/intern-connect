// signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import SocialLogin from "../components/SocialLogin";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const currentYear = new Date().getFullYear();

  const navigate = useNavigate();

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

    if (!formData.username || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.signUpStudent(
        formData.email,
        formData.password,
        formData.username
      );

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate("/email-verification", {
            state: {
              email: formData.email,
              userType: "student",
            },
          });
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
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
          <h2 className="form-title">Sign Up</h2>
          <SocialLogin onGoogleSignIn={handleGoogleSignIn} loading={loading} />

          <p className="separator">
            <span>Or</span>
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <InputField
              type="text"
              placeholder="Username"
              icon="user"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
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
              placeholder="Password (min 6 characters)"
              icon="lock"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="checkbox">
              <input type="checkbox" id="terms" name="terms" required />
              <span className="check-span">I agree to the </span>
              <Link to="/terms">Terms of Service</Link> and{" "}
              <Link to="/terms">Privacy Policy</Link>
            </div>
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div
            className="signup-links"
            style={{ textAlign: "center", marginTop: "20px" }}
          >
            <p className="signup-text">
              Already have an account? <Link to="/login">Login</Link>
            </p>
            <p className="signup-text">
              Are you an organization?{" "}
              <Link to="/organization-signup">Organization Sign Up</Link>
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

export default SignUp;
