// Quick Action Component
const QuickAction = ({ icon, title, description, onClick }) => {
  return (
    <div
      className="dashboard-quick-action"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="dashboard-action-icon">{icon}</div>
      <div className="dashboard-action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default QuickAction;
