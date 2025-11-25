import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import logo from "../assets/logo_blue.png";
import studentService from "../lib/studentService.js";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  User,
  GraduationCap,
  Briefcase,
} from "lucide-react";

const MultiStepApplyForm = () => {
  const { id: internshipId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [internshipData, setInternshipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({
    hasApplied: false,
  });
  const [autoFillLoading, setAutoFillLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    address: "",
    phone: "",
    institutionName: "",
    courseOfStudy: "",
    yearOfStudy: "",
    expectedGraduationYear: "",
    internshipStartDate: "",
    duration: "",
    cvFile: null,
    coverLetter: "",
    whyApplying: "",
  });

  const steps = [
    { id: 1, icon: User, title: "Personal" },
    { id: 2, icon: GraduationCap, title: "Education" },
    { id: 3, icon: Briefcase, title: "Preferences" },
    { id: 4, icon: FileText, title: "Documents" },
  ];

  useEffect(() => {
    if (internshipId) {
      loadInternshipDetails();
      checkApplicationStatus();
      loadUserProfile(); // Auto-fill existing data
    }
  }, [internshipId]);

  // New function to load and auto-fill user profile data
  const loadUserProfile = async () => {
    try {
      setAutoFillLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Get student data
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      // Get most recent education (for reference, not auto-fill since it should be application-specific)
      const { data: recentEducation } = await supabase
        .from("student_education")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setFormData((prev) => ({
        ...prev,
        fullName: profile?.display_name || prev.fullName,
        email: user.email || prev.email, // FIXED: Use user.email, don't fallback to username
        phone: profile?.phone || prev.phone,
      }));
    } catch (error) {
      console.error("Error loading user profile for auto-fill:", error);
    } finally {
      setAutoFillLoading(false);
    }
  };

  const loadInternshipDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await studentService.getInternshipById(
        internshipId
      );

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
        await studentService.checkApplicationStatus(internshipId);
      if (hasApplied) {
        setApplicationStatus({ hasApplied, application });
        setError("You have already applied for this internship.");
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Check if file is PDF
    if (file && file.type !== "application/pdf") {
      setError(
        "Only PDF files are allowed. Please upload a valid PDF document."
      );
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError(null); // Clear error if file is valid
    setFormData((prev) => ({
      ...prev,
      cvFile: file,
    }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentStep < 4 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (applicationStatus.hasApplied) {
      setError("You have already applied for this internship");
      return;
    }

    // Validate that a PDF file is provided
    if (!formData.cvFile) {
      setError("Please upload a CV/Resume in PDF format");
      return;
    }

    if (formData.cvFile.type !== "application/pdf") {
      setError(
        "Only PDF files are allowed. Please upload a valid PDF document."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to apply");
      }

      // Update user profile (not student-specific data)
      await studentService.createOrUpdateStudentProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      });

      // Upload CV if provided
      let documentUrl = null;
      if (formData.cvFile) {
        const uploadResult = await studentService.uploadDocument(
          formData.cvFile,
          user.id,
          internshipId
        );

        if (uploadResult.data) {
          documentUrl = uploadResult.data.url;
        }
      }

      // Create application-specific notes with education data
      const applicationNotes = {
        coverLetter: formData.coverLetter,
        whyApplying: formData.whyApplying,
        preferredStartDate: formData.internshipStartDate,
        duration: formData.duration,
        // Store education data in application notes instead of separate table
        education: {
          institutionName: formData.institutionName,
          courseOfStudy: formData.courseOfStudy,
          yearOfStudy: formData.yearOfStudy,
          expectedGraduationYear: formData.expectedGraduationYear,
        },
        personalDetails: {
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          phone: formData.phone,
        },
      };

      const notesString = `Cover Letter: ${formData.coverLetter}\n\nWhy applying: ${formData.whyApplying}\n\nPreferred start date: ${formData.internshipStartDate}\n\nDuration: ${formData.duration}\n\nEducation: ${formData.institutionName} - ${formData.courseOfStudy} (${formData.yearOfStudy})\n\nPersonal Details: DOB: ${formData.dateOfBirth}, Gender: ${formData.gender}\nAddress: ${formData.address}`;

      // Submit application with all data in notes
      const applicationData = {
        internshipId: internshipId,
        notes: notesString,
        documentUrl: documentUrl,
        applicantEmail: formData.email,
      };

      const { data, error } = await studentService.submitApplication(
        applicationData
      );
      if (error) {
        throw new Error(error);
      }

      alert("Application submitted successfully!");
      navigate(`/internship-details/${internshipId}`);
    } catch (err) {
      console.error("Application submission error:", err);
      setError(
        err.message || "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        const step1Valid = !!(
          formData.fullName?.trim() &&
          formData.dateOfBirth?.trim() &&
          formData.gender?.trim() &&
          formData.email?.trim() &&
          formData.address?.trim()
        );
        return step1Valid;
      case 2:
        const step2Valid = !!(
          formData.institutionName?.trim() &&
          formData.courseOfStudy?.trim() &&
          formData.yearOfStudy?.trim() &&
          formData.expectedGraduationYear?.trim()
        );
        return step2Valid;
      case 3:
        const step3Valid = !!(
          formData.internshipStartDate?.trim() &&
          formData.duration?.trim() &&
          formData.whyApplying?.trim()
        );
        return step3Valid;
      case 4:
        const step4Valid = !!(formData.cvFile && formData.coverLetter?.trim());
        return step4Valid;
      default:
        return false;
    }
  };

  // Form step components (same as before)
  const renderPersonalDetails = () => (
    <div className="step-content">
      <div className="step-header">
        <User className="step-icon" />
        <h2 className="step-title">Personal Information</h2>
        <p className="step-description">
          Please provide your basic personal details
        </p>
      </div>

      {autoFillLoading && (
        <div className="auto-fill-notice">
          <p>Loading your saved information...</p>
        </div>
      )}

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            disabled={!!formData.fullName} // Disable if auto-filled
            required
          />
          {formData.fullName && (
            <small className="auto-fill-indicator">
              Auto-filled from your profile
            </small>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="dateOfBirth">Date of Birth *</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="gender">Gender *</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            disabled={!!formData.email} // Disable if auto-filled
            required
          />
          {formData.email && (
            <small className="auto-fill-indicator">
              Auto-filled from your account
            </small>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+234 xxx xxx xxxx"
            disabled={!!formData.phone} // Disable if auto-filled
          />
          {formData.phone && (
            <small className="auto-fill-indicator">
              Auto-filled from your profile
            </small>
          )}
        </div>

        <div className="input-group full-width">
          <label htmlFor="address">Address *</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your full address"
            rows="3"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderEducationalBackground = () => (
    <div className="step-content">
      <div className="step-header">
        <GraduationCap className="step-icon" />
        <h2 className="step-title">Educational Background</h2>
        <p className="step-description">
          Tell us about your academic journey for this application
        </p>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="institutionName">Institution Name *</label>
          <input
            type="text"
            id="institutionName"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleInputChange}
            placeholder="University/College name"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="courseOfStudy">Course of Study *</label>
          <input
            type="text"
            id="courseOfStudy"
            name="courseOfStudy"
            value={formData.courseOfStudy}
            onChange={handleInputChange}
            placeholder="Your major/course"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="yearOfStudy">Current Year of Study *</label>
          <select
            id="yearOfStudy"
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              Select year
            </option>
            <option value="1st year">1st Year</option>
            <option value="2nd year">2nd Year</option>
            <option value="3rd year">3rd Year</option>
            <option value="4th year">4th Year</option>
            <option value="5th year">5th Year</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="expectedGraduationYear">
            Expected Graduation Year *
          </label>
          <select
            id="expectedGraduationYear"
            name="expectedGraduationYear"
            value={formData.expectedGraduationYear}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              Select year
            </option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderInternshipDetails = () => (
    <div className="step-content">
      <div className="step-header">
        <Briefcase className="step-icon" />
        <h2 className="step-title">Application Details</h2>
        <p className="step-description">
          Tell us about your internship preferences
        </p>
      </div>

      <div className="form-grid">
        <div className="input-group">
          <label htmlFor="internshipStartDate">Preferred Start Date *</label>
          <input
            type="date"
            id="internshipStartDate"
            name="internshipStartDate"
            value={formData.internshipStartDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="duration">Duration *</label>
          <select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>
              Select duration
            </option>
            <option value="2 months">2 months</option>
            <option value="3 months">3 months</option>
            <option value="3 months">4 months</option>
            <option value="3 months">4 months</option>
            <option value="6 months">6 months</option>
            <option value="9 months">9 months</option>
            <option value="12 months">12 months</option>
          </select>
        </div>

        <div className="input-group full-width">
          <label htmlFor="whyApplying">
            Why are you applying for this internship? *
          </label>
          <textarea
            id="whyApplying"
            name="whyApplying"
            value={formData.whyApplying}
            onChange={handleInputChange}
            placeholder="Tell us why you're interested in this internship and what you hope to gain from it..."
            rows="4"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderUploadDocuments = () => (
    <div className="step-content">
      <div className="step-header">
        <FileText className="step-icon" />
        <h2 className="step-title">Upload Documents</h2>
        <p className="step-description">
          Please upload your CV/Resume and write a cover letter
        </p>
      </div>

      <div className="upload-section">
        <div
          className={`upload-area ${formData.cvFile ? "has-file" : ""}`}
          onClick={() => document.getElementById("cvFile").click()}
        >
          <input
            type="file"
            id="cvFile"
            onChange={handleFileChange}
            accept=".pdf"
            style={{ display: "none" }}
          />
          <Upload className="upload-icon" />
          <div className="upload-text">
            <h3>
              {formData.cvFile
                ? formData.cvFile.name
                : "Upload CV/Resume (PDF only)"}
            </h3>
            <p>Drag and drop or click to browse</p>
            <small>📄 Only PDF documents are allowed (Max 5MB)</small>
          </div>
        </div>
      </div>

      <div className="input-group full-width">
        <label htmlFor="coverLetter">Cover Letter *</label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          value={formData.coverLetter}
          onChange={handleInputChange}
          placeholder="Write a cover letter explaining your interest in this position and relevant qualifications..."
          rows="6"
          required
        />
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalDetails();
      case 2:
        return renderEducationalBackground();
      case 3:
        return renderInternshipDetails();
      case 4:
        return renderUploadDocuments();
      default:
        return renderPersonalDetails();
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="apply-form-container">
          <div className="form-wrapper">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading application form...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !internshipData) {
    return (
      <>
        <Navbar />
        <div className="apply-form-container">
          <div className="form-wrapper">
            <div className="error-state">
              <h2>Unable to Load Application</h2>
              <p>{error}</p>
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
      <div className="apply-form-container">
        <div className="form-wrapper">
          <div className="form-header">
            <div className="logo">
              <img
                src={internshipData?.organizations?.logo_url || logo}
                alt="company logo"
                width={"30px"}
                height={"30px"}
              />
            </div>
            <h1 className="form-title">
              Apply to{" "}
              {internshipData?.organizations?.organization_name ||
                "Organization"}
            </h1>
            <p className="form-subtitle">{internshipData?.position_title}</p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="progress-bar">
            <div className="progress-steps">
              <div className="progress-line">
                <div
                  className="progress-line-filled"
                  style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                />
              </div>
              {steps.map((step) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.id} className="step-item">
                    <div
                      className={`step-circle ${
                        currentStep === step.id
                          ? "active"
                          : currentStep > step.id
                          ? "completed"
                          : "inactive"
                      }`}
                    >
                      <IconComponent size={20} />
                    </div>
                    <span
                      className={`step-label ${
                        currentStep === step.id ? "active" : ""
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-content">{renderStepContent()}</div>

          <div className="form-navigation">
            <button
              type="button"
              className="nav-button secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="step-counter">
              Step {currentStep} of {steps.length}
            </div>

            {currentStep < 4 ? (
              <button
                type="button"
                className="nav-button primary"
                onClick={nextStep}
                disabled={!isStepValid()}
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                className="nav-button primary"
                onClick={handleSubmit}
                disabled={!isStepValid() || submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .auto-fill-notice {
          background: #e0f2fe;
          border: 1px solid #0284c7;
          color: #0c4a6e;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          text-align: center;
        }

        .apply-form-container {
          min-height: 100vh;
          background: var(--bg-secondary, #f8fafc);
          padding: 2rem 1rem;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, sans-serif;
          padding-top: 120px;
          padding-bottom: 80px;
        }

        .form-wrapper {
          max-width: 800px;
          margin: 0 auto;
          background: var(--card-bg, #ffffff);
          border-radius: 16px;
          box-shadow: 0 4px 24px var(--card-shadow, rgba(0, 0, 0, 0.1));
          overflow: hidden;
        }

        .form-header {
          padding: 2rem;
          background: linear-gradient(
            135deg,
            var(--primary, #1070e5),
            var(--primary-dark, #2980b9)
          );
          color: var(--text-on-primary, #ffffff);
          text-align: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .form-title {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
        }

        .form-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin: 0.5rem 0 0 0;
        }

        .loading-state,
        .error-state {
          text-align: center;
          padding: 3rem;
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

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 8px;
          text-align: center;
        }

        .btn {
          background: #1070e5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn:hover {
          background: #2980b9;
        }

        .progress-bar {
          background: var(--bg-tertiary, #f1f5f9);
          padding: 2rem;
          border-bottom: 1px solid var(--card-border, rgba(229, 231, 235, 0.3));
        }

        .progress-steps {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          max-width: 600px;
          margin: 0 auto;
          position: relative;
        }

        .progress-line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--card-border, #e5e7eb);
          z-index: 1;
        }

        .progress-line-filled {
          height: 100%;
          background: var(--primary, #1070e5);
          transition: width 0.3s ease;
        }

        .step-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          background: var(--card-bg, #ffffff);
          padding: 0.5rem;
          border-radius: 8px;
        }

        .step-circle {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
        }

        .step-circle.active {
          background: var(--primary, #1070e5);
          color: var(--text-on-primary, #ffffff);
        }

        .step-circle.completed {
          background: var(--success, #22c55e);
          color: var(--text-on-primary, #ffffff);
        }

        .step-circle.inactive {
          background: var(--card-border, #e5e7eb);
          color: var(--text-secondary, #64748b);
        }

        .step-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary, #64748b);
          text-align: center;
          max-width: 80px;
        }

        .step-label.active {
          color: var(--primary, #1070e5);
          font-weight: 600;
        }

        .form-content {
          padding: 2rem;
          min-height: 400px;
        }

        .step-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .step-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .step-icon {
          width: 3rem;
          height: 3rem;
          color: var(--primary, #1070e5);
          margin: 0 auto 1rem;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary, #1e293b);
          margin: 0 0 0.5rem 0;
        }

        .step-description {
          color: var(--text-secondary, #64748b);
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
        }

        .input-group.full-width {
          grid-column: 1 / -1;
        }

        .input-group label {
          font-weight: 500;
          color: var(--text-primary, #1e293b);
          margin-bottom: 0.5rem;
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          padding: 0.75rem;
          border: 2px solid var(--card-border, #e5e7eb);
          border-radius: 8px;
          font-size: 1rem;
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #1e293b);
          transition: border-color 0.3s ease;
          /* Add these for better mobile handling */
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: var(--primary, #1070e5);
        }

        .input-group select {
          cursor: pointer;
          background-image: url("data:image/svg+xml;charset=US-ASCII,<svg viewBox='0 0 4 5' xmlns='http://www.w3.org/2000/svg'><path d='M2 0L0 2h4zm0 5L0 3h4z' fill='%23666'/></svg>");
          background-repeat: no-repeat;
          background-position: right 0.7rem top 50%;
          background-size: 0.65rem auto;
          padding-right: 2.5rem;
        }

        .input-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .upload-section {
          max-width: 400px;
          margin: 0 auto 2rem;
        }

        .upload-area {
          border: 2px dashed var(--card-border, #e5e7eb);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--bg-primary, #ffffff);
        }

        .upload-area:hover {
          border-color: var(--primary, #1070e5);
          background: var(--bg-secondary, #f8fafc);
        }

        .upload-area.has-file {
          border-color: var(--success, #22c55e);
          background: rgba(34, 197, 94, 0.05);
        }

        .upload-icon {
          width: 3rem;
          height: 3rem;
          color: var(--text-tertiary, #94a3b8);
          margin: 0 auto 1rem;
        }

        .upload-text h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary, #1e293b);
          font-weight: 600;
        }

        .upload-text p {
          margin: 0 0 0.5rem 0;
          color: var(--text-secondary, #64748b);
        }

        .upload-text small {
          color: var(--text-tertiary, #94a3b8);
        }

        .form-navigation {
          padding: 1.5rem 2rem;
          background: var(--bg-tertiary, #f1f5f9);
          border-top: 1px solid var(--card-border, rgba(229, 231, 235, 0.3));
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
          /* Better touch targets for mobile */
          min-height: 44px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .nav-button.primary {
          background: var(--primary, #1070e5);
          color: var(--text-on-primary, #ffffff);
        }

        .nav-button.primary:hover:not(:disabled) {
          background: var(--primary-dark, #2980b9);
          transform: translateY(-1px);
        }

        .nav-button.primary:active {
          transform: translateY(0);
        }

        .nav-button.secondary {
          background: var(--card-bg, #ffffff);
          color: var(--text-primary, #1e293b);
          border: 2px solid var(--card-border, #e5e7eb);
        }

        .nav-button.secondary:hover:not(:disabled) {
          background: var(--bg-secondary, #f8fafc);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .step-counter {
          color: var(--text-secondary, #64748b);
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .apply-form-container {
            padding: 8rem 0.8rem;
          }

          .form-wrapper {
            border-radius: 12px;
          }

          .form-header {
            padding: 1.5rem;
          }

          .form-title {
            font-size: 1.5rem;
          }

          .progress-bar {
            padding: 1.5rem 1rem;
          }

          .step-label {
            display: none;
          }

          .form-content {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-navigation {
            padding: 1rem 1.5rem;
            /* Keep flex-direction: row for better button layout */
            flex-direction: row;
            gap: 1rem;
          }

          .nav-button {
            flex: 1;
            justify-content: center;
            min-height: 48px; /* Larger touch target on mobile */
          }

          .step-counter {
            position: absolute;
            top: -2rem;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8rem;
          }

          /* Better mobile form inputs */
          .input-group input,
          .input-group select,
          .input-group textarea {
            font-size: 16px; /* Prevents zoom on iOS */
            padding: 0.875rem;
          }
        }

        @media (max-width: 480px) {
          .progress-steps {
            gap: 0.5rem;
          }

          .step-circle {
            width: 2.5rem;
            height: 2.5rem;
          }

          .step-icon {
            width: 2rem;
            height: 2rem;
          }

          .form-navigation {
            position: relative;
            padding-top: 2.5rem; /* Space for step counter */
          }

          .nav-button {
            padding: 1rem;
            font-size: 0.9rem;
          }
        }
        .input-group input:disabled,
        .input-group select:disabled {
          background-color: var(--bg-tertiary, #f1f5f9);
          color: var(--text-secondary, #64748b);
          cursor: not-allowed;
          border-color: var(--card-border, #e5e7eb);
          opacity: 0.8;
        }

        .auto-fill-indicator {
          color: var(--primary, #1070e5);
          font-size: 0.75rem;
          font-style: italic;
          margin-top: 0.25rem;
          display: block;
        }

        .auto-fill-notice {
          background: #e0f2fe;
          border: 1px solid #0284c7;
          color: #0c4a6e;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 6px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .auto-fill-notice::before {
          content: "ℹ️";
          font-size: 1rem;
        }
      `}</style>
      <Footer />
    </>
  );
};

export default MultiStepApplyForm;
