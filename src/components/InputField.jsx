import { useState } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";

const InputField = ({ type, placeholder, icon, value, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  const renderIcon = () => {
    const iconProps = {
      size: 20,
      strokeWidth: 2.5,
      color: "#2a5298",
      className: "input-icon-svg",
    };

    switch (icon) {
      case "mail":
      case "email":
        return <Mail {...iconProps} />;
      case "lock":
      case "password":
        return <Lock {...iconProps} />;
      case "user":
      case "username":
      case "account_circle":
        return <User {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="input-wrapper">
      {renderIcon()}
      <input
        type={inputType}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
        required
      />
      {type === "password" && (
        <div
          className="show-password-icon"
          onClick={togglePasswordVisibility}
          style={{ cursor: "pointer" }}
        >
          {showPassword ? (
            <EyeOff
              size={24}
              strokeWidth={2.5}
              color="#2a5298"
              className="password-toggle-icon"
            />
          ) : (
            <Eye
              size={24}
              strokeWidth={2.5}
              color="#2a5298"
              className="password-toggle-icon"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InputField;
