import '../style/button-1.css';

export function Buttons({ label, onClick, className }) {
  return (
    <button className={`custom-button-1 ${className}`} onClick={onClick}>
      {label}
    </button>
  );
}