import React, { useState, useEffect } from "react";
import "./org.css";
import "./dashboard-layout.css";
import { Button } from "../components/button.jsx";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout.jsx";
import organizationProfileService from "../lib/OrganizationProfileService.js";
import { toast } from "../components/ui/sonner";
import { useAuth } from "../context/AuthContext";

const OrganizationProfileEdit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    companyType: "",
    location: "",
    companyDescription: "",
    industry: "",
    companySize: "",
    branches: "",
    linkedinProfile: "",
    website: "",
    address: "",
    logoUrl: "",
  });

  const [contactData, setContactData] = useState({
    contactName: "",
    contactRole: "",
    contactEmail: "",
    contactPhone: "",
  });

  useEffect(() => {
    if (user) {
      fetchOrganizationData();
    } else {
      setLoading(false);
      setError("User not authenticated");
      try {
        toast.error("User not authenticated");
      } catch (e) {}
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

      if (data) {
        setOrganizationId(data.id);
        setFormData({
          companyName: data.company_name || "",
          companyType: data.company_type || "",
          location: data.location || "",
          companyDescription: data.company_description || "",
          industry: data.industry || "",
          companySize: data.company_size || "",
          branches: data.branches || "",
          linkedinProfile: data.linkedin_profile || "",
          website: data.website || "",
          address: data.address || "",
          logoUrl: data.logo_url || "",
        });

        if (data.contact) {
          setContactData({
            contactName: data.contact.contact_name || "",
            contactRole: data.contact.contact_role || "",
            contactEmail: data.contact.contact_email || "",
            contactPhone: data.contact.contact_phone || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching organization data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear success message when user starts editing
    if (success) setSuccess(false);
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear success message when user starts editing
    if (success) setSuccess(false);
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP)");
      try {
        toast.error("Please select a valid image file (JPG, PNG, or WebP)");
      } catch (e) {}
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      try {
        toast.error("Image size must be less than 5MB");
      } catch (e) {}
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Clear any existing errors
    setError(null);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return null;

    setLogoUploading(true);
    try {
      const result = await organizationProfileService.uploadLogo(logoFile);
      setFormData((prev) => ({ ...prev, logoUrl: result.fileUrl }));
      return result.fileUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError(error.message);
      try {
        toast.error(error.message);
      } catch (e) {}
      return null;
    } finally {
      setLogoUploading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.companyName.trim()) {
      errors.companyName = "Company name is required";
    }
    if (!formData.companyDescription.trim()) {
      errors.companyDescription = "Company description is required";
    }
    if (!formData.industry) {
      errors.industry = "Industry is required";
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    // Contact validation
    if (!contactData.contactName.trim()) {
      errors.contactName = "Contact name is required";
    }
    if (!contactData.contactEmail.trim()) {
      errors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactData.contactEmail)) {
      errors.contactEmail = "Please enter a valid email address";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError("Please fill in all required fields correctly");
      try {
        toast.error("Please fill in all required fields correctly");
      } catch (e) {}
      return;
    }

    setSaving(true);
    setError(null);

    try {
      let logoUrl = formData.logoUrl;

      // Upload logo if a new one was selected
      if (logoFile) {
        logoUrl = await handleLogoUpload();
        if (!logoUrl) {
          setSaving(false);
          return; // Error already set in handleLogoUpload
        }
      }

      // Update organization data
      const updateData = {
        company_name: formData.companyName,
        company_type: formData.companyType,
        location: formData.location,
        company_description: formData.companyDescription,
        industry: formData.industry,
        company_size: formData.companySize,
        branches: formData.branches,
        linkedin_profile: formData.linkedinProfile,
        website: formData.website,
        address: formData.address,
        logo_url: logoUrl, // Add this line
      };

      await organizationProfileService.updateOrganization(
        organizationId,
        updateData
      );

      // Update contact information
      await organizationProfileService.updateContact(
        organizationId,
        contactData
      );

      try {
        toast.success("Profile updated successfully! Redirecting...");
      } catch (e) {}
      setTimeout(() => {
        navigate("/organization-profile");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
      try {
        toast.error(error.message || "Failed to update profile");
      } catch (e) {}
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="org-profile-header">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </DashboardLayout>
    );
  }

  if (error && !organizationId) {
    return (
      <DashboardLayout>
        <div className="org-profile-header">
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="org-profile-header">
        <h1>Edit Organization Profile</h1>
        {/* Using toasts to display success/error messages (inline messages removed) */}
      </div>

      <div className="org-profile-content">
        <div className="org-profile-info">
          <div className="org-company-logo">
            <div className="org-logo-placeholder">
              {logoPreview || formData.logoUrl ? (
                <img
                  src={logoPreview || formData.logoUrl}
                  alt="Company Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : formData.companyName ? (
                formData.companyName.substring(0, 2).toUpperCase()
              ) : (
                "CO"
              )}
            </div>
            <div className="logo-upload-section" style={{ marginTop: "10px" }}>
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoSelect}
                style={{ display: "none" }}
              />
              <label htmlFor="logoUpload" className="upload-logo-btn">
                {logoUploading ? "Uploading..." : "Change Logo"}
              </label>
              {logoFile && (
                <p
                  style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
                >
                  Selected: {logoFile.name}
                </p>
              )}
            </div>
          </div>
          <div className="org-company-details">
            <h2>{formData.companyName || "Company Name"}</h2>
            <p className="org-company-type">
              {formData.companyType || "Company Type"}
            </p>
            <p className="org-company-location">
              Location: {formData.location || "Not specified"}
            </p>
          </div>
        </div>

        <form className="org-profile-form" onSubmit={handleSubmit}>
          {/* Company Information Section */}
          <div className="org-form-section">
            <h3 className="org-section-title">Company Information</h3>

            <div className="org-form-group">
              <label htmlFor="companyName">Company Name *</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="org-form-group">
              <label htmlFor="companyType">Company Type</label>
              <input
                type="text"
                id="companyType"
                name="companyType"
                placeholder="e.g. Technology Startup, Manufacturing Company"
                value={formData.companyType}
                onChange={handleInputChange}
              />
            </div>

            <div className="org-form-group">
              <label htmlFor="companyDescription">Company Description *</label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                placeholder="Briefly describe your company, its mission, and what makes it unique..."
                rows="6"
                value={formData.companyDescription}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="org-form-row">
              <div className="org-form-group">
                <label htmlFor="industry">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Construction">Construction</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="org-form-group">
                <label htmlFor="companySize">Company Size</label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                >
                  <option value="">Select Size</option>
                  <option value="1-10">10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div className="org-form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g. Lekki Phase I, Lagos, Nigeria"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="org-form-group">
              <label htmlFor="address">Full Address</label>
              <textarea
                id="address"
                name="address"
                placeholder="Complete company address"
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="org-form-group">
              <label htmlFor="branches">Branches</label>
              <input
                type="text"
                id="branches"
                name="branches"
                placeholder="e.g Lagos, Abuja, Port Harcourt"
                value={formData.branches}
                onChange={handleInputChange}
              />
            </div>

            <div className="org-form-row">
              <div className="org-form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  placeholder="https://www.yourcompany.com"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>

              <div className="org-form-group">
                <label htmlFor="linkedinProfile">LinkedIn Profile</label>
                <input
                  type="url"
                  id="linkedinProfile"
                  name="linkedinProfile"
                  placeholder="https://linkedin.com/company/yourcompany"
                  value={formData.linkedinProfile}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="org-form-section">
            <h3 className="org-section-title">Contact Information</h3>

            <div className="org-form-row">
              <div className="org-form-group">
                <label htmlFor="contactName">Contact Person Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  placeholder="Full name of contact person"
                  value={contactData.contactName}
                  onChange={handleContactChange}
                  required
                />
              </div>

              <div className="org-form-group">
                <label htmlFor="contactRole">Role/Position</label>
                <input
                  type="text"
                  id="contactRole"
                  name="contactRole"
                  placeholder="e.g. HR Manager, CEO"
                  value={contactData.contactRole}
                  onChange={handleContactChange}
                />
              </div>
            </div>

            <div className="org-form-row">
              <div className="org-form-group">
                <label htmlFor="contactEmail">Contact Email *</label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  placeholder="contact@company.com"
                  value={contactData.contactEmail}
                  onChange={handleContactChange}
                  required
                />
              </div>

              <div className="org-form-group">
                <label htmlFor="contactPhone">Phone Number</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="+234 xxx xxx xxxx"
                  value={contactData.contactPhone}
                  onChange={handleContactChange}
                />
              </div>
            </div>
          </div>

          <div className="org-form-actions">
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/organization-profile")}
                disabled={saving}
              >
                Cancel
              </button>
              <Button
                label={saving ? "Saving..." : "Save Changes"}
                type="submit"
                disabled={saving}
              />
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .upload-logo-btn {
          display: inline-block;
          padding: 8px 16px;
          background-color: var(--bg-tertiary);
          border: 1px solid var(--card-border);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          color: var(--text-primary);
          text-align: center;
          transition: background-color 0.2s;
        }

        .upload-logo-btn:hover {
          background-color: var(--bg-hover);
        }

        .logo-upload-section {
          text-align: center;
        }

        .org-logo-placeholder {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
};
export default OrganizationProfileEdit;
