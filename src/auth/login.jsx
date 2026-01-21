// login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import InputField from "../components/InputField";
import SocialLogin from "../components/SocialLogin";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
import securityService from "../lib/securityService";
import { supabase } from "../lib/supabase";
import { toast } from "../components/ui/sonner";
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
    console.log("Login form submitted");
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate email and password
    if (!formData.email || !formData.password) {
      console.log("Validation error: missing email or password");
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Check email format
    if (!securityService.validateEmail(formData.email)) {
      console.log("Validation error: invalid email format");
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    // Check rate limiting (max 5 attempts per 15 minutes)
    const rateLimit = securityService.checkLoginAttempt(formData.email);
    if (!rateLimit.allowed) {
      console.log("Rate limit error:", rateLimit.message);
      setError(rateLimit.message);
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign in with email:", formData.email);
      const result = await authService.signInStudent(
        formData.email,
        formData.password
      );

      console.log("Sign in result:", result);

      if (result.success) {
        console.log("Login successful");
        // Log successful login
        await securityService.logAuthAttempt(formData.email, true);
        setSuccess(result.message);

        // Check if user has completed onboarding
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          try {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, user_type, has_completed_onboarding")
              .eq("id", user.id)
              .single();

            // If onboarding not completed, redirect to onboarding page
            if (!profile?.has_completed_onboarding) {
              console.log("Redirecting to onboarding");
              try {
                toast.success(result.message || "Logged in successfully");
              } catch (e) {}
              setTimeout(() => {
                navigate("/student-onboarding");
              }, 1500);
              setLoading(false);
              return;
            }
          } catch (profileError) {
            console.error("Error checking onboarding status:", profileError);
            // Continue anyway if profile check fails
          }
        }

        // show success toast
        console.log("Redirecting to dashboard");
        try {
          toast.success(result.message || "Logged in successfully");
        } catch (e) {
          // ignore toast errors
        }
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        console.log("Login failed:", result.message);
        // Log failed login
        await securityService.logAuthAttempt(
          formData.email,
          false,
          result.message
        );
        setError(result.message);
        try {
          toast.error(result.message || "Login failed");
        } catch (e) {
          // ignore
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      await securityService.logAuthAttempt(
        formData.email,
        false,
        error.message
      );
      setError("An unexpected error occurred. Please try again.");
      try {
        toast.error("An unexpected error occurred. Please try again.");
      } catch (e) {}
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
        try {
          toast.success(result.message || "Logged in successfully");
        } catch (e) {}
        // Google will handle the redirect through the callback
      } else {
        setError(result.message);
        try {
          toast.error(result.message || "Google sign-in failed");
        } catch (e) {}
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
