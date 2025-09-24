import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./org.css";
import "./dashboard-layout.css";
import DashboardLayout from "./DashboardLayout";
import cv from "../assets/cv.png";
import person from "../assets/person.png";
import calendar from "../assets/calander.png";
import email from "../assets/email.png";
import location from "../assets/location.png";
import time from "../assets/time.png";
import school from "../assets/school.png";
import profile from "../assets/profile.png";
import organizationService from "../lib/organizationService.js";

const ApplicationDetails = () => {
  const { id: applicationId } = useParams();
  const navigate = useNavigate();

  const [applicationData, setApplicationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (applicationId) {
      loadApplicationDetails();
    }
  }, [applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await organizationService.getApplicationDetails(
        applicationId
      );

      if (error) {
        setError(error);
      } else {
        setApplicationData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!applicationData) return;

    const confirmMessage =
      status === "accepted"
        ? "Are you sure you want to accept this application?"
        : "Are you sure you want to reject this application?";

    if (window.confirm(confirmMessage)) {
      try {
        setUpdating(true);
        const { data, error } =
          await organizationService.updateApplicationStatus(
            applicationId,
            status
          );

        if (error) {
          alert(
            `Error ${
              status === "accepted" ? "accepting" : "rejecting"
            } application: ${error}`
          );
        } else {
          alert(
            `Application ${
              status === "accepted" ? "accepted" : "rejected"
            } successfully!`
          );
          setApplicationData((prev) => ({ ...prev, status }));
        }
      } catch (err) {
        alert(`Error updating application: ${err.message}`);
      } finally {
        setUpdating(false);
      }
    }
  };

  const downloadDocument = (documentUrl, fileName) => {
    if (documentUrl) {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = fileName || "document";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, " - ");
  };

  const parseApplicationNotes = (notes) => {
    return organizationService.parseApplicationNotes(notes);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading application details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !applicationData) {
    return (
      <DashboardLayout>
        <div className="error-container">
          <h2>Unable to Load Application</h2>
          <p>{error || "Application not found"}</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/applications")}
          >
            Back to Applications
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const student = applicationData.students;
  const internship = applicationData.internships;
  const applicationNotes =
    applicationData.parsed_application_data ||
    parseApplicationNotes(applicationData.notes);
  const profile = student?.profiles;

  return (
    <DashboardLayout>
      <div className="appl-container">
        <div className="appl-left-section">
          {/* Profile Card */}
          <div className="appl-profile-card">
            <div className="appl-profile-image">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} />
              ) : (
                <div className="default-avatar">
                  {profile?.display_name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            <h2 className="appl-profile-name">
              {profile?.display_name || "Unknown Student"}
            </h2>
            <p className="appl-applying-text">Applying for</p>

            <div className="appl-position-container">
              <span className="appl-position">
                {internship?.position_title}
              </span>
              <span
                className="appl-status"
                style={{
                  backgroundColor: getStatusColor(applicationData.status),
                }}
              >
                {applicationData.status.charAt(0).toUpperCase() +
                  applicationData.status.slice(1)}
              </span>
            </div>

            <div className="appl-buttons">
              <button
                className="appl-accept-button"
                onClick={() => handleStatusUpdate("accepted")}
                disabled={updating || applicationData.status === "accepted"}
              >
                <span>✓</span>{" "}
                {applicationData.status === "accepted" ? "Accepted" : "Accept"}
              </button>
              <button
                className="appl-reject-button"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updating || applicationData.status === "rejected"}
              >
                <span>✗</span>{" "}
                {applicationData.status === "rejected" ? "Rejected" : "Reject"}
              </button>
            </div>
          </div>

          {/* Documents Section */}
          <div className="appl-documents">
            <div className="appl-documents-header">
              <h3>Documents</h3>
              <span className="appl-download-text">
                Click to download or view
              </span>
            </div>
            {applicationData.document_url ? (
              <div className="document-actions">
                <div
                  className="appl-document-file"
                  onClick={() =>
                    downloadDocument(
                      applicationData.document_url,
                      `${profile?.display_name || "Student"}_CV.pdf`
                    )
                  }
                >
                  <div className="appl-file-icon">
                    <img src={cv} alt="CV Document" className="appl-icon-img" />
                  </div>
                  <span>{profile?.display_name || "Student"}_CV</span>
                </div>
                <div className="document-buttons">
                  <button
                    className="view-document-btn"
                    onClick={() =>
                      window.open(applicationData.document_url, "_blank")
                    }
                  >
                    View Document
                  </button>
                  <button
                    className="download-document-btn"
                    onClick={() =>
                      downloadDocument(
                        applicationData.document_url,
                        `${profile?.display_name || "Student"}_CV.pdf`
                      )
                    }
                  >
                    Download CV
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-documents">
                <p>No documents uploaded</p>
              </div>
            )}
          </div>

          {/* Cover Letter Section */}
          {applicationNotes.coverLetter && (
            <div className="appl-cover-letter">
              <h3>Cover Letter</h3>
              <div className="cover-letter-content">
                <p>{applicationNotes.coverLetter}</p>
              </div>
            </div>
          )}
        </div>

        <div className="appl-right-section">
          <div className="appl-header-with-back">
            <h1 className="appl-main-title">Application Details</h1>
          </div>

          {/* Personal Details */}
          <div className="appl-section">
            <h3 className="appl-section-title">Personal Information</h3>
            <div className="appl-details-grid">
              <div className="appl-detail-row">
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img src={person} alt="Name" className="appl-icon-img" />
                  </div>
                  <div>
                    <div className="appl-label">Full Name</div>
                    <div className="appl-value">
                      {profile?.display_name || "Unknown Student"}
                    </div>
                  </div>
                </div>
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img src={email} alt="Email" className="appl-icon-img" />
                  </div>
                  <div>
                    <div className="appl-label">Email</div>
                    <div className="appl-value">
                      {applicationData.student_email || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="appl-detail-row">
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img
                      src={calendar}
                      alt="Applied Date"
                      className="appl-icon-img"
                    />
                  </div>
                  <div>
                    <div className="appl-label">Date Applied</div>
                    <div className="appl-value">
                      {formatDate(applicationData.applied_at)}
                    </div>
                  </div>
                </div>
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img src={person} alt="Phone" className="appl-icon-img" />
                  </div>
                  <div>
                    <div className="appl-label">Phone</div>
                    <div className="appl-value">
                      {profile?.phone || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="appl-detail-row">
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img
                      src={calendar}
                      alt="Date of Birth"
                      className="appl-icon-img"
                    />
                  </div>
                  <div>
                    <div className="appl-label">Date of Birth</div>
                    <div className="appl-value">
                      {applicationNotes.dateOfBirth || "Not provided"}
                    </div>
                  </div>
                </div>
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img src={person} alt="Gender" className="appl-icon-img" />
                  </div>
                  <div>
                    <div className="appl-label">Gender</div>
                    <div className="appl-value">
                      {applicationNotes.gender || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Background from Application */}
          {applicationNotes.education && (
            <div className="appl-section">
              <h3 className="appl-section-title">
                Educational Background (Application)
              </h3>
              <div className="appl-details-grid">
                <div className="appl-detail-row">
                  <div className="appl-detail-item">
                    <div className="appl-icon">
                      <img
                        src={profile}
                        alt="Institution Name"
                        className="appl-icon-img"
                      />
                    </div>
                    <div>
                      <div className="appl-label">Institution Name</div>
                      <div className="appl-value">
                        {applicationNotes.education.institution}
                      </div>
                    </div>
                  </div>
                  <div className="appl-detail-item">
                    <div className="appl-icon">
                      <img
                        src={school}
                        alt="Course of Study"
                        className="appl-icon-img"
                      />
                    </div>
                    <div>
                      <div className="appl-label">Course of Study</div>
                      <div className="appl-value">
                        {applicationNotes.education.degree}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="appl-detail-full">
                  <div className="appl-detail-item">
                    <div className="appl-icon">
                      <img
                        src={calendar}
                        alt="Year of Study"
                        className="appl-icon-img"
                      />
                    </div>
                    <div>
                      <div className="appl-label">Current Year of Study</div>
                      <div className="appl-value">
                        {applicationNotes.education.yearOfStudy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Internship Preferences */}
          <div className="appl-section">
            <h3 className="appl-section-title">Internship Preferences</h3>
            <div className="appl-details-grid">
              <div className="appl-detail-row">
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img
                      src={calendar}
                      alt="Preferred start date"
                      className="appl-icon-img"
                    />
                  </div>
                  <div>
                    <div className="appl-label">Preferred Start Date</div>
                    <div className="appl-value">
                      {applicationNotes.preferredStartDate || "Not specified"}
                    </div>
                  </div>
                </div>
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img src={time} alt="Duration" className="appl-icon-img" />
                  </div>
                  <div>
                    <div className="appl-label">Preferred Duration</div>
                    <div className="appl-value">
                      {applicationNotes.duration || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="appl-detail-row">
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img
                      src={location}
                      alt="Work Type"
                      className="appl-icon-img"
                    />
                  </div>
                  <div>
                    <div className="appl-label">Work Type</div>
                    <div className="appl-value">
                      {internship?.work_type || "Not specified"}
                    </div>
                  </div>
                </div>
                <div className="appl-detail-item">
                  <div className="appl-icon">
                    <img
                      src={location}
                      alt="Location"
                      className="appl-icon-img"
                    />
                  </div>
                  <div>
                    <div className="appl-label">Location</div>
                    <div className="appl-value">
                      {internship?.location || "Not specified"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Applying Section */}
          {applicationNotes.whyApplying && (
            <div className="appl-section">
              <h3 className="appl-section-title">Why Applying</h3>
              <div className="why-applying-content">
                <p>{applicationNotes.whyApplying}</p>
              </div>
            </div>
          )}

          {/* Student Bio */}
          {student?.bio && (
            <div className="appl-section">
              <h3 className="appl-section-title">About the Applicant</h3>
              <div className="bio-content">
                <p>{student.bio}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
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

        .btn {
          background: #1070e5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 1rem;
        }

        .btn:hover {
          background: #0856c1;
        }

        .appl-header-with-back {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .back-button {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          color: #64748b;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .default-avatar {
          width: 80px;
          height: 80px;
          background: #e5e7eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          color: #64748b;
        }

        .no-documents {
          padding: 2rem;
          text-align: center;
          color: #64748b;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .appl-cover-letter {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
          margin-top: 1rem;
        }

        .appl-cover-letter h3 {
          margin-bottom: 1rem;
          color: #1e293b;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .cover-letter-content {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #1070e5;
        }

        .cover-letter-content p {
          line-height: 1.6;
          color: #374151;
          margin: 0;
        }

        .why-applying-content,
        .bio-content {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #1070e5;
        }

        .why-applying-content p,
        .bio-content p {
          line-height: 1.6;
          color: #374151;
          margin: 0;
        }

        .appl-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .appl-buttons button:disabled:hover {
          transform: none;
        }
        .document-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .document-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .view-document-btn,
        .download-document-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          flex: 1;
          min-width: 120px;
        }

        .view-document-btn {
          background: #3b82f6;
          color: white;
        }

        .view-document-btn:hover {
          background: #2563eb;
        }

        .download-document-btn {
          background: #10b981;
          color: white;
        }

        .download-document-btn:hover {
          background: #059669;
        }

        .appl-documents-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .appl-download-text {
          font-size: 0.75rem;
          color: #64748b;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default ApplicationDetails;
