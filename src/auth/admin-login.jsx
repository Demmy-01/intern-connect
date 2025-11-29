// admin-login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import InputField from "../components/InputField";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
import { toast } from "../components/ui/sonner";
const currentYear = new Date().getFullYear();

const AdminLogin = () => {
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
    // Check if user is already logged in as admin
    const checkAdminAuth = async () => {
      try {
        const { user, userType } = await authService.getUserProfile();
        if (user && userType === 'admin') {
          navigate("/admin-dashboard");
        }
      } catch (error) {
        console.error("Error checking admin auth:", error);
      }
    };

    checkAdminAuth();

    // Check for messages from email verification or other sources
    const state = location.state;
    if (state?.message) {
      setSuccess(state.message);
      if (state?.email) {
        setFormData((prev) => ({ ...prev, email: state.email }));
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

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

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.signInAdmin(
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess(result.message);
        
        // Log successful login
        console.log("Admin logged in:", {
          userId: result.user.id,
          role: result.adminProfile?.role,
          timestamp: new Date().toISOString()
        });

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin-dashboard", {
            state: {
              adminProfile: result.adminProfile,
              message: "Welcome back!"
            }
          });
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Admin login error:", error);
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
        <p>Intern Connect</p>
      </div>
      <div className="login-page">
        <div className="login-container">
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <h2 className="form-title">Admin Login</h2>
            <p style={{ 
              color: "#6b7280", 
              fontSize: "14px", 
              marginTop: "8px" 
            }}>
              Access the administrative dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">

            <InputField
              type="email"
              placeholder="Admin email address"
              icon="mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <InputField
              type="password"
              placeholder="Password"
              icon="lock"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />

            <Link to="/forgot-password" className="forgot-pass-link">
              Forgot password?
            </Link>

            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login to Dashboard"}
            </button>
          </form>

          <div 
            className="login-links" 
            style={{ 
              textAlign: "center", 
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb"
            }}
          >
            <p className="signup-text" style={{ fontSize: "14px" }}>
              Back to <Link to="/">Home Page</Link>
            </p>
          </div>
        </div>
      </div>

      <center>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          © {currentYear} Intern Connect - Admin Portal
        </p>
      </center>
    </div>
  );
};

export default AdminLogin;