import React from "react";

const StatsCard = ({ title, value, subtitle, icon, onClick }) => {
  return (
    <div 
      className={`dashboard-stats-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="dashboard-stats-header">
        <div className="dashboard-stats-title">{title}</div>
        <div className="dashboard-stats-icon">{icon}</div>
      </div>
      <div className="dashboard-stats-value">{value}</div>
      <div className="dashboard-stats-subtitle">{subtitle}</div>
    </div>
  );
};

export default StatsCard;