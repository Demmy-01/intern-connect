const InputField = ({ type, placeholder, icon }) => {
  return (
    <div className="input-wrapper">
      <i className="material-symbols-rounded">{icon}</i>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        required
      />
      {type === "password" && (
        <i className="material-symbols-rounded show-password-icon">
          {" "}
          visibility_off
        </i>
      )}
    </div>
  );
};

export default InputField;
