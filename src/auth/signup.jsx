// signup.jsx — Redesigned with modern split-panel layout
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/auth-modern.css";
import "../style/login.css";
import logo from "../assets/logo_blue.png";
import authService from "../lib/authService";
import securityService from "../lib/securityService";
import { toast } from "../components/ui/sonner";

const currentYear = new Date().getFullYear();

const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

const icons = {
  user: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  mail: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  lock: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  alert: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const SignUp = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); setSuccess(""); };

  const handleGoogleSignIn = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const result = await authService.signInWithGoogle();
      if (result.success) { setSuccess(result.message); toast.success(result.message || "Signed in with Google"); }
      else { setError(result.message); toast.error(result.message || "Google sign-in failed"); setLoading(false); }
    } catch { setError("An unexpected error occurred with Google sign-in."); toast.error("An unexpected error occurred."); setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setSuccess("");
    if (!formData.username || !formData.email || !formData.password) { setError("Please fill in all fields"); toast.error("Please fill in all fields"); setLoading(false); return; }
    if (!securityService.validateUsername(formData.username)) { const msg = "Username must be 3-50 characters, alphanumeric with underscore/hyphen only"; setError(msg); toast.error(msg); setLoading(false); return; }
    if (!securityService.validateEmail(formData.email)) { setError("Invalid email format"); toast.error("Invalid email format"); setLoading(false); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); toast.error("Password must be at least 6 characters"); setLoading(false); return; }

    try {
      const result = await authService.signUpStudent(formData.email, formData.password, formData.username);
      if (result.success) {
        await securityService.logAuthAttempt(formData.email, true, "signup");
        setSuccess(result.message); toast.success(result.message || "Account created successfully");
        setTimeout(() => navigate("/email-verification", { state: { email: formData.email, userType: "student" } }), 1500);
      } else { await securityService.logAuthAttempt(formData.email, false, result.message); setError(result.message); toast.error(result.message || "Signup failed"); }
    } catch (err) { await securityService.logAuthAttempt(formData.email, false, err.message); setError("An unexpected error occurred. Please try again."); toast.error("An unexpected error occurred. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left-grid" />
        <div className="auth-left-decor auth-left-decor-1" />
        <div className="auth-left-decor auth-left-decor-2" />
        <div className="auth-left-decor auth-left-decor-3" />
        <div className="auth-left-content">
          <div className="auth-left-logo">
            <img src={logo} alt="InternConnect" />
            <span>InternConnect</span>
          </div>
          <h1 className="auth-left-headline">Your Internship<br /><span>Journey Starts Here.</span></h1>
          <p className="auth-left-sub">Create your free account and get matched with internships from Nigeria's top companies in minutes.</p>
          <div className="auth-left-stats">
            <div className="auth-stat-card"><div className="auth-stat-number">Free</div><div className="auth-stat-label">Always</div></div>
            <div className="auth-stat-card"><div className="auth-stat-number">2min</div><div className="auth-stat-label">To Sign Up</div></div>
            <div className="auth-stat-card"><div className="auth-stat-number">500+</div><div className="auth-stat-label">Companies</div></div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-mobile-logo">
          <img src={logo} alt="InternConnect" />
          <span>InternConnect</span>
        </div>
        <div className="auth-form-card">
          <div className="auth-badge"><span className="auth-badge-dot" /> Student Account</div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Join thousands of students finding their dream internships.</p>

          {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: "1rem" }}>{icons.alert}<span>{error}</span></div>}
          {success && <div className="auth-alert auth-alert-success" style={{ marginBottom: "1rem" }}>{icons.check}<span>{success}</span></div>}

          <button className="auth-google-btn" onClick={handleGoogleSignIn} disabled={loading} type="button">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            Sign up with Google
          </button>
          <div className="auth-divider"><span>or sign up with email</span></div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label className="auth-label">Username</label>
              <div className="auth-input-wrap">{icons.user}<input className="auth-input" type="text" name="username" placeholder="your_username" value={formData.username} onChange={handleChange} autoComplete="username" /></div>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">{icons.mail}<input className="auth-input" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" /></div>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                {icons.lock}
                <input className="auth-input" type={showPw ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((p) => !p)}><EyeIcon open={showPw} /></button>
              </div>
            </div>

            <div className="auth-checkbox-group">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/terms">Privacy Policy</Link></label>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              <span className="auth-submit-inner">
                {loading && <span className="auth-spinner" />}
                {loading ? "Creating Account…" : "Create Account"}
              </span>
            </button>
          </form>

          <div className="auth-footer-links">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
            <p>Are you an organization? <Link to="/organization-signup">Register here</Link></p>
          </div>
          <p className="auth-copyright">© {currentYear} InternConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;