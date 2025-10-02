import React, { useState, useEffect } from "react";
import "./org.css";
import "./dashboard-layout.css";
import "../style/applications.css";
import DashboardLayout from "./DashboardLayout";
import { Button } from "../components/button.jsx";
import { Link } from "react-router-dom";
import organizationService from "../lib/organizationService.js";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } =
        await organizationService.getOrganizationApplications();

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

    return matchesStatus && matchesPosition;
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
        <h1>Applications</h1>
        <div className="applications-stats">
          <span className="stat-item">Total: {stats.total}</span>
          <span className="stat-item">Pending: {stats.pending}</span>
          <span className="stat-item">Accepted: {stats.accepted}</span>
          <span className="stat-item">Rejected: {stats.rejected}</span>
        </div>
      </div>

      <div className="applications-filters">
        <button
          className={`filter-btn ${statusFilter  === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All Applications ({stats.total})
        </button>
        <button
          className={`filter-btn ${statusFilter  === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={`filter-btn ${statusFilter  === "accepted" ? "active" : ""}`}
          onClick={() => setStatusFilter("accepted")}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          className={`filter-btn ${statusFilter  === "rejected" ? "active" : ""}`}
          onClick={() => setStatusFilter("rejected")}
        >
          Rejected ({stats.rejected})
        </button>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="filter-btn"
        >
          <option value="all">All Positions</option>
          {uniquePositions.map((pos, idx) => (
            <option key={idx} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

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
                <th>Date Applied</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td className="applicant-cell">
                    <div className="applicant-info">
                      <div className="applicant-avatar">
                        {application.students?.profiles?.avatar_url ? (
                          <img
                            src={application.students.profiles.avatar_url}
                            alt={
                              application.students.profiles.full_name ||
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
        .loading-container,
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
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

        .retry-button {
          background: #1070e5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
        }

        .retry-button:hover {
          background: #0856c1;
        }

        .applications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .applications-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-item {
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .applications-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .filter-btn {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s;
        }

        .filter-btn.active,
        .filter-btn:hover {
          background: #1070e5;
          color: white;
          border-color: #1070e5;
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
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: #64748b;
        }

        .no-applications {
          text-align: center;
          padding: 3rem;
          color: #64748b;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .status-badge.accepted {
          background-color: #dcfce7;
          color: #16a34a;
        }

        .status-badge.rejected {
          background-color: #fef2f2;
          color: #dc2626;
        }

        .status-badge.reviewed {
          background-color: #fef3c7;
          color: #d97706;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Applications;
