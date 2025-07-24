import InputField from "../components/InputField";
import SocialLogin from "../components/SocialLogin";
import { Link } from "react-router-dom";
import "../style/login.css";
import logo from "../assets/logo_blue.png";

const Login = () => {
  return (
    <>
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
          <h2 className="form-title">Login with </h2>
          <SocialLogin />

          <p className="separator">
            <span>Or</span>
          </p>
          <form action="" className="login-form">
            <InputField type="email" placeholder="email address" icon="mail" />
            <InputField type="password" placeholder="password" icon="lock" />

            <a href="login" className="forgot-pass-link">
              Forgot password?
            </a>

            <button className="login-button">Login</button>
          </form>

          <p className="signup-text">
            Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>

      <center>
        <p>© 2025 Intern Connect</p>
      </center>
    </>
  );
};

export default Login;
