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
import organizationService from "../lib/organizationService.js";
import Loader from "../components/Loader.jsx";

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
        ? "Are you sure you want to accept this application? An acceptance email will be sent to the applicant."
        : "Are you sure you want to reject this application? A rejection email will be sent to the applicant.";

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
            } successfully! Email notification has been sent to the applicant.`
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

  const getScoreColor = (score) => {
    if (score >= 70) return "#22c55e";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
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
          <Loader message="Loading application details..." />
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

          {/* AI Screening Results Section */}
          {applicationData.ai_score !== null && applicationData.ai_analysis && (
            <div className="ai-screening-card">
              <div className="ai-header">
                <h3>🤖 AI Screening Results</h3>
                <div
                  className="ai-score-large"
                  style={{
                    backgroundColor: getScoreColor(applicationData.ai_score),
                  }}
                >
                  {applicationData.ai_score}%
                </div>
              </div>

              <div className="ai-status-indicator">
                <span
                  className={`ai-status-badge ${getScreeningBadgeClass(
                    applicationData.screening_status
                  )}`}
                >
                  {getScreeningLabel(applicationData.screening_status)}
                </span>
              </div>

              {/* Match Analysis */}
              <div className="ai-analysis-section">
                <h4>Requirements Match Analysis</h4>

                {applicationData.ai_analysis.matchedKeywords?.length > 0 && (
                  <div className="keywords-section">
                    <div className="keywords-label">
                      ✓ Matched Requirements (
                      {applicationData.ai_analysis.matchedKeywords.length})
                    </div>
                    <div className="keywords-list matched">
                      {applicationData.ai_analysis.matchedKeywords.map(
                        (keyword, idx) => (
                          <span key={idx} className="keyword-tag matched">
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {applicationData.ai_analysis.missingKeywords?.length > 0 && (
                  <div className="keywords-section">
                    <div className="keywords-label">
                      ✗ Missing Requirements (
                      {applicationData.ai_analysis.missingKeywords.length})
                    </div>
                    <div className="keywords-list missing">
                      {applicationData.ai_analysis.missingKeywords.map(
                        (keyword, idx) => (
                          <span key={idx} className="keyword-tag missing">
                            {keyword}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* CV Quality Analysis */}
              {applicationData.ai_analysis.cvAnalysis && (
                <div className="cv-quality-section">
                  <h4>CV Quality Assessment</h4>
                  <div className="quality-indicators">
                    <div
                      className={`quality-item ${
                        applicationData.ai_analysis.cvAnalysis.hasEducation
                          ? "has"
                          : "missing"
                      }`}
                    >
                      <span className="quality-icon">
                        {applicationData.ai_analysis.cvAnalysis.hasEducation
                          ? "✓"
                          : "✗"}
                      </span>
                      <span>Education Section</span>
                    </div>
                    <div
                      className={`quality-item ${
                        applicationData.ai_analysis.cvAnalysis.hasExperience
                          ? "has"
                          : "missing"
                      }`}
                    >
                      <span className="quality-icon">
                        {applicationData.ai_analysis.cvAnalysis.hasExperience
                          ? "✓"
                          : "✗"}
                      </span>
                      <span>Experience Section</span>
                    </div>
                    <div
                      className={`quality-item ${
                        applicationData.ai_analysis.cvAnalysis.hasSkills
                          ? "has"
                          : "missing"
                      }`}
                    >
                      <span className="quality-icon">
                        {applicationData.ai_analysis.cvAnalysis.hasSkills
                          ? "✓"
                          : "✗"}
                      </span>
                      <span>Skills Section</span>
                    </div>
                    <div
                      className={`quality-item ${
                        applicationData.ai_analysis.cvAnalysis.hasContact
                          ? "has"
                          : "missing"
                      }`}
                    >
                      <span className="quality-icon">
                        {applicationData.ai_analysis.cvAnalysis.hasContact
                          ? "✓"
                          : "✗"}
                      </span>
                      <span>Contact Information</span>
                    </div>
                  </div>
                  <div className="word-count">
                    <small>
                      CV Word Count:{" "}
                      {applicationData.ai_analysis.cvAnalysis.wordCount} words
                    </small>
                  </div>
                </div>
              )}

              {/* AI Reasoning */}
              {applicationData.ai_analysis.reasoning && (
                <div className="ai-reasoning">
                  <h4>AI Assessment</h4>
                  <p>{applicationData.ai_analysis.reasoning}</p>
                </div>
              )}

              {/* Screening Scores Breakdown */}
              <div className="score-breakdown">
                <div className="score-item">
                  <span className="score-label">Requirements Match:</span>
                  <span className="score-value">
                    {applicationData.ai_analysis.keywordMatchScore}%
                  </span>
                </div>
                <div className="score-item">
                  <span className="score-label">CV Quality:</span>
                  <span className="score-value">
                    {applicationData.ai_analysis.qualityScore}%
                  </span>
                </div>
                <div className="score-item">
                  <span className="score-label">Overall Score:</span>
                  <span className="score-value" style={{ fontWeight: 700 }}>
                    {applicationData.ai_score}%
                  </span>
                </div>
              </div>

              {/* Override AI Decision (for auto-rejected) */}
              {applicationData.screening_status === "auto_rejected" && (
                <div className="override-section">
                  <button
                    className="override-btn"
                    onClick={async () => {
                      if (
                        window.confirm(
                          "Override AI decision and move to manual review?"
                        )
                      ) {
                        const { error } =
                          await organizationService.overrideAIDecision(
                            applicationId,
                            "flagged_review"
                          );
                        if (!error) {
                          alert("Application moved to manual review");
                          loadApplicationDetails();
                        }
                      }
                    }}
                  >
                    Override AI Decision
                  </button>
                  <small>Move this application to manual review queue</small>
                </div>
              )}

              <div className="screening-timestamp">
                <small>
                  Screened on{" "}
                  {new Date(
                    applicationData.ai_analysis.screenedAt
                  ).toLocaleString()}
                </small>
              </div>
            </div>
          )}

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
        .ai-screening-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          color: white;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .ai-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .ai-score-large {
          font-size: 2rem;
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          background: white;
          color: white;
          min-width: 80px;
          text-align: center;
        }

        .ai-status-indicator {
          margin-bottom: 1.5rem;
        }

        .ai-status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          background: white;
        }

        .ai-status-badge.shortlisted {
          color: #16a34a;
        }

        .ai-status-badge.flagged {
          color: #d97706;
        }

        .ai-status-badge.auto-rejected {
          color: #dc2626;
        }

        .ai-analysis-section {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .ai-analysis-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .keywords-section {
          margin-bottom: 1rem;
        }

        .keywords-section:last-child {
          margin-bottom: 0;
        }

        .keywords-label {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          opacity: 0.9;
        }

        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .keyword-tag {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .keyword-tag.matched {
          background: rgba(34, 197, 94, 0.9);
          color: white;
        }

        .keyword-tag.missing {
          background: rgba(239, 68, 68, 0.9);
          color: white;
        }

        .cv-quality-section {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .cv-quality-section h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .quality-indicators {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .quality-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .quality-item.has {
          background: rgba(34, 197, 94, 0.2);
        }

        .quality-item.missing {
          background: rgba(239, 68, 68, 0.2);
          opacity: 0.7;
        }

        .quality-icon {
          font-weight: 700;
        }

        .word-count {
          margin-top: 0.5rem;
          opacity: 0.8;
        }

        .ai-reasoning {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .ai-reasoning h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .ai-reasoning p {
          margin: 0;
          line-height: 1.6;
          font-size: 0.9375rem;
        }

        .score-breakdown {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .score-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .score-item:last-child {
          border-bottom: none;
        }

        .score-label {
          font-size: 0.875rem;
        }

        .score-value {
          font-weight: 600;
        }

        .override-section {
          background: rgba(239, 68, 68, 0.2);
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1rem;
          text-align: center;
        }

        .override-btn {
          background: white;
          color: #dc2626;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .override-btn:hover {
          background: #fef2f2;
          transform: translateY(-1px);
        }

        .override-section small {
          display: block;
          opacity: 0.9;
        }

        .screening-timestamp {
          text-align: center;
          opacity: 0.8;
          font-size: 0.75rem;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default ApplicationDetails;
