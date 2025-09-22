import React from "react";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";
import "../style/notification.css";

// Reusable NotificationItem Component
const NotificationItem = ({ icon, title, description, timeAgo, iconBg }) => {
  return (
    <div className="notification-item">
      <div className="icon-container" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{title}</h4>
          <span className="time-ago">
            <span className="dot"></span>
            {timeAgo}
          </span>
        </div>
        <p className="notification-description">{description}</p>
      </div>
    </div>
  );
};

// Reusable ApplicationStatusItem Component
const ApplicationStatusItem = ({
  logoComponent,
  companyName,
  companyType,
  location,
  status,
  statusColor,
  timeAgo,
  additionalInfo,
}) => {
  const getStatusIcon = () => {
    if (status === "Approved") {
      return <CheckCircle size={16} color="#16a34a" />;
    }
    if (status === "Under Review") {
      return <AlertCircle size={16} color="#ca8a04" />;
    }
    return null;
  };

  return (
    <div className="application-item">
      <div className="logo-container">{logoComponent}</div>
      <div className="application-content">
        <div className="application-header">
          <h4 className="company-name">{companyName}</h4>
          <span className="time-ago">
            <span className="dot"></span>
            {timeAgo}
          </span>
        </div>
        <p className="company-details">{companyType}</p>
        <p className="location">Location: {location}</p>
        <div className="status-container">
          <span className="status-label">Status: </span>
          <span className="status-text" style={{ color: statusColor }}>
            {status}
          </span>
          {getStatusIcon()}
          {additionalInfo && (
            <span className="additional-info">{additionalInfo}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
const NotificationModal = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-left">
            <Bell size={20} color="#333" />
            <h2 className="modal-title">Notification</h2>
          </div>
          <div className="header-right">
            <span className="check-status">Check Application Status</span>
            <button
              onClick={closeModal}
              className="close-button"
              aria-label="Close notification modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notification Items */}
        <div className="notifications-section">
          <NotificationItem
            icon={<span className="intern-icon">👨‍💼</span>}
            title="Intern Opportunities:"
            description="A new internship has been posted! Check out Premium Pension's opening for IT assistant."
            timeAgo="5 hours ago"
            iconBg="#ff8c42"
          />

          <NotificationItem
            icon={<span className="reminder-icon">⚠️</span>}
            title="Reminder:"
            description="Don't forget to complete your profile to access personalized opportunities."
            timeAgo="3 days ago"
            iconBg="#dc2626"
          />
        </div>

        {/* Application Status Section */}
        <div className="application-status-section">
          <h3 className="section-title">Application Status</h3>

          <ApplicationStatusItem
            logoComponent={
              <div className="quickee-logo">
                <span className="quickee-text">QuicKee</span>
              </div>
            }
            companyName="QuicKee"
            companyType="Food Ordering organization"
            location="Abuja"
            status="Approved"
            statusColor="#16a34a"
            timeAgo="3 weeks ago"
            additionalInfo="Check your Email for more information"
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
