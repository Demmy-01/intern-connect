// organization-signup.jsx — Redesigned with modern split-panel layout
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../lib/authService";
import "../style/auth-modern.css";
import "../style/organization-signup.css";
import logo from "../assets/logo_blue.png";
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
  building: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  mail: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  phone: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.162.85-2.154 2.002-2.318A48.89 48.89 0 017.5 3.75h.008l.008.001L9 3.752a3 3 0 012.164 1.294c.172.27.367.537.57.799.197.256.42.481.66.673a1.75 1.75 0 01.394 2.302l-.947 1.736a.875.875 0 00.143 1.033l1.543 1.541a.875.875 0 001.033.143l1.736-.946a1.75 1.75 0 012.302.393c.192.24.417.464.673.66.262.204.53.398.8.57a3 3 0 011.293 2.165v.007a48.89 48.89 0 01-.068 3.247C21.15 20.15 20.158 21 18.996 21H18c-8.284 0-15-6.716-15-15v-.662z" /></svg>,
  lock: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  alert: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const OrganizationSignup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({ organizationName: "", email: "", phone: "", password: "", confirmPassword: "" });

  const handleInputChange = (e) => { setFormData((p) => ({ ...p, [e.target.name]: e.target.value })); if (error) setError(""); };

  const validateForm = () => {
    if (!formData.organizationName.trim()) return setError("Organisation name is required"), false;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError("Please enter a valid email address"), false;
    if (!formData.password || formData.password.length < 6) return setError("Password must be at least 6 characters"), false;
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match"), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { toast.error(error || "Please check your details"); return; }
    setIsLoading(true); setError(""); setSuccess("");
    try {
      const result = await authService.signUpOrganization(formData);
      if (result.success) {
        setSuccess(result.message); toast.success(result.message || "Account created successfully");
        setTimeout(() => navigate("/email-verification", { state: { email: formData.email, userType: "organization" } }), 2000);
      } else { setError(result.message); toast.error(result.message || "Signup failed"); }
    } catch { const msg = "An error occurred during signup. Please try again."; setError(msg); toast.error(msg); }
    finally { setIsLoading(false); }
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
          <div className="auth-left-logo"><img src={logo} alt="InternConnect" /><span>InternConnect</span></div>
          <h1 className="auth-left-headline">Post Internships.<br /><span>Build Your Team.</span></h1>
          <p className="auth-left-sub">Register your organisation to access our talent pool of motivated students across Nigeria and start posting internships today.</p>
          <div className="auth-left-stats">
            <div className="auth-stat-card"><div className="auth-stat-number">2-3</div><div className="auth-stat-label">Days to Verify</div></div>
            <div className="auth-stat-card"><div className="auth-stat-number">AI</div><div className="auth-stat-label">CV Screening</div></div>
            <div className="auth-stat-card"><div className="auth-stat-number">Free</div><div className="auth-stat-label">To Register</div></div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="auth-right">
        <div className="auth-mobile-logo"><img src={logo} alt="InternConnect" /><span>InternConnect</span></div>
        <div className="auth-form-card">
          <div className="auth-badge"><span className="auth-badge-dot" /> Organisation Signup</div>
          <h2 className="auth-title">Register your organisation</h2>
          <p className="auth-subtitle">Join InternConnect and start finding your next interns.</p>

          {error && <div className="auth-alert auth-alert-error" style={{ marginBottom: "1rem" }}>{icons.alert}<span>{error}</span></div>}
          {success && <div className="auth-alert auth-alert-success" style={{ marginBottom: "1rem" }}>{icons.check}<span>{success}</span></div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field-group">
              <label className="auth-label">Organisation name *</label>
              <div className="auth-input-wrap">{icons.building}<input className="auth-input" type="text" name="organizationName" placeholder="ACME Corporation" value={formData.organizationName} onChange={handleInputChange} disabled={isLoading} autoComplete="organization" /></div>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Official email address *</label>
              <div className="auth-input-wrap">{icons.mail}<input className="auth-input" type="email" name="email" placeholder="contact@company.com" value={formData.email} onChange={handleInputChange} disabled={isLoading} autoComplete="email" /></div>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Phone number</label>
              <div className="auth-input-wrap">{icons.phone}<input className="auth-input" type="tel" name="phone" placeholder="+234 xxx xxx xxxx" value={formData.phone} onChange={handleInputChange} disabled={isLoading} /></div>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Password *</label>
              <div className="auth-input-wrap">
                {icons.lock}
                <input className="auth-input" type={showPw ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleInputChange} disabled={isLoading} autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(p => !p)}><EyeIcon open={showPw} /></button>
              </div>
            </div>
            <div className="auth-field-group">
              <label className="auth-label">Confirm password *</label>
              <div className="auth-input-wrap">
                {icons.lock}
                <input className="auth-input" type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleInputChange} disabled={isLoading} autoComplete="new-password" />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowConfirm(p => !p)}><EyeIcon open={showConfirm} /></button>
              </div>
            </div>

            <div className="auth-checkbox-group">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/terms">Privacy Policy</Link></label>
            </div>

            <button type="submit" className="auth-submit" disabled={isLoading}>
              <span className="auth-submit-inner">
                {isLoading && <span className="auth-spinner" />}
                {isLoading ? "Creating Account…" : "Create Organisation Account"}
              </span>
            </button>
          </form>

          <div className="auth-footer-links">
            <p>Already have an account? <Link to="/organization-login">Sign in</Link></p>
            <p>Looking to join as a student? <Link to="/signup">Student Signup</Link></p>
          </div>
          <p className="auth-copyright">© {currentYear} InternConnect. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup;
