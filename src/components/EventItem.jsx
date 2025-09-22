// Event Item Component
const EventItem = ({ title, time, type }) => {
  return (
    <div className="dashboard-event-item">
      <div className={`dashboard-event-dot ${type}`}></div>
      <div className="dashboard-event-content">
        <h4>{title}</h4>
        <p>{time}</p>
      </div>
    </div>
  );
};

export default EventItem;
