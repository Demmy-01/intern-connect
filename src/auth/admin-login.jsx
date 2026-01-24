// admin-login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
import { toast } from "../components/ui/sonner";

const currentYear = new Date().getFullYear();

// This is the hidden email we will authenticate against
// You must ensure this user exists in your Supabase Auth
const ADMIN_EMAIL = "admin@d-internconnect.com";

const AdminLogin = () => {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!accessCode) {
      setError("Please enter the access code");
      setLoading(false);
      return;
    }

    try {
      // We use the access code AS the password
      const result = await authService.signInAdmin(
        ADMIN_EMAIL,
        accessCode
      );

      if (result.success) {
        toast.success("Access Granted");
        sessionStorage.setItem('admin_access_verified', 'true');
        
        // Log successful login
        console.log("Admin logged in via access code");

        // Redirect to admin dashboard
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      } else {
        // Generic error message for security
        setError("Invalid Access Code");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Invalid Access Code");
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
        <div className="login-container" style={{ maxWidth: "400px" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{
              background: "rgba(42, 82, 152, 0.1)",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px auto"
            }}>
              <Lock size={30} color="#2a5298" />
            </div>
            <h2 className="form-title" style={{ fontSize: "24px", marginBottom: "10px" }}>
              Admin Access
            </h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>
              Enter your access code to manage the platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper" style={{ padding: "8px 16px" }}>
              <input
                type="password"
                placeholder="Enter Access Code"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setError("");
                }}
                disabled={loading}
                required
                style={{
                  fontSize: "18px",
                  textAlign: "center",
                  letterSpacing: "4px",
                  fontFamily: "monospace",
                  width: "100%"
                }}
                autoFocus
              />
            </div>

            {error && (
              <div style={{
                color: "#dc2626",
                fontSize: "14px",
                textAlign: "center",
                background: "#fee2e2",
                padding: "10px",
                borderRadius: "8px"
              }}>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
            >
              {loading ? "Verifying..." : "Access Dashboard"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <Link 
              to="/" 
              style={{ 
                color: "#6b7280", 
                textDecoration: "none", 
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;