import React, { useState, useEffect } from "react";
import "./org.css";
import "../style/org-profile.css";
import { Button } from "../components/button.jsx";
import { Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import location from "../assets/location.png";
import profile from "../assets/profile.png";
import pencil from "../assets/pencil.png";
import phone from "../assets/phone.png";
import email from "../assets/email.png";
import person from "../assets/person.png";
import organizationProfileService from "../lib/OrganizationProfileService.js";
import { useAuth } from "../context/AuthContext";

const OrganizationProfiles = () => {
  const { user } = useAuth();
  const [organizationData, setOrganizationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedInternsCount, setAcceptedInternsCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchOrganizationData();
      fetchAcceptedInternsCount();
    } else {
      setLoading(false);
      setError("User not authenticated");
    }
  }, [user]);

  const fetchOrganizationData = async () => {
    try {
      if (!user || !user.id) {
        setError("User not authenticated");
        return;
      }

      const data = await organizationProfileService.getOrganizationByUserId(
        user.id
      );
      setOrganizationData(data);
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedInternsCount = async () => {
    try {
      if (!user || !user.id) {
        return;
      }
      const { data, error } = await import(
        "../lib/organizationService.js"
      ).then((mod) => mod.default.getOrganizationApplications());
      if (error) {
        console.error("Error fetching applications:", error);
        return;
      }
      const acceptedCount = (data || []).filter(
        (app) => app.status === "accepted"
      ).length;
      setAcceptedInternsCount(acceptedCount);
    } catch (error) {
      console.error("Error fetching accepted interns count:", error);
    }
  };

  const getVerificationStatusDisplay = (status) => {
    switch (status) {
      case "verified":
        return {
          text: "Verified",
          className: "verification-status--verified",
          icon: "✓",
        };
      case "rejected":
        return {
          text: "Verification Failed",
          className: "verification-status--rejected",
          icon: "✗",
        };
      case "pending":
      default:
        return {
          text: "Not Verified",
          className: "verification-status--pending",
          icon: "⏳",
        };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="profile-container">
          <div className="profile-loading">Loading organization profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="profile-container">
          <div className="profile-error">
            <p>Error loading profile: {error}</p>
            <Button label="Retry" onClick={fetchOrganizationData} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!organizationData) {
    return (
      <DashboardLayout>
        <div className="profile-container">
          <div className="profile-no-data">
            <p>No organization profile found</p>
            <Link to="/organization-onboarding">
              <Button label="Complete Onboarding" />
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const verificationStatus = getVerificationStatusDisplay(
    organizationData.verification_status
  );

  return (
    <DashboardLayout>
      <div className="profile-container">
        <div className="profile-main-content">
          {/* Header Section */}
          <div className="profile-header">
            <div className="profile-company-info">
              <div className="profile-logo">
                <div className="profile-logo-icon">
                  {organizationData.logo_url ? (
                    <img src={organizationData.logo_url} alt="Company Logo" />
                  ) : (
                    <span className="profile-logo-symbol">
                      {organizationData.company_name
                        ?.substring(0, 2)
                        .toUpperCase() || "CO"}
                    </span>
                  )}
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

            {/* Stats and Edit Button */}
            <div className="profile-header-right">
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
                <div className="profile-stat-item">
                  <div className="profile-stat-number">
                    {acceptedInternsCount}
                  </div>
                  <div className="profile-stat-label">
                    Total recruited interns
                  </div>
                </div>
              </div>
              <Link to="/organization-profile-edit">
                <Button
                  label={
                    <span className="edit-profile-btn">
                      <img
                        src={pencil}
                        alt="Edit Icon"
                        className="profile-icons"
                      />
                      <span>Edit profile</span>
                    </span>
                  }
                />
              </Link>
            </div>
          </div>

          {/* Verification Notice */}
          {organizationData.verification_status !== "verified" && (
            <div
              className={`verification-notice ${
                organizationData.verification_status === "rejected"
                  ? "verification-notice--error"
                  : "verification-notice--warning"
              }`}
            >
              {organizationData.verification_status === "pending" && (
                <>
                  <h3>Verification Pending</h3>
                  <>
                    <br />
                    <strong>Action:</strong>{" "}
                    {organizationData.verification_notes}
                  </>
                  <p>
                    Your organization profile is under review. You will receive
                    an email notification once verification is complete. This
                    process typically takes 1-2 business days.
                  </p>
                </>
              )}
              {organizationData.verification_status === "rejected" && (
                <>
                  <h3>Verification Failed</h3>
                  <p>
                    Your organization verification was unsuccessful.
                    {organizationData.verification_notes && (
                      <>
                        <br />
                        <strong>Reason:</strong>{" "}
                        {organizationData.verification_notes}
                      </>
                    )}
                  </p>
                  <p>
                    Please update your documents and contact support for
                    re-verification.
                  </p>
                </>
              )}
            </div>
          )}

          {/* About Section */}
          <div className="profile-about-section">
            <div className="profile-about-tabs">
              <div className="profile-tab profile-tab-active">About</div>
            </div>

            <div className="profile-about-content">
              <h2 className="profile-about-title">
                About {organizationData.company_name}
              </h2>
              <p className="profile-about-description">
                {organizationData.company_description ||
                  "No description provided. Please update your profile to add more information about your organization."}
              </p>

              {organizationData.branches && (
                <>
                  <h2 className="profile-about-title">Branches</h2>
                  <p className="profile-about-description">
                    {organizationData.branches}
                  </p>
                </>
              )}

              {organizationData.website && (
                <a
                  href={organizationData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-website-link"
                >
                  View our website
                </a>
              )}

              {organizationData.linkedin_profile && (
                <a
                  href={organizationData.linkedin_profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-website-link"
                  style={{
                    marginLeft: organizationData.website ? "20px" : "0",
                  }}
                >
                  LinkedIn Profile
                </a>
              )}

              {/* Contact Information */}
              {organizationData.contact && (
                <div className="profile-contact-section">
                  <h2 className="profile-about-title">Contact Information</h2>
                  <div className="profile-contact-grid">
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
                        <p className="contact-role">
                          {organizationData.contact.contact_role}
                        </p>
                      </div>
                    </div>

                    <div className="contact-card">
                      <div className="contact-card-icon">
                        <img src={email} alt="Email" className="contact-icon" />
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrganizationProfiles;
