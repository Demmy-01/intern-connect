import React, { useState, useEffect } from "react";
import { toast } from "../components/ui/sonner";
import { isProfileComplete } from "../util/profileUtils";
import profileService from "../lib/profileService";
import { supabase } from "../lib/supabase.js";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import logo from "../assets/logo_blue.png";
import studentService from "../lib/studentService.js";
import Loader from "../components/Loader.jsx";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Building,
  DollarSign,
  Clock,
  MapPin,
  Lightbulb,
  ArrowUpRight,
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
      const { data: profileResult } = await profileService.getProfile(user.id);
      const profile = profileResult;
      // Check whether profile is complete and prevent application if not complete
      const { complete, missingFields } = isProfileComplete(profile);
      if (!complete) {
        try {
          toast.error(
            `Your profile isn't complete. Please add the following: ${missingFields.join(
              ", ",
            )}`,
          );
        } catch (e) {}
        // Redirect to edit-profile page so users can complete their profile
        navigate("/edit-profile");
        return;
      }

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
      const { data, error } =
        await studentService.getInternshipById(internshipId);

      if (error) {
        setError(error);
      } else {
        console.log("Loaded internship data:", data);
        console.log(
          "Is external:",
          data?.is_external,
          "External link:",
          data?.external_link,
        );
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
        try {
          toast.info("You have already applied for this internship.");
        } catch (e) {}
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
      try {
        toast.error(
          "Only PDF files are allowed. Please upload a valid PDF document.",
        );
      } catch (e) {}
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      try {
        toast.error("File size must be less than 5MB");
      } catch (e) {}
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
      try {
        toast.error("You have already applied for this internship");
      } catch (e) {}
      return;
    }

    // Validate that a PDF file is provided
    if (!formData.cvFile) {
      try {
        toast.error("Please upload a CV/Resume in PDF format");
      } catch (e) {}
      return;
    }

    if (formData.cvFile.type !== "application/pdf") {
      try {
        toast.error(
          "Only PDF files are allowed. Please upload a valid PDF document.",
        );
      } catch (e) {}
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

      // Check profile completeness one more time before submitting the application
      const { data: profileResult } = await profileService.getProfile(user.id);
      const profile = profileResult;
      const { complete, missingFields } = isProfileComplete(profile);
      if (!complete) {
        try {
          toast.error(
            `Your profile isn't complete. Please update your profile before applying: ${missingFields.join(
              ", ",
            )}`,
          );
        } catch (e) {}
        navigate("/edit-profile");
        return;
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
          internshipId,
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

      const { data, error } =
        await studentService.submitApplication(applicationData);
      if (error) {
        throw new Error(error);
      }

      try {
        toast.success("Application submitted successfully!");
        // Dispatch a window event so notification modal can refresh immediately
        try {
          window.dispatchEvent(
            new CustomEvent("internshipApplication:created", {
              detail: {
                internshipId,
                studentId: user?.id,
                application: data?.[0] || data,
              },
            }),
          );
        } catch (e) {
          // ignore event dispatch errors
        }
      } catch (e) {}
      navigate(`/internship-details/${internshipId}`);
    } catch (err) {
      console.error("Application submission error:", err);
      const message =
        err.message || "Failed to submit application. Please try again.";
      setError(message);
      try {
        toast.error(message);
      } catch (e) {}
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
            <option value="4 months">4 months</option>
            <option value="5 months">5 months</option>
            <option value="6 months">6 months</option>
            <option value="7 months">7 months</option>
            <option value="8 months">8 months</option>
            <option value="9 months">9 months</option>
            <option value="10 months">10 months</option>
            <option value="11 months">11 months</option>
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
        <Loader message="Loading application form..." />
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

  // Handle external internships
  if (internshipData?.is_external === true && internshipData?.external_link) {
    return (
      <>
        <Navbar />
        <div className="external-page-wrapper">
          <div className="external-page-content">
            {/* Hero Section with gradient */}
            <div className="external-hero-section">
              <div className="hero-background"></div>
              <div className="hero-inner">
                <div className="external-logo-hero">
                  <img
                    src={internshipData?.organizations?.logo_url || logo}
                    alt="company logo"
                  />
                </div>
                <div className="hero-text">
                  <h1 className="hero-title">
                    {internshipData?.position_title}
                  </h1>
                  <p className="hero-company">
                    {internshipData?.external_company_name ||
                      internshipData?.organizations?.organization_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="external-content-grid">
              {/* Left Column - Details */}
              <div className="external-details-column">
                {/* Quick Stats */}
                <div className="stats-section">
                  <div className="stat-item">
                    <div className="stat-icon building-icon">
                      <Building size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Work Type</span>
                      <span className="stat-value">
                        {internshipData?.work_type}
                      </span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon salary-icon">
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Compensation</span>
                      <span className="stat-value">
                        {internshipData?.compensation}
                      </span>
                    </div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-icon duration-icon">
                      <Clock size={24} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Duration</span>
                      <span className="stat-value">
                        {internshipData?.min_duration}-
                        {internshipData?.max_duration} mo
                      </span>
                    </div>
                  </div>

                  {internshipData?.location && (
                    <div className="stat-item">
                      <div className="stat-icon location-icon">
                        <MapPin size={24} />
                      </div>
                      <div className="stat-content">
                        <span className="stat-label">Location</span>
                        <span className="stat-value">
                          {internshipData?.location}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* About Section */}
                {internshipData?.description && (
                  <div className="content-section">
                    <h2 className="section-title">About This Opportunity</h2>
                    <p className="section-text">
                      {internshipData?.description}
                    </p>
                  </div>
                )}

                {/* Requirements Section */}
                {internshipData?.requirements && (
                  <div className="content-section">
                    <h2 className="section-title">What We're Looking For</h2>
                    <p className="section-text">
                      {internshipData?.requirements}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - CTA */}
              <div className="external-cta-section">
                <div className="cta-card">
                  <div className="cta-badge">External Opportunity</div>
                  <h2 className="cta-title">Ready to Apply?</h2>
                  <p className="cta-description">
                    Click below to visit the company's application portal and
                    submit your application directly.
                  </p>

                  <button
                    className="btn-apply-primary"
                    onClick={() => {
                      window.open(internshipData?.external_link, "_blank");
                    }}
                  >
                    <span>Go to Application Portal</span>
                    <ArrowUpRight size={20} className="arrow-icon" />
                  </button>

                  <div className="cta-footer">
                    <p className="footer-text">Opens in a new tab</p>
                  </div>
                </div>

                <div className="cta-info-box">
                  <p>
                    <Lightbulb size={20} className="info-box-icon" />{" "}
                    <strong>Tip:</strong> Have your CV and cover letter ready
                    before applying!
                  </p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="external-footer">
              <button
                className="btn-back-external"
                onClick={() => navigate("/internships")}
              >
                ← Back to Opportunities
              </button>
            </div>
          </div>
        </div>
        <Footer />

        <style jsx>{`
          /* Light Mode (Default) */
          .external-page-wrapper {
            min-height: 100vh;
            background: linear-gradient(
              180deg,
              #f8fafc 0%,
              #f1f5f9 50%,
              #e8ecf1 100%
            );
            padding-top: 80px;
            padding-bottom: 100px;
            transition: background 0.3s ease;
          }

          /* Dark Mode */
          [data-theme="dark"] .external-page-wrapper {
            background: linear-gradient(
              180deg,
              #0f172a 0%,
              #1e293b 50%,
              #334155 100%
            );
          }

          .external-page-content {
            max-width: 1300px;
            margin: 0 auto;
            padding: 0 24px;
          }

          /* Hero Section */
          .external-hero-section {
            position: relative;
            margin-bottom: 4rem;
            overflow: hidden;
            border-radius: 24px;
          }

          .hero-background {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg,
              #1070e5 0%,
              #0c5ec7 50%,
              #1070e5 100%
            );
            opacity: 0.95;
            transition: opacity 0.3s ease;
          }

          [data-theme="dark"] .hero-background {
            opacity: 0.88;
          }

          .hero-inner {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            gap: 2rem;
            padding: 3rem 2.5rem;
            color: white;
          }

          .external-logo-hero {
            flex-shrink: 0;
          }

          .external-logo-hero img {
            width: 120px;
            height: 120px;
            border-radius: 20px;
            object-fit: cover;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
            border: 3px solid rgba(255, 255, 255, 0.2);
          }

          .hero-text {
            flex: 1;
          }

          .hero-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin: 0 0 0.5rem 0;
            line-height: 1.2;
            letter-spacing: -0.5px;
          }

          .hero-company {
            font-size: 1.2rem;
            color: rgba(255, 255, 255, 0.95);
            margin: 0;
            font-weight: 500;
          }

          /* Content Grid */
          .external-content-grid {
            display: grid;
            grid-template-columns: 1fr 420px;
            gap: 2.5rem;
            margin-bottom: 3rem;
          }

          .external-details-column {
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
          }

          /* Stats Section */
          .stats-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .stat-item {
            background: white;
            padding: 1.75rem;
            border-radius: 16px;
            display: flex;
            gap: 1.25rem;
            align-items: flex-start;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(229, 231, 235, 0.6);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }

          [data-theme="dark"] .stat-item {
            background: #1e293b;
            border-color: rgba(148, 163, 184, 0.3);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .stat-item::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #1070e5, #0c5ec7);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .stat-item:hover {
            box-shadow: 0 8px 24px rgba(16, 112, 229, 0.15);
            border-color: #1070e5;
            transform: translateY(-4px);
          }

          [data-theme="dark"] .stat-item:hover {
            box-shadow: 0 8px 24px rgba(16, 112, 229, 0.25);
          }

          .stat-item:hover::before {
            opacity: 1;
          }

          .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-weight: 600;
          }

          .building-icon {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #0c63e4;
          }

          [data-theme="dark"] .building-icon {
            background: linear-gradient(135deg, #0c4a6e, #0369a1);
            color: #93c5fd;
          }

          .salary-icon {
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
            color: #16a34a;
          }

          [data-theme="dark"] .salary-icon {
            background: linear-gradient(135deg, #14532d, #166534);
            color: #86efac;
          }

          .duration-icon {
            background: linear-gradient(135deg, #fce7f3, #fbcfe8);
            color: #db2777;
          }

          [data-theme="dark"] .duration-icon {
            background: linear-gradient(135deg, #500724, #831843);
            color: #f472b6;
          }

          .location-icon {
            background: linear-gradient(135deg, #fed7aa, #fdba74);
            color: #d97706;
          }

          [data-theme="dark"] .location-icon {
            background: linear-gradient(135deg, #7c2d12, #9a3412);
            color: #fdba74;
          }

          .stat-content {
            flex: 1;
          }

          .stat-label {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 0.45rem;
          }

          [data-theme="dark"] .stat-label {
            color: #94a3b8;
          }

          .stat-value {
            display: block;
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e293b;
          }

          [data-theme="dark"] .stat-value {
            color: #f1f5f9;
          }

          /* Content Sections */
          .content-section {
            background: white;
            padding: 2.25rem;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(229, 231, 235, 0.6);
          }

          [data-theme="dark"] .content-section {
            background: #1e293b;
            border-color: rgba(148, 163, 184, 0.3);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .section-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 1rem 0;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          [data-theme="dark"] .section-title {
            color: #f1f5f9;
          }

          .section-title::before {
            content: "";
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #1070e5, #0c5ec7);
            border-radius: 2px;
          }

          .section-text {
            color: #475569;
            line-height: 1.8;
            margin: 0;
            font-size: 0.975rem;
          }

          [data-theme="dark"] .section-text {
            color: #cbd5e1;
          }

          /* CTA Section */
          .external-cta-section {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            position: sticky;
            top: 120px;
            height: fit-content;
          }

          .cta-card {
            background: linear-gradient(135deg, #1070e5 0%, #0c5ec7 100%);
            padding: 2.25rem;
            border-radius: 20px;
            box-shadow: 0 12px 32px rgba(16, 112, 229, 0.25);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.15);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
          }

          [data-theme="dark"] .cta-card {
            box-shadow: 0 12px 32px rgba(16, 112, 229, 0.35);
            border-color: rgba(147, 197, 253, 0.2);
          }

          .cta-card::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -50%;
            width: 300px;
            height: 300px;
            background: radial-gradient(
              circle,
              rgba(255, 255, 255, 0.1),
              transparent
            );
            border-radius: 50%;
          }

          .cta-badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: rgba(255, 255, 255, 0.95);
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }

          .cta-title {
            font-size: 1.65rem;
            font-weight: 800;
            margin: 0 0 0.75rem 0;
            position: relative;
            z-index: 1;
            letter-spacing: -0.3px;
          }

          .cta-description {
            font-size: 0.95rem;
            color: rgba(255, 255, 255, 0.9);
            margin: 0 0 1.75rem 0;
            line-height: 1.6;
            position: relative;
            z-index: 1;
          }

          .btn-apply-primary {
            position: relative;
            z-index: 1;
            width: 100%;
            padding: 1.1rem 1.5rem;
            background: white;
            color: #1070e5;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            letter-spacing: 0.3px;
          }

          [data-theme="dark"] .btn-apply-primary {
            background: #f1f5f9;
            color: #1070e5;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .btn-apply-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }

          [data-theme="dark"] .btn-apply-primary:hover {
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          }

          .btn-apply-primary:active {
            transform: translateY(-1px);
          }

          .arrow-icon {
            transition: transform 0.3s ease;
          }

          .btn-apply-primary:hover .arrow-icon {
            transform: translate(3px, -3px);
          }

          .cta-footer {
            position: relative;
            z-index: 1;
            margin-top: 1rem;
          }

          .footer-text {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.75);
            margin: 0;
            text-align: center;
            letter-spacing: 0.3px;
          }

          .cta-info-box {
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 1.25rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          [data-theme="dark"] .cta-info-box {
            background: rgba(0, 0, 0, 0.35);
            border-color: rgba(147, 197, 253, 0.2);
          }

          .cta-info-box p {
            margin: 0;
            font-size: 1rem;
            color: #ffffff;
            line-height: 1.6;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .info-box-icon {
            flex-shrink: 0;
            color: #fff;
          }

          .cta-info-box strong {
            font-weight: 800;
            display: inline;
          }

          /* Back Button */
          .external-footer {
            text-align: center;
            margin-top: 3rem;
          }

          .btn-back-external {
            background: white;
            color: #1070e5;
            border: 2px solid #1070e5;
            padding: 1rem 2.25rem;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(16, 112, 229, 0.1);
          }

          [data-theme="dark"] .btn-back-external {
            background: transparent;
            color: #60a5fa;
            border-color: #60a5fa;
            box-shadow: 0 2px 8px rgba(16, 112, 229, 0.2);
          }

          .btn-back-external:hover {
            background: #1070e5;
            color: white;
            transform: translateX(-6px);
            box-shadow: 0 6px 16px rgba(16, 112, 229, 0.2);
          }

          [data-theme="dark"] .btn-back-external:hover {
            background: #1070e5;
            color: white;
            border-color: #1070e5;
            box-shadow: 0 6px 16px rgba(16, 112, 229, 0.3);
          }

          .btn-back-external:active {
            transform: translateX(-3px);
          }

          /* Mobile Responsive */
          @media (max-width: 1024px) {
            .external-content-grid {
              grid-template-columns: 1fr;
            }

            .external-cta-section {
              position: static;
            }

            .hero-title {
              font-size: 2rem;
            }

            .stats-section {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 768px) {
            .external-page-wrapper {
              padding-top: 70px;
              padding-bottom: 60px;
            }

            .external-page-content {
              padding: 0 16px;
            }

            .external-hero-section {
              margin-bottom: 2.5rem;
              border-radius: 16px;
            }

            .hero-inner {
              flex-direction: column;
              text-align: center;
              padding: 2.5rem 1.5rem;
              gap: 1.5rem;
            }

            .external-logo-hero img {
              width: 100px;
              height: 100px;
            }

            .hero-title {
              font-size: 1.75rem;
            }

            .hero-company {
              font-size: 1rem;
            }

            .stats-section {
              grid-template-columns: 1fr;
              gap: 1rem;
            }

            .stat-item {
              padding: 1.5rem;
            }

            .section-title {
              font-size: 1.2rem;
            }

            .cta-card {
              padding: 1.75rem;
            }

            .cta-title {
              font-size: 1.35rem;
            }

            .cta-description {
              font-size: 0.9rem;
              margin-bottom: 1.25rem;
            }

            .btn-apply-primary {
              padding: 1rem 1.25rem;
              font-size: 0.95rem;
            }
          }

          @media (max-width: 480px) {
            .external-page-wrapper {
              padding-top: 65px;
              padding-bottom: 40px;
            }

            .external-hero-section {
              margin-bottom: 2rem;
              border-radius: 12px;
            }

            .hero-inner {
              padding: 2rem 1.25rem;
              gap: 1rem;
            }

            .external-logo-hero img {
              width: 80px;
              height: 80px;
              border-radius: 12px;
            }

            .hero-title {
              font-size: 1.4rem;
            }

            .hero-company {
              font-size: 0.9rem;
            }

            .external-content-grid {
              gap: 1.5rem;
            }

            .stats-section {
              grid-template-columns: 1fr;
              gap: 0.75rem;
            }

            .stat-item {
              padding: 1rem;
              gap: 1rem;
            }

            .stat-icon {
              width: 40px;
              height: 40px;
            }

            .stat-label {
              font-size: 0.7rem;
              margin-bottom: 0.3rem;
            }

            .stat-value {
              font-size: 1rem;
            }

            .content-section {
              padding: 1.5rem;
              margin-bottom: 1rem;
            }

            .section-title {
              font-size: 1.1rem;
              margin-bottom: 0.75rem;
            }

            .section-title::before {
              width: 3px;
              height: 20px;
            }

            .section-text {
              font-size: 0.9rem;
              line-height: 1.6;
            }

            .cta-card {
              padding: 1.5rem;
            }

            .cta-badge {
              padding: 0.4rem 0.8rem;
              font-size: 0.75rem;
            }

            .cta-title {
              font-size: 1.25rem;
              margin-bottom: 0.5rem;
            }

            .cta-description {
              font-size: 0.85rem;
              margin-bottom: 1rem;
            }

            .btn-apply-primary {
              padding: 0.95rem 1rem;
              font-size: 0.9rem;
            }

            .cta-info-box {
              padding: 1rem;
            }

            .cta-info-box p {
              font-size: 0.8rem;
            }

            .btn-back-external {
              padding: 0.85rem 1.5rem;
              font-size: 0.9rem;
            }
          }
        `}</style>
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

          {/* Inline error messages for form submission replaced by toasts */}

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
          

          .step-counter {
            position: absolute;
            top: 6rem;
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
