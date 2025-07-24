import InputField from "../components/InputField";
import SocialLogin from "../components/SocialLogin";
import { Link } from "react-router-dom";
import logo from "../assets/logo_blue.png";

const SignUp = () => {
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
          <h2 className="form-title">SignUp With</h2>
          <SocialLogin />

          <p className="separator">
            <span>Or</span>
          </p>
          <form action="" className="login-form">
            <InputField
              type="text"
              placeholder="username"
              icon="account_circle"
            />
            <InputField type="email" placeholder="email address" icon="mail" />
            <InputField type="password" placeholder="Password" icon="lock" />
            <button className="login-button">Sign Up</button>
          </form>

          <p className="signup-text">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
      <center>
        <p>© 2025 Intern Connect</p>
      </center>
    </>
  );
};

export default SignUp;
