import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Loader from "../components/Loader.jsx";
import { Button } from "../components/button.jsx";
import location from "../assets/location.png";
import profile from "../assets/profile.png";
import phone from "../assets/phone.png";
import email from "../assets/email.png";
import person from "../assets/person.png";
import organizationProfileService from "../lib/OrganizationProfileService.js";

const PublicOrganizationProfile = () => {
  const { id } = useParams(); // Get organization ID from URL
  const navigate = useNavigate();
  const [organizationData, setOrganizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    if (id) {
      fetchPublicOrganizationData();
      fetchOrganizationInternships();
    }
  }, [id]);

  const fetchPublicOrganizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching organization with ID:", id); // Debug log
      const data = await organizationProfileService.getPublicOrganizationById(
        id
      );
      console.log("Received organization data:", data); // Debug log
      setOrganizationData(data);
    } catch (error) {
      console.error("Error fetching public organization data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationInternships = async () => {
    try {
      // Fetch active internships for this organization
      const data = await organizationProfileService.getOrganizationInternships(
        id
      );
      console.log("Fetched internships:", data); // Debug log
      setInternships(data || []);
    } catch (error) {
      console.error("Error fetching organization internships:", error);
      setInternships([]); // Set empty array on error
    }
  };

  const getVerificationStatusDisplay = (status) => {
    switch (status) {
      case "verified":
        return {
          text: "Verified Organization",
          className: "verification-status--verified",
          icon: "✓",
        };
      case "rejected":
        return {
          text: "Unverified",
          className: "verification-status--rejected",
          icon: "✗",
        };
      case "pending":
      default:
        return {
          text: "Verification Pending",
          className: "verification-status--pending",
          icon: "⏳",
        };
    }
  };

  const handleInternshipClick = (internshipId) => {
    navigate(`/internship-details/${internshipId}`);
  };

  const handleBackToInternships = () => {
    navigate("/internships");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Loader message="Loading organization profile..." />
        <Footer />
      </>
    );
  }

  if (error || !organizationData) {
    return (
      <>
        <Navbar />
        <div className="public-profile-page">
          <div className="container">
            <div className="error-state">
              <h2>Organization Profile Not Found</h2>
              <p>
                {error ||
                  "The organization profile you are looking for could not be found."}
              </p>
              <Button
                label="Back to Internships"
                onClick={handleBackToInternships}
              />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const verificationStatus = getVerificationStatusDisplay(
    organizationData.verification_status
  );

  return (
    <>
      <Navbar />
      <div className="public-profile-page">
        <div className="container">
          {/* Back Button */}
          <div className="back-navigation">
            <button className="back-btn" onClick={handleBackToInternships}>
              ← Back to Internships
            </button>
          </div>

          <div className="profile-main-box">
            {/* Header Section */}
            <div className="profile-header-content">
              <div className="profile-company-info">
                <div className="profile-logo">
                  <div className="profile-logo-icon">
                    {organizationData.logo_url ? (
                      <img
                        src={organizationData.logo_url}
                        alt="Company Logo"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="profile-logo-symbol"
                      style={{
                        display: organizationData.logo_url ? "none" : "flex",
                      }}
                    >
                      {organizationData.company_name
                        ?.substring(0, 2)
                        .toUpperCase() || "CO"}
                    </span>
                  </div>
                </div>
                <div className="profile-company-details">
                  <div className="profile-company-name-container">
                    <h1 className="profile-company-name">
                      {organizationData.company_name}
                    </h1>
                    <div
                      className={`verification-status ${verificationStatus.className}`}
                    >
                      <span className="verification-icon">
                        {verificationStatus.icon}
                      </span>
                      <span className="verification-text">
                        {verificationStatus.text}
                      </span>
                    </div>
                  </div>
                  <div className="profile-company-meta">
                    <div className="profile-industry">
                      <span className="profile-meta-icon">
                        <img
                          src={profile}
                          alt="Industry Icon"
                          className="profile-icons"
                        />
                      </span>
                      <span>
                        {organizationData.industry || "Not specified"}
                      </span>
                    </div>
                    <div className="profile-location">
                      <span className="profile-meta-icon">
                        <img
                          src={location}
                          alt="Location Icon"
                          className="profile-icons"
                        />
                      </span>
                      <span>
                        {organizationData.location || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="profile-stats">
                <div className="profile-stat-item">
                  <div className="profile-stat-number">
                    {organizationData.company_size || "N/A"}
                  </div>
                  <div className="profile-stat-label">Company Size</div>
                  <div className="profile-stat-sublabel">
                    {organizationData.company_type || "Organization"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-about-section">
              <div className="content-section">
                <h2 className="profile-about-title">
                  About {organizationData.company_name}
                </h2>
                <p className="profile-about-description">
                  {organizationData.company_description ||
                    "No description available for this organization."}
                </p>
              </div>

              {organizationData.branches && (
                <div className="branches-card">
                  <h3 className="profile-section-title">Branches</h3>
                  <div className="branches-list">
                    {organizationData.branches
                      .split(",")
                      .map((branch, index) => (
                        <div key={index} className="branch-item">
                          <span className="branch-dot"></span>
                          {branch.trim()}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="profile-links">
                {organizationData.website && (
                  <a
                    href={organizationData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-website-link"
                  >
                    Visit Website
                  </a>
                )}

                {organizationData.linkedin_profile && (
                  <a
                    href={organizationData.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-website-link"
                  >
                    LinkedIn Profile
                  </a>
                )}
              </div>

              {/* Contact Information */}
              {organizationData.contact && (
                <div className="profile-contact-section">
                  <h3 className="profile-section-title">Contact Information</h3>
                  <div className="profile-contact-grid">
                    {organizationData.contact.contact_name && (
                      <div className="contact-card">
                        <div className="contact-card-icon">
                          <img
                            src={person}
                            alt="Contact Person"
                            className="contact-icon"
                          />
                        </div>
                        <div className="contact-card-content">
                          <h3 className="contact-label">Contact Person</h3>
                          <p className="contact-value">
                            {organizationData.contact.contact_name}
                          </p>
                          {organizationData.contact.contact_role && (
                            <p className="contact-role">
                              {organizationData.contact.contact_role}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {organizationData.contact.contact_email && (
                      <div className="contact-card">
                        <div className="contact-card-icon">
                          <img
                            src={email}
                            alt="Email"
                            className="contact-icon"
                          />
                        </div>
                        <div className="contact-card-content">
                          <h3 className="contact-label">Email Address</h3>
                          <p className="contact-value">
                            <a
                              href={`mailto:${organizationData.contact.contact_email}`}
                              className="contact-link"
                            >
                              {organizationData.contact.contact_email}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {organizationData.contact.contact_phone && (
                      <div className="contact-card">
                        <div className="contact-card-icon">
                          <img
                            src={phone}
                            alt="Phone"
                            className="contact-icon"
                          />
                        </div>
                        <div className="contact-card-content">
                          <h3 className="contact-label">Phone Number</h3>
                          <p className="contact-value">
                            <a
                              href={`tel:${organizationData.contact.contact_phone}`}
                              className="contact-link"
                            >
                              {organizationData.contact.contact_phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {!organizationData.contact.contact_name &&
                      !organizationData.contact.contact_role &&
                      !organizationData.contact.contact_email &&
                      !organizationData.contact.contact_phone && (
                        <div className="contact-card">
                          <p className="contact-value">
                            Contact information not available.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .public-profile-page {
          min-height: calc(100vh - 160px);
          background-color: #f8fafc;
          padding: 2rem 0;
          padding-top: 80px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Back Navigation */
        .back-navigation {
          margin-bottom: 2rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #1070e5;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .back-btn:hover {
          background-color: #e0f2fe;
        }

        /* Loading and Error States */
        .loading-state,
        .error-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1070e5;
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

        .error-state h2 {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .error-state p {
          color: #64748b;
          margin-bottom: 2rem;
        }

        /* Main Box */
        .profile-main-box {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Header Section */
        .profile-header-content {
          padding: 2rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          background: linear-gradient(to right, #f8fafc, white);
        }

        .profile-company-info {
          display: flex;
          gap: 2rem;
          flex: 1;
        }

        .profile-company-info {
          display: flex;
          gap: 1.5rem;
          flex: 1;
        }

        .profile-logo {
          flex-shrink: 0;
        }

        .profile-logo-icon {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          background: #e2e8f0;
          position: relative;
        }

        .profile-logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-logo-symbol {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1070e5, #0ea5e9);
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .profile-company-details {
          flex: 1;
        }

        .profile-company-name-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .profile-company-name {
          font-size: 2rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .verification-status {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .verification-status--verified {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .verification-status--pending {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fed7aa;
        }

        .verification-status--rejected {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .profile-company-meta {
          display: flex;
          gap: 2rem;
          margin-top: 1rem;
        }

        .profile-industry,
        .profile-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 1rem;
        }

        .profile-icons {
          width: 16px;
          height: 16px;
          opacity: 0.7;
        }

        /* Stats Section */
        .profile-stats {
          padding: 1.5rem;
          background: #f8fafc;
          border-left: 1px solid #e5e7eb;
          flex-shrink: 0;
          min-width: 200px;
        }

        .profile-stat-item {
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          transition: transform 0.2s ease;
        }

        .profile-stat-item:hover {
          transform: translateY(-2px);
        }

        .profile-stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: #1070e5;
          margin-bottom: 0.25rem;
        }

        .profile-stat-label {
          font-size: 0.875rem;
          color: #475569;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .profile-stat-sublabel {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        /* Content Section */
        .profile-content {
          background: white;
        }

        .profile-about-section {
          padding: 2rem;
        }

        .content-section {
          margin-bottom: 3rem;
        }

        .content-section:last-child {
          margin-bottom: 0;
        }

        .branches-card {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .profile-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .branch-icon {
          font-size: 1.5rem;
        }

        .branches-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .branch-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 0.95rem;
          color: #475569;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .branch-item:hover {
          background: #f1f5f9;
          border-color: #1070e5;
          transform: translateX(4px);
        }

        .branch-dot {
          width: 8px;
          height: 8px;
          background: #1070e5;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .profile-about-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .profile-about-description {
          color: #475569;
          line-height: 1.8;
          font-size: 1rem;
        }

        .profile-about-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .profile-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          margin-top: 2rem;
        }

        .profile-about-description {
          color: #475569;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .profile-links {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .profile-website-link {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: #1070e5;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .profile-website-link:hover {
          background: #0056b3;
        }

        /* Contact Section */
        .profile-contact-section {
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 8px;
          margin-top: 2rem;
        }

        .profile-contact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .contact-card {
          display: flex;
          align-items: flex-start;
          padding: 1.25rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .contact-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: #1070e5;
        }

        .contact-card-icon {
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 8px;
          margin-right: 1rem;
          border: 1px solid #e2e8f0;
        }

        .contact-icon {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .contact-card-content {
          flex: 1;
        }

        .contact-label {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .contact-value {
          color: #1e293b;
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .contact-role {
          color: #64748b;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .contact-link {
          color: #1070e5;
          text-decoration: none;
          transition: color 0.2s;
        }

        .contact-link:hover {
          color: #0056b3;
          text-decoration: underline;
        }

        .profile-contact-details p {
          margin: 0.5rem 0;
          color: #475569;
        }

        .profile-contact-details a {
          color: #1070e5;
          text-decoration: none;
        }

        .profile-contact-details a:hover {
          text-decoration: underline;
        }

        /* Internships Section */
        .internships-section {
          border-top: 1px solid #e2e8f0;
          padding-top: 2rem;
        }

        .internships-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .internship-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .internship-card:hover {
          border-color: #1070e5;
          box-shadow: 0 4px 12px rgba(16, 112, 229, 0.1);
          transform: translateY(-2px);
        }

        .internship-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .internship-department {
          color: #64748b;
          margin-bottom: 1rem;
        }

        .internship-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .internship-location,
        .internship-type {
          font-size: 0.875rem;
          color: #475569;
        }

        .internship-duration {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .internship-compensation {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-header-content {
            flex-direction: column;
            padding: 1.5rem;
          }

          .profile-company-name-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .profile-company-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 1rem;
          }

          .profile-company-meta {
            justify-content: center;
          }

          .profile-stats {
            width: 100%;
            border-left: none;
            border-top: 1px solid #e5e7eb;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
          }

          .profile-company-name {
            font-size: 1.5rem;
          }

          .container {
            padding: 0 0.5rem;
          }

          .public-profile-page {
            padding: 1rem 0;
          }

          .internships-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <Footer />
    </>
  );
};

export default PublicOrganizationProfile;
