import { useState } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";

const InputField = ({ type, placeholder, icon, value, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  const renderIcon = () => {
    switch (icon) {
      case "mail":
        return <Mail size={24} />;
      case "lock":
        return <Lock size={24} />;
      case "user":
        return <User size={24} />;
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
            <EyeOff size={24} />
          ) : (
            <Eye size={24} />
          )}
        </div>
      )}
    </div>
  );
};

export default InputField;
