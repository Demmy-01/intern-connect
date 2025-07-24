import google from "../assets/google.png";
import apple from "../assets/apple.png";
import "../style/login.css";

const SocialLogin = () => {
  return (
    <div className="social-login">
      <button className="social-button">
        <img
          src={google}
          alt="google"
          class="social-icon"
          height={"20px"}
          width={"auto"}
        />
        <p>Google</p>
      </button>
      <button className="social-button">
        <img
          src={apple}
          alt="apple"
          class="social-icon"
          height={"20px"}
          width={"auto"}
        />
        <p>Apple</p>
      </button>
    </div>
  );
};

export default SocialLogin;
