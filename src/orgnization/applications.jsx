import React, { useState, useEffect } from "react";
import "./org.css";
import "./dashboard-layout.css";
import "../style/applications.css";
import DashboardLayout from "./DashboardLayout";
import { Button } from "../components/button.jsx";
import { Link } from "react-router-dom";
import organizationService from "../lib/organizationService.js";
import ManualScreeningPanel from "../components/ManualScreeningPanel.jsx";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [screeningFilter, setScreeningFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [screeningStats, setScreeningStats] = useState(null);

  useEffect(() => {
    loadApplications();
    loadScreeningStats();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } =
        await organizationService.getOrganizationApplicationsWithDocument();

      if (error) {
        setError(error);
        console.error("Applications error:", error);
      } else {
        setApplications(data || []);
        console.log("Loaded applications:", data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Applications exception:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadScreeningStats = async () => {
    try {
      const { data } = await organizationService.getScreeningStats();
      setScreeningStats(data);
      console.log("Screening stats:", data);
    } catch (err) {
      console.error("Error loading screening stats:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, " - ");
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "pending";
      case "accepted":
        return "accepted";
      case "rejected":
        return "rejected";
      case "reviewed":
        return "reviewed";
      default:
        return "pending";
    }
  };

  const getScreeningBadgeClass = (screeningStatus) => {
    switch (screeningStatus) {
      case "shortlisted":
        return "shortlisted";
      case "flagged_review":
        return "flagged";
      case "auto_rejected":
        return "auto-rejected";
      case "ai_screened":
        return "screened";
      default:
        return "unscreened";
    }
  };

  const getScreeningLabel = (screeningStatus) => {
    switch (screeningStatus) {
      case "shortlisted":
        return "Shortlisted";
      case "flagged_review":
        return "Needs Review";
      case "auto_rejected":
        return "Auto-Rejected";
      case "ai_screened":
        return "AI Screened";
      case "unscreened":
        return "Not Screened";
      default:
        return screeningStatus;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const uniquePositions = [
    ...new Set(
      applications.map((app) => app.internships?.position_title || "Unknown")
    ),
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      statusFilter === "all" ||
      app.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesPosition =
      positionFilter === "all" ||
      (app.internships?.position_title || "Unknown") === positionFilter;

    const matchesScreening =
      screeningFilter === "all" || app.screening_status === screeningFilter;

    return matchesStatus && matchesPosition && matchesScreening;
  });

  const getStats = () => {
    return {
      total: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      accepted: applications.filter((app) => app.status === "accepted").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="applications-header">
          <h1>Applications</h1>
        </div>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="applications-header">
          <h1>Applications</h1>
        </div>
        <div className="error-container">
          <p>Error loading applications: {error}</p>
          <button onClick={loadApplications} className="retry-button">
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="applications-header">
        <h1>Applications Management</h1>
      </div>

      <ManualScreeningPanel
        applications={applications}
        onScreeningComplete={loadApplications}
      />
      {/* AI Screening Stats Dashboard */}
      {screeningStats && (
        <div className="screening-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Applications</div>
            <div className="stat-value">{screeningStats.total}</div>
          </div>
          <div className="stat-card stat-shortlisted">
            <div className="stat-label">✓ Shortlisted</div>
            <div className="stat-value">{screeningStats.shortlisted}</div>
          </div>
          <div className="stat-card stat-flagged">
            <div className="stat-label">⚠ Needs Review</div>
            <div className="stat-value">{screeningStats.flagged}</div>
          </div>
          <div className="stat-card stat-rejected">
            <div className="stat-label">✗ Auto-Rejected</div>
            <div className="stat-value">{screeningStats.autoRejected}</div>
          </div>
          <div className="stat-card stat-average">
            <div className="stat-label">Avg AI Score</div>
            <div className="stat-value">{screeningStats.averageScore}%</div>
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="applications-filters">
        <button
          className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All Applications ({stats.total})
        </button>
        <button
          className={`filter-btn ${statusFilter === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-btn ${
            statusFilter === "accepted" ? "active" : ""
          }`}
          onClick={() => setStatusFilter("accepted")}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          className={`filter-btn ${
            statusFilter === "rejected" ? "active" : ""
          }`}
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* AI Screening Filters */}
      <div className="screening-filters">
        <label className="filter-label">AI Screening Status:</label>
        <button
          className={`filter-btn ${screeningFilter === "all" ? "active" : ""}`}
          onClick={() => setScreeningFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn screening-shortlist ${
            screeningFilter === "shortlisted" ? "active" : ""
          }`}
          onClick={() => setScreeningFilter("shortlisted")}
        >
          Shortlisted
        </button>
        <button
          className={`filter-btn screening-flagged ${
            screeningFilter === "flagged_review" ? "active" : ""
          }`}
          onClick={() => setScreeningFilter("flagged_review")}
        >
          Needs Review
        </button>
        <button
          className={`filter-btn screening-rejected ${
            screeningFilter === "auto_rejected" ? "active" : ""
          }`}
          onClick={() => setScreeningFilter("auto_rejected")}
        >
          Auto-Rejected
        </button>

        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="filter-btn position-select"
        >
          <option value="all">All Positions</option>
          {uniquePositions.map((pos, idx) => (
            <option key={idx} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      <div className="applications-table-container">
        {filteredApplications.length === 0 ? (
          <div className="no-applications">
            <p>No applications found for the selected filter.</p>
            {applications.length === 0 && (
              <p>You haven't received any applications yet.</p>
            )}
          </div>
        ) : (
          <table className="applications-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>AI Score</th>
                <th>Screening Status</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr
                  key={application.id}
                  className={`app-row ${
                    application.screening_status === "auto_rejected"
                      ? "auto-rejected-row"
                      : ""
                  }`}
                >
                  <td className="applicant-cell">
                    <div className="applicant-info">
                      <div className="applicant-avatar">
                        {application.students?.profiles?.avatar_url ? (
                          <img
                            src={application.students.profiles.avatar_url}
                            alt={
                              application.students.profiles.display_name ||
                              "Student"
                            }
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {application.students?.profiles?.display_name?.charAt(
                              0
                            ) || "U"}
                          </div>
                        )}
                      </div>
                      <div className="applicant-name">
                        {application.students?.profiles?.display_name ||
                          "Unknown Student"}
                      </div>
                    </div>
                  </td>
                  <td className="position-cell">
                    {application.internships?.position_title ||
                      "Unknown Position"}
                  </td>
                  <td className="score-cell">
                    {application.ai_score !== null ? (
                      <div
                        className="score-badge"
                        style={{
                          backgroundColor: getScoreColor(application.ai_score),
                        }}
                      >
                        {application.ai_score}%
                      </div>
                    ) : (
                      <span className="no-score">Not screened</span>
                    )}
                  </td>
                  <td className="screening-cell">
                    <span
                      className={`screening-badge ${getScreeningBadgeClass(
                        application.screening_status
                      )}`}
                    >
                      {getScreeningLabel(application.screening_status)}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(application.applied_at)}
                  </td>
                  <td className="status-cell">
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        application.status
                      )}`}
                    >
                      {application.status
                        ? application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)
                        : "Unknown"}
                    </span>
                  </td>
                  <td className="decision-cell">
                    <div className="decision-buttons">
                      <Link to={`/application-review/${application.id}`}>
                        <Button label="Review" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .screening-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          text-align: center;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .stat-shortlisted { border-color: #22c55e; }
        .stat-flagged { border-color: #f59e0b; }
        .stat-rejected { border-color: #ef4444; }
        .stat-average { border-color: #3b82f6; }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
        }

        .screening-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-label {
          font-weight: 600;
          color: #475569;
        }

        .screening-shortlist.active {
          background: #22c55e !important;
          border-color: #22c55e !important;
        }

        .screening-flagged.active {
          background: #f59e0b !important;
          border-color: #f59e0b !important;
        }

        .screening-rejected.active {
          background: #ef4444 !important;
          border-color: #ef4444 !important;
        }

        .position-select {
          min-width: 200px;
        }

        .score-cell {
          text-align: center;
        }

        .score-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .no-score {
          color: #94a3b8;
          font-size: 0.875rem;
          font-style: italic;
        }

        .screening-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .screening-badge.shortlisted {
          background: #dcfce7;
          color: #16a34a;
        }

        .screening-badge.flagged {
          background: #fef3c7;
          color: #d97706;
        }

        .screening-badge.auto-rejected {
          background: #fee2e2;
          color: #dc2626;
        }

        .screening-badge.screened {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .screening-badge.unscreened {
          background: #f1f5f9;
          color: #64748b;
        }

        .auto-rejected-row {
          background: #fef2f2;
          opacity: 0.8;
        }

        .auto-rejected-row:hover {
          opacity: 1;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Applications;
