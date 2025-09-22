// SocialLogin.jsx
import "../style/social-login.css";

const SocialLogin = ({ onGoogleSignIn, loading }) => {
  return (
    <div className="social-login-container">
      <button
        type="button"
        className="social-login-button google-button"
        onClick={onGoogleSignIn}
        disabled={loading}
      >
        <div className="social-icon">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
            />
            <path
              fill="#34A853"
              d="M8.98 16c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75c-2.09 0-3.86-1.4-4.49-3.29H1.96v2.09A8 8 0 0 0 8.98 16z"
            />
            <path
              fill="#FBBC05"
              d="M4.49 9.48A4.8 4.8 0 0 1 4.49 7.48V5.39H1.96a8.08 8.08 0 0 0 0 6.18l2.53-2.09z"
            />
            <path
              fill="#EA4335"
              d="M8.98 4.23c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.96 5.39l2.53 2.09c.63-1.89 2.4-3.25 4.49-3.25z"
            />
          </svg>
        </div>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>
    </div>
  );
};

export default SocialLogin;
