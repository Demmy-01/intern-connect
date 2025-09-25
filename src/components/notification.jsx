import React from "react";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import ProfileService from "../lib/profileService";
import "../style/notification.css";

// Helper function to generate consistent colors for company logos
const getRandomColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs((Math.sin(hash) * 16777215) % 16777215)
  ).toString(16);
  return "#" + "0".repeat(6 - color.length) + color;
};

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
  const [profile, setProfile] = React.useState(null);
  const [applications, setApplications] = React.useState([]);
  const { user } = useAuth();

  React.useEffect(() => {
    if (user && isOpen) {
      // Fetch profile data
      const fetchProfile = async () => {
        const profileService = new ProfileService();
        const result = await profileService.getProfile(user.id);
        if (result.success) {
          setProfile(result.data);
        }
      };

      // Fetch applications
      const fetchApplications = async () => {
        const { data: applications, error } = await supabase
          .from("internship_applications")
          .select(
            `
            id,
            status,
            applied_at,
            updated_at,
            internships:internship_id (
              id,
              position_title,
              department,
              location,
              work_type,
              compensation,
              organizations (
                organization_name,
                organization_type,
                logo_url,
                location
              )
            )
          `
          )
          .eq("student_id", user.id)
          .eq("status", "accepted")
          .order("updated_at", { ascending: false });

        if (!error) {
          setApplications(applications || []);
        }
      };

      fetchProfile();
      fetchApplications();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="notification-backdrop" onClick={closeModal}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
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
          {/* Profile completion reminder */}
          {profile &&
            (!profile.bio ||
              !profile.skills?.length ||
              !profile.education?.length ||
              !profile.experiences?.length) && (
              <NotificationItem
                icon={<span className="reminder-icon">⚠️</span>}
                title="Complete Your Profile"
                description={`Your profile is incomplete. Please update your ${[
                  !profile.bio && "bio",
                  !profile.skills?.length && "skills",
                  !profile.education?.length && "education",
                  !profile.experiences?.length && "experience",
                ]
                  .filter(Boolean)
                  .join(", ")} to improve your chances of getting hired.`}
                timeAgo="Now"
                iconBg="#dc2626"
              />
            )}

          {/* Recent application updates */}
          {applications
            .filter((app) => app.status === "approved")
            .slice(0, 3)
            .map((app, index) => (
              <NotificationItem
                key={app.id}
                icon={<span className="intern-icon">🎉</span>}
                title="Application Approved!"
                description={`Congratulations! Your application for ${app.internships.position_title} at ${app.organizations.organization_name} has been approved. Check your dashboard for more details.`}
                timeAgo={new Date(app.updated_at).toLocaleDateString()}
                iconBg="#16a34a"
              />
            ))}
        </div>

        {/* Accepted Internships Section */}
        <div className="application-status-section">
          <h3 className="section-title">Accepted Internships</h3>

          {applications.length > 0 ? (
            <div className="offers-list">
              {applications.map((app) => (
                <div key={app.id} className="application-item">
                  <div className="logo-container">
                    {app.internships.organizations?.logo_url ? (
                      <img
                        src={app.internships.organizations.logo_url}
                        alt={app.internships.organizations.organization_name}
                        className="company-logo"
                      />
                    ) : (
                      <div
                        className="company-logo"
                        style={{
                          backgroundColor: getRandomColor(
                            app.internships.organizations.organization_name
                          ),
                        }}
                      >
                        <span className="company-initial">
                          {app.internships.organizations.organization_name.charAt(
                            0
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="application-content">
                    <div className="application-header">
                      <h4 className="company-name">
                        {app.internships.position_title}
                      </h4>
                      <span className="time-ago">
                        <span className="dot"></span>
                        {new Date(app.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="company-details">
                      {app.internships.organizations.organization_name}
                    </p>
                    <div className="internship-details">
                      <p className="location">📍 {app.internships.location}</p>
                      {app.internships.work_type && (
                        <p className="work-type">
                          💼 {app.internships.work_type}
                        </p>
                      )}
                      {app.internships.compensation && (
                        <p className="compensation">
                          💰 {app.internships.compensation}
                        </p>
                      )}
                    </div>
                    <div className="status-container success">
                      <span
                        className="status-text"
                        style={{ color: "#16a34a" }}
                      >
                        <CheckCircle
                          size={16}
                          color="#16a34a"
                          style={{ marginRight: "4px" }}
                        />
                        Accepted
                      </span>
                      <span className="additional-info">
                        Check your dashboard for details
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-applications">
              <p>No accepted internships yet. Keep applying!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
