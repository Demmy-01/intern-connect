import React, { useState } from "react";
import { CheckCircle, Circle, Upload, FileText, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../style/organization-onboarding.css";
import organizationProfileService from "../lib/OrganizationProfileService.js";
import { toast } from "../components/ui/sonner";
import authService from "../lib/authService.js";

const OrganizationOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Success message will be shown via toast

  const [profileData, setProfileData] = useState({
    // Company Information (only essential for onboarding)
    companyName: "",
    companyType: "",
    industry: "",
    companyDescription: "",
    location: "",
    companySize: "",

    // Contact Person
    contactName: "",
    contactRole: "",
    contactEmail: "",
    contactPhone: "",

    // Documents
    cacDocument: null,
    businessPermit: null,

    // Compliance
    termsAccepted: false,
    guidelinesAccepted: false,
  });

  const steps = [
    {
      id: 1,
      title: "Company Information",
      description: "Basic company details",
      icon: FileText,
    },
    {
      id: 2,
      title: "Contact Details",
      description: "Primary contact person information",
      icon: Circle,
    },
    {
      id: 3,
      title: "Verification",
      description: "Upload required documents",
      icon: Upload,
    },
    {
      id: 4,
      title: "Compliance",
      description: "Review and accept terms",
      icon: Shield,
    },
  ];

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleFileUpload = async (field, file) => {
    if (!file) return;

    // Clear any existing errors for this field
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    try {
      setIsLoading(true);

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error("File size must be less than 10MB");
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Please upload PDF, JPG, or PNG files only");
      }

      console.log(
        `Uploading ${field}:`,
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

      // Upload file using the service
      const uploadResult = await organizationProfileService.uploadFile(
        file,
        field === "cacDocument" ? "cac_document" : "business_permit"
      );

      console.log("Upload successful:", uploadResult);

      setProfileData((prev) => ({
        ...prev,
        [field]: {
          name: file.name,
          url: uploadResult.fileUrl,
          size: file.size,
        },
      }));
    } catch (error) {
      console.error(`${field} upload error:`, error);

      let errorMessage = "Failed to upload file. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      setErrors((prev) => ({
        ...prev,
        [field]: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!profileData.companyName.trim())
          newErrors.companyName = "Company name is required";
        if (!profileData.companyType.trim())
          newErrors.companyType = "Company type is required";
        if (!profileData.industry) newErrors.industry = "Industry is required";
        if (!profileData.companyDescription.trim())
          newErrors.companyDescription = "Company description is required";
        if (!profileData.location.trim())
          newErrors.location = "Location is required";
        break;

      case 2:
        if (!profileData.contactName.trim())
          newErrors.contactName = "Contact name is required";
        if (!profileData.contactRole.trim())
          newErrors.contactRole = "Contact role is required";
        if (!profileData.contactEmail.trim())
          newErrors.contactEmail = "Contact email is required";
        else if (!/\S+@\S+\.\S+/.test(profileData.contactEmail)) {
          newErrors.contactEmail = "Please enter a valid email address";
        }
        break;

      case 3:
        if (!profileData.cacDocument)
          newErrors.cacDocument = "CAC document is required";
        break;

      case 4:
        if (!profileData.termsAccepted)
          newErrors.termsAccepted = "You must accept the terms and conditions";
        if (!profileData.guidelinesAccepted)
          newErrors.guidelinesAccepted =
            "You must accept the internship guidelines";
        break;

      default:
        return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getValidationErrors = (step) => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!profileData.companyName.trim())
          newErrors.companyName = "Company name is required";
        if (!profileData.companyType.trim())
          newErrors.companyType = "Company type is required";
        if (!profileData.industry) newErrors.industry = "Industry is required";
        if (!profileData.companyDescription.trim())
          newErrors.companyDescription = "Company description is required";
        if (!profileData.location.trim())
          newErrors.location = "Location is required";
        break;
      case 2:
        if (!profileData.contactName.trim())
          newErrors.contactName = "Contact name is required";
        if (!profileData.contactRole.trim())
          newErrors.contactRole = "Contact role is required";
        if (!profileData.contactEmail.trim())
          newErrors.contactEmail = "Contact email is required";
        else if (!/\S+@\S+\.\S+/.test(profileData.contactEmail))
          newErrors.contactEmail = "Please enter a valid email address";
        break;
      case 3:
        if (!profileData.cacDocument)
          newErrors.cacDocument = "CAC document is required";
        break;
      case 4:
        if (!profileData.termsAccepted)
          newErrors.termsAccepted = "You must accept the terms and conditions";
        if (!profileData.guidelinesAccepted)
          newErrors.guidelinesAccepted =
            "You must accept the internship guidelines";
        break;
    }
    return newErrors;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      const validationErrors = getValidationErrors(currentStep);
      const firstKey = Object.keys(validationErrors)[0];
      if (firstKey) {
        try {
          toast.error(validationErrors[firstKey]);
        } catch (e) {}
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    setErrors({});
    try {
      const onboardingData = {
        // Company Information
        companyName: profileData.companyName,
        companyType: profileData.companyType,
        industry: profileData.industry,
        companyDescription: profileData.companyDescription,
        location: profileData.location,
        companySize: profileData.companySize,

        // Contact Information
        contactName: profileData.contactName,
        contactRole: profileData.contactRole,
        contactEmail: profileData.contactEmail,
        contactPhone: profileData.contactPhone,

        // Documents (file URLs from uploads)
        cacDocument: profileData.cacDocument?.url || null,
        businessPermit: profileData.businessPermit?.url || null,

        // Compliance
        termsAccepted: profileData.termsAccepted,
        guidelinesAccepted: profileData.guidelinesAccepted,
        acceptedAt: new Date().toISOString(),
      };

      console.log("Completing onboarding with data:", onboardingData);

      const result = await organizationProfileService.completeOnboarding(
        onboardingData
      );

      console.log("Onboarding completed:", result);

      try {
        toast.success(
          "Onboarding completed successfully! Your organization is now registered and pending verification."
        );
      } catch (e) {}
      navigate("/dashboard-overview");
    } catch (error) {
      console.error("Onboarding error:", error);
      const message =
        error.message || "Failed to complete onboarding. Please try again.";
      setErrors({ general: message });
      try {
        toast.error(message);
      } catch (e) {}
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  const renderCompanyInfo = () => (
    <div className="org-step-content">
      <h3 className="org-step-title">Company Information</h3>

      {errors.general &&
        {
          /* general errors shown via toast; per-field errors remain inline */
        }}

      <div className="org-form-grid">
        <div className="org-form-field">
          <label className="org-form-label">Company Name *</label>
          <input
            type="text"
            placeholder="e.g., DANDEM Digitals"
            className={`org-form-input ${
              errors.companyName ? "org-form-input--error" : ""
            }`}
            value={profileData.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
          />
          {errors.companyName && (
            <span className="org-error-text">{errors.companyName}</span>
          )}
        </div>

        <div className="org-form-field">
          <label className="org-form-label">Company Type *</label>
          <input
            type="text"
            placeholder="e.g., Technology Startup, Manufacturing Company"
            className={`org-form-input ${
              errors.companyType ? "org-form-input--error" : ""
            }`}
            value={profileData.companyType}
            onChange={(e) => handleInputChange("companyType", e.target.value)}
          />
          {errors.companyType && (
            <span className="org-error-text">{errors.companyType}</span>
          )}
        </div>
      </div>

      <div className="org-form-grid">
        <div className="org-form-field">
          <label className="org-form-label">Industry *</label>
          <select
            className={`org-form-select ${
              errors.industry ? "org-form-input--error" : ""
            }`}
            value={profileData.industry}
            onChange={(e) => handleInputChange("industry", e.target.value)}
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
          </select>
          {errors.industry && (
            <span className="org-error-text">{errors.industry}</span>
          )}
        </div>

        <div className="org-form-field">
          <label className="org-form-label">Company Size</label>
          <select
            className="org-form-select"
            value={profileData.companySize}
            onChange={(e) => handleInputChange("companySize", e.target.value)}
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>
      </div>

      <div className="org-form-field">
        <label className="org-form-label">Company Description *</label>
        <textarea
          rows="4"
          placeholder="Describe your company, its mission, and what makes it unique..."
          className={`org-form-textarea ${
            errors.companyDescription ? "org-form-input--error" : ""
          }`}
          value={profileData.companyDescription}
          onChange={(e) =>
            handleInputChange("companyDescription", e.target.value)
          }
        />
        {errors.companyDescription && (
          <span className="org-error-text">{errors.companyDescription}</span>
        )}
      </div>

      <div className="org-form-field">
        <label className="org-form-label">Location *</label>
        <input
          type="text"
          placeholder="e.g., Lekki Phase I, Lagos, Nigeria"
          className={`org-form-input ${
            errors.location ? "org-form-input--error" : ""
          }`}
          value={profileData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
        />
        {errors.location && (
          <span className="org-error-text">{errors.location}</span>
        )}
      </div>
    </div>
  );

  const renderContactDetails = () => (
    <div className="org-step-content">
      <h3 className="org-step-title">Contact Person Details</h3>

      <div className="org-form-grid">
        <div className="org-form-field">
          <label className="org-form-label">Full Name *</label>
          <input
            type="text"
            placeholder="Contact person's full name"
            className={`org-form-input ${
              errors.contactName ? "org-form-input--error" : ""
            }`}
            value={profileData.contactName}
            onChange={(e) => handleInputChange("contactName", e.target.value)}
          />
          {errors.contactName && (
            <span className="org-error-text">{errors.contactName}</span>
          )}
        </div>

        <div className="org-form-field">
          <label className="org-form-label">Role/Position *</label>
          <input
            type="text"
            placeholder="e.g., HR Manager, CEO, Recruiter"
            className={`org-form-input ${
              errors.contactRole ? "org-form-input--error" : ""
            }`}
            value={profileData.contactRole}
            onChange={(e) => handleInputChange("contactRole", e.target.value)}
          />
          {errors.contactRole && (
            <span className="org-error-text">{errors.contactRole}</span>
          )}
        </div>
      </div>

      <div className="org-form-grid">
        <div className="org-form-field">
          <label className="org-form-label">Email Address *</label>
          <input
            type="email"
            placeholder="contact@company.com"
            className={`org-form-input ${
              errors.contactEmail ? "org-form-input--error" : ""
            }`}
            value={profileData.contactEmail}
            onChange={(e) => handleInputChange("contactEmail", e.target.value)}
          />
          {errors.contactEmail && (
            <span className="org-error-text">{errors.contactEmail}</span>
          )}
        </div>

        <div className="org-form-field">
          <label className="org-form-label">Phone Number</label>
          <input
            type="tel"
            placeholder="+234 xxx xxx xxxx"
            className="org-form-input"
            value={profileData.contactPhone}
            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
          />
        </div>
      </div>

      <div className="org-info-box org-info-box--blue">
        <p className="org-info-text">
          <strong>Note:</strong> This person will be the primary contact for all
          internship-related communications and will receive notifications about
          applications.
        </p>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="org-step-content">
      <h3 className="org-step-title">Document Verification</h3>

      <div className="org-verification-content">
        <div className="org-form-field">
          <label className="org-form-label">
            Company Registration Document (CAC Certificate) *
          </label>
          <div
            className={`org-upload-area ${
              errors.cacDocument ? "org-upload-area--error" : ""
            }`}
          >
            <Upload className="org-upload-icon" />
            <div className="org-upload-content">
              <label htmlFor="cac-upload" className="org-upload-label">
                <span className="org-upload-text">
                  {profileData.cacDocument
                    ? "Replace CAC Certificate"
                    : "Upload CAC Certificate"}
                </span>
                <input
                  id="cac-upload"
                  type="file"
                  className="org-upload-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileUpload("cacDocument", e.target.files[0])
                  }
                  disabled={isLoading}
                />
              </label>
              <p className="org-upload-hint">PDF, JPG, PNG up to 10MB</p>
            </div>
            {profileData.cacDocument && (
              <p className="org-upload-success">
                ✓ {profileData.cacDocument.name} (
                {(profileData.cacDocument.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          {errors.cacDocument && (
            <span className="org-error-text">{errors.cacDocument}</span>
          )}
        </div>

        <div className="org-form-field">
          <label className="org-form-label">
            Business Permit/License (Optional)
          </label>
          <div className="org-upload-area">
            <Upload className="org-upload-icon" />
            <div className="org-upload-content">
              <label htmlFor="permit-upload" className="org-upload-label">
                <span className="org-upload-text">
                  {profileData.businessPermit
                    ? "Replace Business Permit"
                    : "Upload Business Permit"}
                </span>
                <input
                  id="permit-upload"
                  type="file"
                  className="org-upload-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    handleFileUpload("businessPermit", e.target.files[0])
                  }
                  disabled={isLoading}
                />
              </label>
              <p className="org-upload-hint">PDF, JPG, PNG up to 10MB</p>
            </div>
            {profileData.businessPermit && (
              <p className="org-upload-success">
                ✓ {profileData.businessPermit.name} (
                {(profileData.businessPermit.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
        </div>

        <div className="org-info-box org-info-box--yellow">
          <p className="org-info-text">
            <strong>Verification Process:</strong> Our team will review your
            documents within 2-3 business days. You'll receive an email
            notification once your organization is verified.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="org-step-content">
      <h3 className="org-step-title">Terms & Compliance</h3>

      {errors.general &&
        {
          /* general errors shown via toast; per-field errors remain inline */
        }}

      <div className="org-compliance-content">
        <div className="org-terms-box">
          <h4 className="org-terms-heading">
            InternConnect Terms & Conditions
          </h4>
          <div className="org-terms-text">
            <p>By using InternConnect, you agree to:</p>
            <ul className="org-terms-list">
              <li>
                Provide accurate and truthful information about your
                organization
              </li>
              <li>Post only legitimate internship opportunities</li>
              <li>Respect the privacy and rights of intern applicants</li>
              <li>Maintain professional communication standards</li>
              <li>Comply with applicable labor laws and regulations</li>
            </ul>
          </div>
        </div>

        <div className="org-checkbox-group">
          <input
            type="checkbox"
            id="terms"
            className="org-checkbox"
            checked={profileData.termsAccepted}
            onChange={(e) =>
              handleInputChange("termsAccepted", e.target.checked)
            }
          />
          <label htmlFor="terms" className="org-checkbox-label">
            I agree to the Terms & Conditions *
          </label>
          {errors.termsAccepted && (
            <span className="org-error-text">{errors.termsAccepted}</span>
          )}
        </div>

        <div className="org-terms-box">
          <h4 className="org-terms-heading">Internship Posting Guidelines</h4>
          <div className="org-terms-text">
            <p>When posting internships, you commit to:</p>
            <ul className="org-terms-list">
              <li>Providing fair compensation or stipends where applicable</li>
              <li>
                Maintaining reasonable working hours (not exceeding 40
                hours/week)
              </li>
              <li>Offering meaningful learning experiences and mentorship</li>
              <li>Providing clear job descriptions and expectations</li>
              <li>Treating interns with respect and professionalism</li>
              <li>Not exploiting interns for free labor</li>
            </ul>
          </div>
        </div>

        <div className="org-checkbox-group">
          <input
            type="checkbox"
            id="guidelines"
            className="org-checkbox"
            checked={profileData.guidelinesAccepted}
            onChange={(e) =>
              handleInputChange("guidelinesAccepted", e.target.checked)
            }
          />
          <label htmlFor="guidelines" className="org-checkbox-label">
            I agree to follow the Internship Posting Guidelines *
          </label>
          {errors.guidelinesAccepted && (
            <span className="org-error-text">{errors.guidelinesAccepted}</span>
          )}
        </div>

        <div className="org-info-box org-info-box--green">
          <p className="org-info-text">
            <strong>Almost Done!</strong> Once you complete this step, your
            organization will be registered and pending verification. You'll be
            able to start posting internships once verified.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCompanyInfo();
      case 2:
        return renderContactDetails();
      case 3:
        return renderVerification();
      case 4:
        return renderCompliance();
      default:
        return null;
    }
  };

  return (
    <div className="org-onboarding-container">
      <div className="org-onboarding-wrapper">
        {/* Progress Steps */}
        <div className="org-progress-section">
          <div className="org-progress-steps">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;

              return (
                <div key={step.id} className="org-progress-item">
                  <div className="org-step-indicator">
                    <div
                      className={`org-step-circle ${
                        isCompleted
                          ? "org-step-circle--completed"
                          : isCurrent
                          ? "org-step-circle--current"
                          : "org-step-circle--pending"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="org-step-icon" />
                      ) : (
                        <StepIcon className="org-step-icon" />
                      )}
                    </div>
                    <div className="org-step-content">
                      <p
                        className={`org-step-title ${
                          isCurrent
                            ? "org-step-title--current"
                            : isCompleted
                            ? "org-step-title--completed"
                            : "org-step-title--pending"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="org-step-description">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`org-step-connector ${
                        isCompleted
                          ? "org-step-connector--completed"
                          : "org-step-connector--pending"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="org-step-container">{renderStepContent()}</div>

        {/* Success Message */}
        {/* Success UI replaced by toast */}

        {/* Navigation Buttons */}
        {!successMessage && (
          <div className="org-navigation">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="org-nav-button org-nav-button--secondary"
            >
              Previous
            </button>

            <div className="org-nav-actions">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  className="org-nav-button org-nav-button--primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Next Step"}
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="org-nav-button org-nav-button--success"
                >
                  {isLoading ? "Completing..." : "Complete Onboarding"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationOnboarding;
