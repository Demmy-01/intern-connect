import '../style/button.css';

export function Button({ label, onClick, className }) {
  return (
    <button className={`custom-button ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}