// Quick Action Component
const QuickAction = ({ icon, title, description }) => {
  return (
    <div className="dashboard-quick-action">
      <div className="dashboard-action-icon">{icon}</div>
      <div className="dashboard-action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default QuickAction;
