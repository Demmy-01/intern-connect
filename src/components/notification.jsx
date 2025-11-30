import React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  X,
  CheckCircle,
  AlertCircle,
  User,
  Award,
  Calendar,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import ProfileService from "../lib/profileService";
import studentDashboardService from "../lib/studentDashboardService";
import studentService from "../lib/studentService";
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

// Welcome notification for new users
const WelcomeNotification = ({ userName }) => (
  <div className="notification-item welcome-item">
    <div className="icon-container welcome-icon">
      <Star size={18} color="white" />
    </div>
    <div className="notification-content">
      <div className="notification-header">
        <h4 className="notification-title">Welcome to Intern Connect!</h4>
        <span className="time-ago">
          <span className="dot"></span>
          New
        </span>
      </div>
      <p className="notification-description">
        Hi {userName || "there"}! Welcome to your internship journey. Complete
        your profile and start applying to amazing opportunities today!
      </p>
    </div>
  </div>
);

// Profile completion notification
const ProfileCompletionNotification = ({ profile }) => {
  const missingFields = [
    !profile?.bio && "bio",
    (!profile?.skills || profile.skills.length === 0) && "skills",
    (!profile?.education || profile.education.length === 0) && "education",
    (!profile?.experiences || profile.experiences.length === 0) && "experience",
  ].filter(Boolean);

  const completionPercentage = Math.round(
    ((4 - missingFields.length) / 4) * 100
  );

  // Profile notification doesn't use `dateStr` - left over from move earlier

  return (
    <div className="notification-item profile-item">
      <div className="icon-container profile-icon">
        <User size={18} color="white" />
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">Complete Your Profile</h4>
          <span className="time-ago">
            <span className="dot"></span>
            {completionPercentage}% done
          </span>
        </div>
        <p className="notification-description">
          Your profile is {completionPercentage}% complete. Add your{" "}
          {missingFields.join(", ")}
          to increase your chances of getting hired by up to 70%!
        </p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="notification-actions" style={{ marginTop: "0.5rem" }}>
          <Link to="/edit-profile" className="btn btn-link">
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

// Application status notification
const ApplicationStatusNotification = ({ app, type = "approved" }) => {
  const getNotificationContent = () => {
    switch (type) {
      case "approved":
        return {
          icon: <CheckCircle size={18} color="white" />,
          iconBg: "#10b981",
          title: "Application Approved!",
          description: `Congratulations! Your application for ${app.internships.position_title} at ${app.internships.organizations?.organization_name} has been approved.`,
        };
      case "rejected":
        return {
          icon: <X size={18} color="white" />,
          iconBg: "#ef4444",
          title: "Application Update",
          description: `Your application for ${app.internships.position_title} was not successful this time. Keep applying - the right opportunity is waiting!`,
        };
      case "applied":
        return {
          icon: <CheckCircle size={18} color="white" />,
          iconBg: "#0ea5e9",
          title: "Application Submitted",
          description: `Your application for ${app.internships.position_title} at ${app.internships.organizations?.organization_name} has been submitted. Good luck!`,
        };
      default:
        return {
          icon: <AlertCircle size={18} color="white" />,
          iconBg: "#f59e0b",
          title: "Application Under Review",
          description: `Your application for ${app.internships.position_title} is being reviewed. We'll notify you once there's an update.`,
        };
    }
  };

  const content = getNotificationContent();
  // Friendly date: prefer applied_at, fallback to updated_at
  const dateStr =
    app?.applied_at || app?.updated_at || new Date().toISOString();

  return (
    <div className="notification-item">
      <div
        className="icon-container"
        style={{ backgroundColor: content.iconBg }}
      >
        {content.icon}
      </div>
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{content.title}</h4>
          <span className="time-ago">
            <span className="dot"></span>
            {new Date(dateStr).toLocaleDateString()}
          </span>
        </div>
        <p className="notification-description">{content.description}</p>
      </div>
    </div>
  );
};

// Accepted internship item
const AcceptedInternshipItem = ({ app }) => {
  return (
    <div className="internship-card">
      <div className="internship-logo">
        {app.internships.organizations?.logo_url ? (
          <img
            src={app.internships.organizations.logo_url}
            alt={app.internships.organizations.organization_name}
            className="company-logo-img"
          />
        ) : (
          <div
            className="company-logo-placeholder"
            style={{
              backgroundColor: getRandomColor(
                app.internships.organizations?.organization_name || "Default"
              ),
            }}
          >
            <span className="company-initial">
              {app.internships.organizations?.organization_name?.charAt(0) ||
                "?"}
            </span>
          </div>
        )}
      </div>

      <div className="internship-info">
        <div className="internship-header">
          <h4 className="internship-title">{app.internships.position_title}</h4>
          <div className="success-badge">
            <CheckCircle size={16} />
            <span>Accepted</span>
          </div>
        </div>

        <p className="company-name">
          {app.internships.organizations?.organization_name}
        </p>

        <div className="internship-details">
          <div className="detail-item">
            <Calendar size={14} />
            <span>{app.internships.location}</span>
          </div>
          {app.internships.work_type && (
            <div className="detail-item">
              <Award size={14} />
              <span>{app.internships.work_type}</span>
            </div>
          )}
          {app.internships.compensation && (
            <div className="detail-item">
              <span className="compensation-label">💰</span>
              <span>{app.internships.compensation}</span>
            </div>
          )}
        </div>

        <div className="acceptance-date">
          <span className="date-label">Accepted on:</span>
          <span className="date-value">
            {new Date(app.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
const NotificationModal = ({ isOpen, closeModal }) => {
  const [profile, setProfile] = React.useState(null);
  const [applications, setApplications] = React.useState([]);
  const [isNewUser, setIsNewUser] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();

  const subscriptionRef = useRef(null);

  React.useEffect(() => {
    if (user && isOpen) {
      loadNotificationData();
      // attach realtime subscription
      attachRealtimeSubscription();
    }

    // cleanup on close or unmount
    return () => {
      if (subscriptionRef.current) {
        studentService.unsubscribe(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user, isOpen]);

  const attachRealtimeSubscription = async () => {
    try {
      const sub = await studentService.subscribeToApplicationUpdates(
        (payload) => {
          handleRealtimePayload(payload);
        }
      );
      subscriptionRef.current = sub;
    } catch (err) {
      console.error("Error subscribing to application updates:", err);
    }
  };

  // Listen for newly created or updated applications (event bus) and refresh notifications
  React.useEffect(() => {
    const handleAppEvent = (e) => {
      try {
        const studentId = e?.detail?.studentId;
        if (!user || !studentId) return;
        if (studentId === user.id) {
          loadNotificationData();
        }
      } catch (err) {
        console.error("Error handling internship application event:", err);
      }
    };

    window.addEventListener("internshipApplication:created", handleAppEvent);
    window.addEventListener("internshipApplication:updated", handleAppEvent);
    return () => {
      window.removeEventListener(
        "internshipApplication:created",
        handleAppEvent
      );
      window.removeEventListener(
        "internshipApplication:updated",
        handleAppEvent
      );
    };
  }, [user]);

  const handleRealtimePayload = (payload) => {
    try {
      // Supabase real-time payload can differ; handle multiple shapes
      const evtType =
        payload?.eventType ||
        payload?.type ||
        payload?.event ||
        payload?.eventType;
      // new/record sometimes available under 'new', 'record' or payload.payload.new
      const record =
        payload?.new ||
        payload?.record ||
        payload?.payload?.new ||
        payload?.payload?.record ||
        payload?.payload?.data ||
        null;

      if (!record) return;

      if (evtType === "INSERT") {
        setApplications((prev) => [
          record,
          ...prev.filter((a) => a.id !== record.id),
        ]);
        window.dispatchEvent(
          new CustomEvent("internshipApplication:created", {
            detail: {
              studentId: record.student_id,
              internshipId: record.internship_id,
              application: record,
            },
          })
        );
      } else if (evtType === "UPDATE") {
        setApplications((prev) =>
          prev.map((a) => (a.id === record.id ? record : a))
        );
        // dispatch update event
        window.dispatchEvent(
          new CustomEvent("internshipApplication:updated", {
            detail: {
              studentId: record.student_id,
              internshipId: record.internship_id,
              application: record,
            },
          })
        );
      } else if (evtType === "DELETE") {
        setApplications((prev) => prev.filter((a) => a.id !== record.id));
        window.dispatchEvent(
          new CustomEvent("internshipApplication:deleted", {
            detail: {
              studentId: record.student_id,
              internshipId: record.internship_id,
              application: record,
            },
          })
        );
      }
    } catch (err) {
      console.error("Error handling realtime payload:", err);
    }
  };

  const loadNotificationData = async () => {
    try {
      setLoading(true);

      // Check if user is new (created within last 7 days)
      const userCreated = new Date(user.created_at);
      const daysSinceCreated = Math.floor(
        (new Date() - userCreated) / (1000 * 60 * 60 * 24)
      );
      setIsNewUser(daysSinceCreated <= 7);

      // Fetch profile data
      const profileService = new ProfileService();
      const profileResult = await profileService.getProfile(user.id);
      if (profileResult.success) {
        setProfile(profileResult.data);
      }

      // Fetch applications via shared student dashboard service so it's consistent with the dashboard
      try {
        const { data: apps, error: appsError } =
          await studentDashboardService.getStudentApplications();
        if (appsError) throw new Error(appsError);
        setApplications(apps || []);
        // Debug: log fetched applications for dev verification
        console.debug(
          "NotificationModal: fetched applications",
          apps?.length,
          apps
        );
      } catch (appsErr) {
        console.error(
          "Error fetching applications via studentDashboardService:",
          appsErr
        );
        setApplications([]);
      }
    } catch (error) {
      console.error("Error loading notification data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const acceptedApplications = applications.filter(
    (app) => app.status === "accepted" || app.status === "approved"
  );
  const isProfileIncomplete =
    profile &&
    (!profile.bio ||
      !profile.skills?.length ||
      !profile.education?.length ||
      !profile.experiences?.length);

  return (
    <div className="notification-backdrop" onClick={closeModal}>
      <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
        {/* Enhanced Modal Header */}
        <div className="modal-header">
          <div className="header-left">
            <div className="header-icon">
              <Bell size={20} color="#1070e5" />
            </div>
            <div className="header-content">
              <h2 className="modal-title">Notifications</h2>
              <span className="header-subtitle">
                Stay updated with your internship journey
              </span>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="close-button"
            aria-label="Close notification modal"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : (
          <>
            {/* Notifications Section */}
            <div className="notifications-section">
              {/* Welcome notification for new users */}
              {isNewUser && (
                <WelcomeNotification userName={profile?.first_name} />
              )}

              {/* Profile completion reminder */}
              {isProfileIncomplete && (
                <ProfileCompletionNotification profile={profile} />
              )}

              {/* Recent application updates */}
              {/* Newly submitted applications */}
              {applications
                .filter(
                  (app) =>
                    app.status === "pending" ||
                    app.status === "applied" ||
                    app.status === "submitted"
                )
                .slice(0, 2)
                .map((app) => (
                  <ApplicationStatusNotification
                    key={`applied-${app.id}`}
                    app={app}
                    type="applied"
                  />
                ))}
              {applications
                .filter(
                  (app) =>
                    app.status === "accepted" || app.status === "approved"
                )
                .slice(0, 2)
                .map((app) => (
                  <ApplicationStatusNotification
                    key={`approved-${app.id}`}
                    app={app}
                    type="approved"
                  />
                ))}

              {applications
                .filter((app) => app.status === "rejected")
                .slice(0, 1)
                .map((app) => (
                  <ApplicationStatusNotification
                    key={`rejected-${app.id}`}
                    app={app}
                    type="rejected"
                  />
                ))}

              {/* Show message if no notifications */}
              {!isNewUser &&
                !isProfileIncomplete &&
                applications.length === 0 && (
                  <div className="no-notifications">
                    <Bell size={48} color="#e5e7eb" />
                    <h3>No new notifications</h3>
                    <p>You're all caught up! Check back later for updates.</p>
                  </div>
                )}
            </div>

            {/* Accepted Internships Section */}
            {acceptedApplications.length > 0 && (
              <div className="accepted-internships-section">
                <div className="section-header">
                  <h3 className="section-title">
                    <CheckCircle size={20} color="#10b981" />
                    Accepted Internships
                  </h3>
                  <span className="section-count">
                    {acceptedApplications.length} offer
                    {acceptedApplications.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="internships-list">
                  {acceptedApplications.map((app) => (
                    <AcceptedInternshipItem key={app.id} app={app} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
