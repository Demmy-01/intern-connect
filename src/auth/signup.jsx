// signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import SocialLogin from "../components/SocialLogin";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
import securityService from "../lib/securityService";

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({});
  const currentYear = new Date().getFullYear();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    // Validate username format (alphanumeric, underscore, hyphen only)
    if (!securityService.validateUsername(formData.username)) {
      setError(
        "Username must be 3-50 characters, alphanumeric with underscore/hyphen only"
      );
      setLoading(false);
      return;
    }

    // Validate email format
    if (!securityService.validateEmail(formData.email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    // Check if email already exists
    if (emailExists) {
      setError(
        "This email is already registered. Please use a different email or try logging in."
      );
      await securityService.logAuthAttempt(
        formData.email,
        false,
        "Email already exists - signup attempt"
      );
      setLoading(false);
      return;
    }

    // Validate password strength (must pass all requirements)
    const passwordValidation = securityService.validatePassword(
      formData.password
    );
    if (!passwordValidation.isValid) {
      setError(
        "Password must have: 12+ chars, uppercase, lowercase, number, special character"
      );
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
        // Log successful signup
        await securityService.logAuthAttempt(formData.email, true, "signup");
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    marginBottom: "8px",
                  }}
                >
                  {[1, 2, 3, 4, 5].map((segment) => (
                    <div
                      key={segment}
                      style={{
                        flex: 1,
                        height: "6px",
                        backgroundColor:
                          passwordStrength >= segment * 20
                            ? passwordStrength < 40
                              ? "#ff4444"
                              : passwordStrength < 70
                              ? "#ffbb33"
                              : "#00C851"
                            : "#ddd",
                        borderRadius: "3px",
                        transition: "background-color 0.3s",
                      }}
                    />
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color:
                      passwordStrength < 40
                        ? "#ff4444"
                        : passwordStrength < 70
                        ? "#ffbb33"
                        : "#00C851",
                    margin: "5px 0",
                  }}
                >
                  Strength: {passwordStrength}% -{" "}
                  {passwordStrength < 40
                    ? "Weak"
                    : passwordStrength < 70
                    ? "Medium"
                    : "Strong"}
                </p>

                {/* Requirements Checklist */}
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}
                >
                  <p
                    style={{
                      margin: "4px 0",
                      color: passwordRequirements.minLength
                        ? "#00C851"
                        : "#ff4444",
                    }}
                  >
                    {passwordRequirements.minLength ? "✓" : "✗"} At least 12
                    characters
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: passwordRequirements.hasUppercase
                        ? "#00C851"
                        : "#ff4444",
                    }}
                  >
                    {passwordRequirements.hasUppercase ? "✓" : "✗"} Uppercase
                    letter (A-Z)
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: passwordRequirements.hasLowercase
                        ? "#00C851"
                        : "#ff4444",
                    }}
                  >
                    {passwordRequirements.hasLowercase ? "✓" : "✗"} Lowercase
                    letter (a-z)
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: passwordRequirements.hasNumbers
                        ? "#00C851"
                        : "#ff4444",
                    }}
                  >
                    {passwordRequirements.hasNumbers ? "✓" : "✗"} Number (0-9)
                  </p>
                  <p
                    style={{
                      margin: "4px 0",
                      color: passwordRequirements.hasSpecialChar
                        ? "#00C851"
                        : "#ff4444",
                    }}
                  >
                    {passwordRequirements.hasSpecialChar ? "✓" : "✗"} Special
                    character (!@#$%^&*)
                  </p>
                </div>
              </div>
            )}

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
