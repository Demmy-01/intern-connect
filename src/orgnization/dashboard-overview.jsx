import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./org.css";
import "./dashboard-layout.css";
import DashboardLayout from "./DashboardLayout";
import organizationService from "../lib/organizationService.js";
import { toast } from "../components/ui/sonner";
import { Button } from "../components/button.jsx";
import { Buttons } from "../components/button-1.jsx";
import useVerificationStatus from "../hooks/useVerificationStatus";
import Loader from "../components/Loader.jsx";

const OrganizationDashboard = () => {
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeInternships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check verification status
  const {
    isVerified,
    isPending,
    isRejected,
    loading: verificationLoading,
    restrictionMessage,
  } = useVerificationStatus();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all dashboard data
      const [statsResult, applicationsResult, internshipsResult] =
        await Promise.all([
          organizationService.getOrganizationStats(),
          organizationService.getRecentApplications(5),
          organizationService.getOrganizationInternships(),
        ]);

      if (statsResult.error) {
        console.error("Stats error:", statsResult.error);
        try {
          toast.error(`Error loading dashboard stats: ${statsResult.error}`);
        } catch (e) {}
      } else {
        setStats(statsResult.data);
      }

      if (applicationsResult.error) {
        console.error("Applications error:", applicationsResult.error);
        try {
          toast.error(
            `Error loading applications: ${applicationsResult.error}`
          );
        } catch (e) {}
      } else {
        setRecentApplications(applicationsResult.data);
      }

      if (internshipsResult.error) {
        console.error("Internships error:", internshipsResult.error);
        try {
          toast.error(`Error loading internships: ${internshipsResult.error}`);
        } catch (e) {}
      } else {
        setInternships(internshipsResult.data.slice(0, 5)); // Show only 5 most recent
      }
    } catch (err) {
      setError(err.message);
      try {
        toast.error(`Error loading dashboard: ${err.message}`);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return "#22c55e";
      case "rejected":
        return "#ef4444";
      case "reviewed":
        return "#f59e0b";
      case "pending":
      default:
        return "#6b7280";
    }
  };

  if (loading || verificationLoading) {
    return (
      <DashboardLayout>
        <Loader message="Loading your dashboard..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your internships.</p>
        </div>

        {/* Verification Status Restriction */}
        {restrictionMessage && (
          <div
            className={`verification-restriction ${
              restrictionMessage.type === "error"
                ? "verification-restriction--error"
                : "verification-restriction--warning"
            }`}
          >
            <div className="restriction-icon">
              {restrictionMessage.type === "error" ? "⚠️" : "⏳"}
            </div>
            <div className="restriction-content">
              <h3>{restrictionMessage.title}</h3>
              <p>{restrictionMessage.message}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.totalInternships}</div>
              <div className="stat-label">Total Internships</div>
              <div className="stat-sublabel">
                {stats.activeInternships} active
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h2.5l6-6L11 4.5l-6 6H4zm-2-2h2v2H2v-2zm0-2h2v2H2v-2zm10-6H10v2h2v-2z" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.totalApplications}</div>
              <div className="stat-label">Total Applications</div>
              <div className="stat-sublabel">
                {stats.pendingApplications} pending
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.acceptedApplications}</div>
              <div className="stat-label">Accepted</div>
              <div className="stat-sublabel">Applications approved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="stat-info">
              <div className="stat-number">{stats.rejectedApplications}</div>
              <div className="stat-label">Rejected</div>
              <div className="stat-sublabel">Applications declined</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Applications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/applications" className="view-all-link">
                View all
              </Link>
            </div>

            <div className="applications-list">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application.id} className="application-item">
                    <div className="applicant-info">
                      <div className="applicant-avatar">
                        {application.students?.profiles?.avatar_url ? (
                          <img
                            src={application.students.profiles.avatar_url}
                            alt={application.students.profiles.display_name}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {application.students?.profiles?.display_name?.charAt(
                              0
                            ) || "U"}
                          </div>
                        )}
                      </div>
                      <div className="applicant-details">
                        <div className="applicant-name">
                          {application.students?.profiles?.display_name ||
                            "Unknown"}
                        </div>
                        <div className="application-position">
                          {application.internships?.position_title}
                        </div>
                      </div>
                    </div>
                    <div className="application-meta">
                      <span
                        className="status-badge"
                        style={{
                          backgroundColor: getStatusColor(application.status),
                        }}
                      >
                        {application.status}
                      </span>
                      <span className="application-date">
                        {formatDate(application.applied_at)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No recent applications</p>
                </div>
              )}
            </div>
          </div>

          {/* Active Internships */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Your Internships</h2>
              <Link to="/posted-internship" className="view-all-link">
                View all
              </Link>
            </div>

            <div className="internships-list">
              {internships.length > 0 ? (
                internships.map((internship) => (
                  <div key={internship.id} className="internship-item">
                    <div className="internship-info">
                      <div className="internship-title">
                        {internship.position_title}
                      </div>
                      <div className="internship-department">
                        {internship.department}
                      </div>
                      <div className="internship-meta">
                        <span className="internship-type">
                          {internship.work_type}
                        </span>
                        <span className="internship-compensation">
                          {internship.compensation}
                        </span>
                      </div>
                    </div>
                    <div className="internship-stats">
                      <div className="stat-item">
                        <span className="stat-number">
                          {internship.applicationCount}
                        </span>
                        <span className="stat-label">Applications</span>
                      </div>
                      {internship.pendingCount > 0 && (
                        <div className="pending-badge">
                          {internship.pendingCount} pending
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No internships posted yet</p>
                  {isVerified ? (
                    <Link to="/post-internship" className="create-link">
                      Post your first internship
                    </Link>
                  ) : (
                    <p className="verification-required">
                      Complete verification to start posting internships
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {isVerified ? (
            <Link to="/post-internship" className="action-button primary">
              <Button label="Post New Internship" />
            </Link>
          ) : (
            <div
              className="action-button disabled"
              title="Organization must be verified to post internships"
            >
              <Button label="Post New Internship" />
            </div>
          )}
          <Link to="/applications" className="action-button secondary">
            <Buttons label="Review Applications" />
          </Link>
        </div>
      </div>

      <style jsx>{`
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1070e5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .dashboard-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .dashboard-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .dashboard-section {
          background: var(--card-bg) !important;
          border-radius: 12px;
          border: 1px solid var(--card-border);
          overflow: hidden;
        }

        .stat-card {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid var(--card-border);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }

        .verification-restriction {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid var(--card-border);
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .verification-restriction--warning {
          border-left: 4px solid #f59e0b;
          background: #fefce8;
        }

        .verification-restriction--error {
          border-left: 4px solid #ef4444;
          background: #fef2f2;
        }

        .restriction-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .restriction-content h3 {
          color: var(--text-primary);
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .restriction-content p {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
          line-height: 1.5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }



        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.blue {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        .stat-icon.green {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .stat-icon.success {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }
        .stat-icon.warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .stat-sublabel {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }



        .section-header {
          padding: 1.5rem;
          background: var(--card-bg) !important;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h2 {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .view-all-link {
          color: #1070e5;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
        }

        .view-all-link:hover {
          text-decoration: underline;
        }

        .applications-list,
        .internships-list {
          padding: 1rem;
        }

        .application-item,
        .internship-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          transition: background-color 0.2s;
          background: transparent !important;
        }

        .application-item:hover,
        .internship-item:hover {
          background: var(--bg-hover);
        }

        .applicant-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .applicant-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }

        .applicant-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 40px;
          height: 40px;
          background: var(--card-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .applicant-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .application-position {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .application-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .status-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .application-date {
          font-size: 0.75rem;
          color: var(--text-tertiary);
        }

        .internship-info {
          flex: 1;
        }

        .internship-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .internship-department {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .internship-meta {
          display: flex;
          gap: 0.5rem;
        }

        .internship-type,
        .internship-compensation {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .internship-stats {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-item .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          line-height: 1;
        }

        .stat-item .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .pending-badge {
          background: #fef3c7;
          color: #d97706;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .verification-required {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }

        .quick-actions {
          display: flex;
          gap: 3rem;
          justify-content: center;
        }

        .action-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }

        .action-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            flex-direction: column;
          }

          .action-button {
            text-align: center;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default OrganizationDashboard;
