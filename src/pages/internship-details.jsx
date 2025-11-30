import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../style/internship-details.css";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Loader from "../components/Loader.jsx";
import studentService from "../lib/studentService.js";
import { supabase } from "../lib/supabase.js";
import { isProfileComplete } from "../util/profileUtils";
import profileService from "../lib/profileService";
import { toast } from "../components/ui/sonner";

const InternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internshipData, setInternshipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({
    hasApplied: false,
    application: null,
  });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (id) {
      loadInternshipDetails();
      checkApplicationStatus();
    }
  }, [id]);

  const loadInternshipDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await studentService.getInternshipById(id);

      if (error) {
        setError(error);
      } else {
        setInternshipData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const { hasApplied, application } =
        await studentService.checkApplicationStatus(id);
      setApplicationStatus({ hasApplied, application });
    } catch (err) {
      console.error("Error checking application status:", err);
    }
  };

  const isDeadlinePassed = (deadlineString) => {
    if (!deadlineString) return false;
    const deadline = new Date(deadlineString);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return deadline < today;
  };

  const handleApplyNow = async () => {
    try {
      if (applicationStatus.hasApplied) {
        toast.info("You have already applied for this internship.");
        return;
      }

      if (isDeadlinePassed(internshipData.application_deadline)) {
        toast.error("Application deadline has passed. You cannot apply.");
        return;
      }

      // Check profile completeness before applying
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to apply for internships.");
        navigate("/login");
        return;
      }

      const { data: profileResult } = await profileService.getProfile(user.id);
      const profile = profileResult;
      const { complete, missingFields } = isProfileComplete(profile);
      if (!complete) {
        toast.error(
          `Please complete your profile before applying. Missing: ${missingFields.join(
            ", "
          )}`
        );
        navigate("/edit-profile");
        return;
      }

      navigate(`/apply/${id}`);
    } catch (err) {
      console.error("Error during apply navigation:", err);
      try {
        toast.error("Failed to proceed to apply. Please try again.");
      } catch (e) {}
    }
  };

  const handleViewProfile = () => {
    if (internshipData?.organizations?.id) {
      navigate(`/organizations-profile/${internshipData.organizations.id}`);
    }
  };

  const formatWorkType = (type) => {
    return type?.charAt(0).toUpperCase() + type?.slice(1) || "Not specified";
  };

  const formatCompensation = (comp) => {
    return comp?.charAt(0).toUpperCase() + comp?.slice(1) || "Not specified";
  };

  const formatDuration = (min, max) => {
    return `${min || 0} - ${max || 0} months`;
  };

  const formatRequirements = (requirements) => {
    if (!requirements) return [];

    return requirements
      .split("\n")
      .map((req, index) => (
        <li key={index}>{req.replace(/^[•\-\*]\s*/, "")}</li>
      ));
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysUntilDeadline = (deadlineString) => {
    if (!deadlineString) return null;

    const deadline = new Date(deadlineString);
    const today = new Date();
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader message="Loading internship details..." />
        <Footer />
      </>
    );
  }

  if (error || !internshipData) {
    return (
      <>
        <Navbar />
        <div className="internship-details-page">
          <div className="it-container">
            <div className="error-state">
              <h2>Internship Not Found</h2>
              <p>
                {error ||
                  "The internship you are looking for could not be found."}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/internships")}
              >
                Back to Internships
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="internship-details-page">
        <div className="it-container">
          {/* Header Section */}
          <div className="header-section">
            <div className="header-top">
              <img
                src={
                  internshipData.organizations?.logo_url ||
                  "https://via.placeholder.com/80x80/3498db/ffffff?text=ORG"
                }
                alt={`${
                  internshipData.organizations?.company_name || "Organization"
                } logo`}
                className="org-logo"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/80x80/3498db/ffffff?text=ORG";
                }}
              />
              <div className="header-info">
                <h1 className="position-title">
                  {internshipData.position_title}
                </h1>
                <h2 className="org-name">
                  {internshipData.organizations?.organization_name ||
                    "Unknown Organization"}
                </h2>
                <p className="department">
                  {internshipData.department} Department
                </p>
              </div>
            </div>

            <div className="meta-info">
              <div className="meta-item">
                <span className="meta-label">Location</span>
                <span className="meta-value">
                  {internshipData.location || "Not specified"}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Work Type</span>
                <span className="work-type-badge">
                  {formatWorkType(internshipData.work_type)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Duration</span>
                <span className="duration-badge">
                  {formatDuration(
                    internshipData.min_duration,
                    internshipData.max_duration
                  )}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Compensation</span>
                <span className="compensation-badge">
                  {formatCompensation(internshipData.compensation)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Application Deadline</span>
                <span className="deadline-badge">
                  {internshipData.application_deadline
                    ? new Date(
                        internshipData.application_deadline
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not specified"}
                </span>
              </div>
            </div>

            {/* Application Status */}
            {applicationStatus.hasApplied && (
              <div className="application-status">
                <div className="status-badge applied">
                  ✓ Applied on{" "}
                  {new Date(
                    applicationStatus.application?.applied_at
                  ).toLocaleDateString()}
                </div>
                <p>
                  Status:{" "}
                  {applicationStatus.application?.status
                    ?.charAt(0)
                    .toUpperCase() +
                    applicationStatus.application?.status?.slice(1) ||
                    "Pending"}
                </p>
              </div>
            )}

            {/* Deadline Warning */}
            {internshipData.application_deadline &&
              (() => {
                const daysLeft = getDaysUntilDeadline(
                  internshipData.application_deadline
                );

                if (daysLeft !== null && daysLeft <= 7 && daysLeft > 0) {
                  return (
                    <div className="deadline-warning-banner">
                      <span className="warning-icon">⏰</span>
                      <strong>Deadline approaching!</strong> Only {daysLeft} day
                      {daysLeft !== 1 ? "s" : ""} left to apply.
                    </div>
                  );
                } else if (daysLeft !== null && daysLeft <= 0) {
                  return (
                    <div className="deadline-expired-banner">
                      <span className="expired-icon">🔒</span>
                      <strong>Application closed.</strong> This internship is no
                      longer accepting applications.
                    </div>
                  );
                }
                return null;
              })()}
          </div>

          {/* Description Section */}
          <div className="content-section">
            <h3 className="section-title">About This Internship</h3>
            <p className="description-text">
              {internshipData.description || "No description provided."}
            </p>
          </div>

          {/* Requirements Section */}
          {internshipData.requirements && (
            <div className="content-section">
              <h3 className="section-title">Requirements</h3>
              <ul className="requirements-list">
                {formatRequirements(internshipData.requirements)}
              </ul>
            </div>
          )}

          {/* Organization Info Section */}
          <div className="content-section">
            <h3 className="section-title">
              About {internshipData.organizations?.company_name}
            </h3>
            <div className="org-info">
              <div className="org-details">
                <p>
                  <strong>Industry:</strong>{" "}
                  {internshipData.organizations?.industry || "Not specified"}
                </p>
                <p>
                  <strong>Company Type:</strong>{" "}
                  {internshipData.organizations?.company_type ||
                    "Not specified"}
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {internshipData.organizations?.org_location ||
                    internshipData.organizations?.location ||
                    "Not specified"}
                </p>
                {internshipData.organizations?.website && (
                  <p>
                    <strong>Website:</strong>{" "}
                    <a
                      href={internshipData.organizations.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {internshipData.organizations.website}
                    </a>
                  </p>
                )}
              </div>
              {internshipData.organizations?.company_description && (
                <p className="org-description">
                  {internshipData.organizations.company_description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className={`btn btn-primary ${
                applicationStatus.hasApplied ||
                isDeadlinePassed(internshipData.application_deadline)
                  ? "disabled"
                  : ""
              }`}
              onClick={handleApplyNow}
              disabled={
                applicationStatus.hasApplied ||
                applying ||
                isDeadlinePassed(internshipData.application_deadline)
              }
            >
              {applying
                ? "Applying..."
                : isDeadlinePassed(internshipData.application_deadline)
                ? "Application Closed"
                : applicationStatus.hasApplied
                ? "Already Applied"
                : "Apply Now"}
            </button>
            <button className="btn btn-secondary" onClick={handleViewProfile}>
              View Organization Profile
            </button>
          </div>

          <div className="posted-date">
            Posted {formatPostedDate(internshipData.created_at)}
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .loading-state,
        .error-state {
          text-align: center;
          padding: 3rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--bg-tertiary);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .application-status {
          background: var(--info-bg);
          border: 1px solid var(--info);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-badge.applied {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid var(--success-bg);
        }

        .org-info {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .org-details p {
          margin: 0.5rem 0;
        }

        .org-description {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        .btn.disabled {
          background: var(--text-tertiary);
          cursor: not-allowed;
        }

        .btn.disabled:hover {
          background: var(--text-tertiary);
        }

        .error-state h2 {
          color: var(--error);
          margin-bottom: 1rem;
        }

        .error-state p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }
        .deadline-badge {
          background: var(--warning-bg);
          color: var(--warning);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid var(--warning-bg);
        }

        .deadline-warning {
          background: var(--error-bg);
          border: 1px solid var(--error);
          color: var(--error);
        }

        .deadline-expired {
          background: var(--bg-tertiary);
          border: 1px solid var(--card-border);
          color: var(--text-secondary);
        }
        .deadline-warning-banner {
          background: var(--warning-bg);
          border: 2px solid var(--warning);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--warning);
        }

        .deadline-expired-banner {
          background: var(--error-bg);
          border: 2px solid var(--error);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--error);
        }

        .warning-icon,
        .expired-icon {
          font-size: 1.5rem;
        }
      `}</style>
    </>
  );
};

export default InternshipDetails;
