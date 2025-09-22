import { useState } from "react";

const InputField = ({ type, placeholder, icon, value, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="input-wrapper">
      <i className="material-symbols-rounded">{icon}</i>
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
        <i
          className="material-symbols-rounded show-password-icon"
          onClick={togglePasswordVisibility}
          style={{ cursor: "pointer" }}
        >
          {showPassword ? "visibility" : "visibility_off"}
        </i>
      )}
    </div>
  );
};

export default InputField;
