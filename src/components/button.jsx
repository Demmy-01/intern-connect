import '../style/button.css';

export const Button = ({ label, onClick, disabled, variant = "primary" }) => {
  return (
    <button
      className={`btn btn-${variant} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};