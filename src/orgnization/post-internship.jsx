// pages/PostInternship.jsx
import React, { useState } from "react";
import "./org.css";
import "./dashboard-layout.css";
import { Button } from "../components/button.jsx";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import internshipService from "../lib/internshipService.js";
import check from "../assets/checked.png";
import useVerificationStatus from "../hooks/useVerificationStatus";

const PostInternship = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    positionTitle: "",
    department: "",
    description: "",
    requirements: "",
    workType: "",
    compensation: "",
    location: "",
    minDuration: "",
    maxDuration: "",
  });

  // Check verification status
  const { isVerified, isPending, isRejected, loading: verificationLoading, restrictionMessage } = useVerificationStatus();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear any previous errors when user starts typing
    if (error) setError(null);
  };

  const validateForm = () => {
    const required = [
      "positionTitle",
      "department",
      "description",
      "workType",
      "compensation",
      "minDuration",
      "maxDuration",
    ];
    const missing = required.filter((field) => !formData[field].trim());

    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(", ")}`);
      return false;
    }

    const minDur = parseInt(formData.minDuration);
    const maxDur = parseInt(formData.maxDuration);

    if (minDur >= maxDur) {
      setError("Maximum duration must be greater than minimum duration");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check verification status before allowing submission
    if (!isVerified) {
      setError("Your organization must be verified before posting internships.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await internshipService.createInternship(
        formData
      );

      if (error) {
        setError(error);
      } else {
        setSuccess(true);
        // Reset form
        setFormData({
          positionTitle: "",
          department: "",
          description: "",
          requirements: "",
          workType: "",
          compensation: "",
          location: "",
          minDuration: "",
          maxDuration: "",
        });

        // Show success message briefly then redirect
        setTimeout(() => {
          navigate("/posted-internship");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="success-container">
          <div className="success-message">
            <div className="success-icon">
              <img src={check} alt="success" width={"120px"} height={"120px"} />
            </div>
            <h2>Internship Posted Successfully!</h2>
            <p>
              Your internship has been created and is now visible to students.
            </p>
            <p>Redirecting to your posted internships...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="post-internship-container">
        <div className="post-internship-header">
          <h1>Post New Internship</h1>
          <p>Create a new internship opportunity for students</p>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
            <button className="error-dismiss" onClick={() => setError(null)}>
              ×
            </button>
          </div>
        )}

        {/* Verification Status Restriction */}
        {restrictionMessage && (
          <div className={`verification-restriction ${restrictionMessage.type === 'error' ? 'verification-restriction--error' : 'verification-restriction--warning'}`}>
            <div className="restriction-icon">
              {restrictionMessage.type === 'error' ? '⚠️' : '⏳'}
            </div>
            <div className="restriction-content">
              <h3>{restrictionMessage.title}</h3>
              <p>{restrictionMessage.message}</p>
            </div>
          </div>
        )}

        <form className="internship-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="positionTitle">Position Title *</label>
              <input
                type="text"
                id="positionTitle"
                name="positionTitle"
                placeholder="e.g Software Engineering intern"
                value={formData.positionTitle}
                onChange={handleInputChange}
                required
                disabled={loading || !isVerified}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                placeholder="e.g Engineering"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={loading || !isVerified}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="workType">Work Type *</label>
              <select
                id="workType"
                name="workType"
                value={formData.workType}
                onChange={handleInputChange}
                required
                disabled={loading || !isVerified}
              >
                <option value="" disabled>
                  Select work type
                </option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="compensation">Compensation *</label>
              <select
                id="compensation"
                name="compensation"
                value={formData.compensation}
                onChange={handleInputChange}
                required
                disabled={loading || !isVerified}
              >
                <option value="" disabled>
                  Select compensation type
                </option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              placeholder="e.g Lagos, Nigeria"
              value={formData.location}
              onChange={handleInputChange}
              disabled={loading || !isVerified}
            />
          </div>

          <div className="form-group duration-group">
            <label>Duration *</label>
            <div className="duration-inputs">
              <div className="duration-input">
                <label htmlFor="minDuration">Minimum Duration</label>
                <select
                  id="minDuration"
                  name="minDuration"
                  value={formData.minDuration}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !isVerified}
                >
                  <option value="" disabled>
                    Select minimum
                  </option>
                  <option value="1">1 month</option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                  <option value="4">4 months</option>
                  <option value="5">5 months</option>
                  <option value="6">6 months</option>
                </select>
              </div>
              <div className="duration-separator">to</div>
              <div className="duration-input">
                <label htmlFor="maxDuration">Maximum Duration</label>
                <select
                  id="maxDuration"
                  name="maxDuration"
                  value={formData.maxDuration}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !isVerified}
                >
                  <option value="" disabled>
                    Select maximum
                  </option>
                  <option value="2">2 months</option>
                  <option value="3">3 months</option>
                  <option value="4">4 months</option>
                  <option value="5">5 months</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the internship position, responsibilities, and what the intern will learn..."
              rows="6"
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading || !isVerified}
            ></textarea>
            <small className="form-help">
              Provide a clear and engaging description of the role
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements</label>
            <textarea
              id="requirements"
              name="requirements"
              placeholder="List the skills, qualifications, and requirements for this position..."
              rows="6"
              value={formData.requirements}
              onChange={handleInputChange}
              disabled={loading || !isVerified}
            ></textarea>
            <small className="form-help">
              Specify education level, skills, experience, etc.
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/posted-internships")}
              disabled={loading}
            >
              Cancel
            </button>
            <Button
              type="submit"
              className={`submit-button ${loading ? "loading" : ""}`}
              label={loading ? "Posting..." : "Post Internship"}
              disabled={loading || !isVerified}
            />
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PostInternship;
