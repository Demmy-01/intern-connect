import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Button } from "../components/button.jsx";
import location from "../assets/location.png";
import profile from "../assets/profile.png";
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
        <div className="public-profile-page">
          <div className="container">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading organization profile...</p>
            </div>
          </div>
        </div>
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

          {/* Header Section */}
          <div className="public-profile-header">
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
                    <span>{organizationData.industry || "Not specified"}</span>
                  </div>
                  <div className="profile-location">
                    <span className="profile-meta-icon">
                      <img
                        src={location}
                        alt="Location Icon"
                        className="profile-icons"
                      />
                    </span>
                    <span>{organizationData.location || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
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

          {/* About Section */}
          <div className="profile-content">
            <div className="profile-about-section">
              <h2 className="profile-about-title">
                About {organizationData.company_name}
              </h2>
              <p className="profile-about-description">
                {organizationData.company_description ||
                  "No description available for this organization."}
              </p>

              {organizationData.branches && (
                <>
                  <h3 className="profile-section-title">Branches</h3>
                  <p className="profile-about-description">
                    {organizationData.branches}
                  </p>
                </>
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
                  <div className="profile-contact-details">
                    {organizationData.contact.contact_name && (
                      <p>
                        <strong>Contact Person:</strong>{" "}
                        {organizationData.contact.contact_name}
                      </p>
                    )}
                    {organizationData.contact.contact_role && (
                      <p>
                        <strong>Role:</strong>{" "}
                        {organizationData.contact.contact_role}
                      </p>
                    )}
                    {organizationData.contact.contact_email && (
                      <p>
                        <strong>Email:</strong>{" "}
                        <a
                          href={`mailto:${organizationData.contact.contact_email}`}
                        >
                          {organizationData.contact.contact_email}
                        </a>
                      </p>
                    )}
                    {organizationData.contact.contact_phone && (
                      <p>
                        <strong>Phone:</strong>{" "}
                        {organizationData.contact.contact_phone}
                      </p>
                    )}
                    {!organizationData.contact.contact_name &&
                      !organizationData.contact.contact_role &&
                      !organizationData.contact.contact_email &&
                      !organizationData.contact.contact_phone && (
                        <p>Contact information not available.</p>
                      )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`

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
.loading-state, .error-state {
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-state p {
  color: #64748b;
  margin-bottom: 2rem;
}

/* Header Section */
.public-profile-header {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
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
  display: flex;
  gap: 2rem;
  flex-shrink: 0;
}

.profile-stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  min-width: 120px;
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
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-about-section {
  margin-bottom: 2rem;
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
  .public-profile-header {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
  }
  .profile-company-name-container{
         display: flex;
         flex-direction: column;
  }


  .profile-company-info {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .profile-company-meta {
    justify-content: center;
  }

  .profile-stats {
    justify-content: center;
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
