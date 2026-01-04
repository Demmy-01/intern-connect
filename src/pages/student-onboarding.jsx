import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo_blue.png";
import { supabase } from "../lib/supabase";
import profileService from "../lib/profileService";
import { toast } from "../components/ui/sonner";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [hasExperience, setHasExperience] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    skills: "",
    experiences: [],
    educations: [],
    profilePicture: null,
  });

  const [currentExperience, setCurrentExperience] = useState({
    jobTitle: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const [currentEducation, setCurrentEducation] = useState({
    institution: "",
    degree: "",
    startDate: "",
    endDate: "",
    coursework: "",
  });

  const confirmationMessages = {
    1: "What a lovely name!",
    2: "Perfect! We'll keep in touch!",
    3: "Tell us more about yourself!",
    4: "Impressive skills!",
    5: hasExperience
      ? "Wonderful experience!"
      : "That's okay! Everyone starts somewhere!",
    6: "Excellent educational background!",
    7: "You look amazing!",
  };

  const handleNext = (stepNum = step) => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setStep(stepNum + 1);
    }, 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleExperienceChange = (field, value) => {
    setCurrentExperience({ ...currentExperience, [field]: value });
  };

  const handleEducationChange = (field, value) => {
    setCurrentEducation({ ...currentEducation, [field]: value });
  };

  const handleAddExperience = () => {
    setFormData({
      ...formData,
      experiences: [...formData.experiences, currentExperience],
    });
    setCurrentExperience({
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
    });
    handleNext();
  };

  const handleAddEducation = () => {
    setFormData({
      ...formData,
      educations: [...formData.educations, currentEducation],
    });
    setCurrentEducation({
      institution: "",
      degree: "",
      startDate: "",
      endDate: "",
      coursework: "",
    });
    handleNext();
  };

  const handleNoExperience = () => {
    handleNext();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profilePicture: URL.createObjectURL(file),
        profilePictureFile: file, // Store the actual file
      });
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        setCurrentUser(user);

        // Check if user already completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("has_completed_onboarding")
          .eq("id", user.id)
          .single();

        if (profile?.has_completed_onboarding) {
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Error checking user:", err);
        navigate("/login");
      }
    };

    checkUser();
  }, [navigate]);

  const saveOnboardingData = async () => {
    if (!currentUser) return false;

    setSaving(true);
    try {
      let imageUrl = null;

      // Upload profile image to storage first if provided
      if (formData.profilePictureFile) {
        console.log("Uploading profile image...");
        const uploadResult = await profileService.uploadProfileImage(
          currentUser.id,
          formData.profilePictureFile
        );

        if (!uploadResult.success) {
          throw new Error(
            "Failed to upload profile image: " + uploadResult.message
          );
        }

        imageUrl = uploadResult.imageUrl;
        console.log("Image uploaded successfully:", imageUrl);
      }

      // Transform experiences to match profileService format
      const transformedExperiences = formData.experiences.map((exp) => ({
        title: exp.jobTitle,
        company: exp.company,
        description: exp.description,
        startDate: exp.startDate,
        endDate: exp.endDate,
      }));

      // Transform education to match profileService format
      const transformedEducation = formData.educations.map((edu) => ({
        institution: edu.institution,
        degree: edu.degree,
        duration:
          edu.startDate && edu.endDate
            ? `${edu.startDate} - ${edu.endDate}`
            : "",
        coursework: edu.coursework,
      }));

      const onboardingData = {
        name: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        experiences: transformedExperiences,
        education: transformedEducation,
        profileImage: imageUrl, // Use the uploaded URL or null
      };

      console.log("Saving profile data:", onboardingData);

      // Save to profile
      const result = await profileService.updateProfile(
        currentUser.id,
        onboardingData
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      console.log("Profile updated successfully");

      // Mark onboarding as completed
      await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", currentUser.id);

      console.log("Onboarding marked as complete");

      toast.success("Profile setup complete!");
      return true;
    } catch (err) {
      console.error("Error saving onboarding data:", err);
      console.error("Error message:", err.message);
      console.error("Full error:", err);
      toast.error("Failed to save profile data. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (step === 0) {
      const timer = setTimeout(() => {
        setStep(1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
       min-height: 100vh;
       justify-content: center;
       background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
       padding: clamp(1.5rem, 5vw, 3rem) clamp(1rem, 5vw, 2rem);
       position: relative;
       overflow-x: hidden;
    }
     body::before{
     content: '';
     position: fixed;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     background-image: 
     linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
     linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
     background-size: 50px 50px;
     pointer-events: none;
     z-index: 1;
    }

    .onboarding-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      position: relative;
    }

    @keyframes floatIn {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes gentleBob {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .float-in {
      animation: floatIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .welcome-screen {
      text-align: center;
      color: white;
    }

    .logo {
      font-size: 80px;
      margin-bottom: 20px;
      animation: gentleBob 2s ease-in-out infinite;
    }

    .welcome-text {
      font-size: 48px;
      font-weight: 700;
      text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.3);
    }

    .form-step {
      background: white;
      padding: 50px 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      text-align: center;
    }

    .form-step h2 {
      color: #667eea;
      font-size: 28px;
      margin-bottom: 30px;
      font-weight: 600;
    }

    .input-field, .textarea-field {
      width: 100%;
      padding: 15px 20px;
      font-size: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      margin-bottom: 25px;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .input-field:focus, .textarea-field:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      transform: translateY(-2px);
    }

    .textarea-field {
      resize: vertical;
      min-height: 100px;
    }

    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 25px;
    }

    .form-group {
      text-align: left;
    }

    .form-group label {
      display: block;
      color: #333;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .button-group {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .next-button, .start-button, .no-exp-button {
      background-color: blue;
      color: white;
          padding: 8px 17px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: 0.2s ease-in-out;
          font-size: 15px;
    }

    .no-exp-button {
      background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
    }

    .next-button:hover:not(:disabled), .start-button:hover, .no-exp-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .next-button:disabled {
      background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
    }

    .confirmation-message {
      background: white;
      padding: 40px 50px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
    }

    .confirmation-message p {
      font-size: 32px;
      color: #667eea;
      font-weight: 600;
    }

    .file-input {
      display: none;
    }

    .file-label {
      display: inline-block;
      background: #f0f0f0;
      padding: 12px 30px;
      border-radius: 10px;
      cursor: pointer;
      margin-bottom: 20px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .file-label:hover {
      background: #e0e0e0;
      transform: translateY(-2px);
    }

    .preview-image {
      margin-bottom: 20px;
    }

    .preview-image img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #667eea;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .completion-screen {
      background: white;
      padding: 60px 50px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 500px;
    }

    .success-icon {
      font-size: 80px;
      margin-bottom: 20px;
      animation: gentleBob 2s ease-in-out infinite;
    }

    .completion-screen h1 {
      color: #667eea;
      font-size: 36px;
      margin-bottom: 15px;
      font-weight: 700;
    }

    .completion-screen p {
      color: #666;
      font-size: 18px;
      margin-bottom: 30px;
      line-height: 1.6;
    }

    .progress-dots {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.4s ease;
    }

    .dot.active {
      background: white;
      transform: scale(1.3);
    }

    @media (max-width: 600px) {
      .welcome-text {
        font-size: 32px;
      }

      .form-step {
        padding: 40px 25px;
      }

      .form-step h2 {
        font-size: 24px;
      }

      .two-column {
        grid-template-columns: 1fr;
      }

      .completion-screen h1 {
        font-size: 28px;
      }

      .button-group {
        flex-direction: column;
      }
    }
  `;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="onboarding-container">
      {step === 0 && (
        <div className="welcome-screen float-in">
          <div className="logo">
            <img
              src={logo}
              alt="InternConnect Logo"
              width={"58px"}
              height={"58px"}
            />
          </div>
          <h1 className="welcome-text">Welcome to InternConnect</h1>
        </div>
      )}

      {showConfirmation && (
        <div className="confirmation-message float-in">
          <p>{confirmationMessages[step]}</p>
        </div>
      )}

      {!showConfirmation && step === 1 && (
        <div className="form-step float-in">
          <h2>What's your full name?</h2>
          <input
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="input-field"
          />
          <button
            onClick={() => handleNext()}
            disabled={!formData.fullName}
            className="next-button"
          >
            Next
          </button>
        </div>
      )}

      {!showConfirmation && step === 2 && (
        <div className="form-step float-in">
          <h2>What's your phone number?</h2>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className="input-field"
          />
          <button
            onClick={() => handleNext()}
            disabled={!formData.phone}
            className="next-button"
          >
            Next
          </button>
        </div>
      )}

      {!showConfirmation && step === 3 && (
        <div className="form-step float-in">
          <h2>Tell us about yourself</h2>
          <textarea
            placeholder="Write a short bio about yourself..."
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            className="textarea-field"
            rows="4"
          />
          <button
            onClick={() => handleNext()}
            disabled={!formData.bio}
            className="next-button"
          >
            Next
          </button>
        </div>
      )}

      {!showConfirmation && step === 4 && (
        <div className="form-step float-in">
          <h2>What are your skills?</h2>
          <textarea
            placeholder="List your skills (e.g., JavaScript, React, Design)"
            value={formData.skills}
            onChange={(e) => handleInputChange("skills", e.target.value)}
            className="textarea-field"
            rows="4"
          />
          <button
            onClick={() => handleNext()}
            disabled={!formData.skills}
            className="next-button"
          >
            Next
          </button>
        </div>
      )}

      {!showConfirmation && step === 5 && (
        <div className="form-step float-in">
          <h2>Add your experience</h2>
          <div className="two-column">
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                placeholder="e.g. UI/UX Designer"
                value={currentExperience.jobTitle}
                onChange={(e) =>
                  handleExperienceChange("jobTitle", e.target.value)
                }
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input
                type="text"
                placeholder="e.g. AgroMall"
                value={currentExperience.company}
                onChange={(e) =>
                  handleExperienceChange("company", e.target.value)
                }
                className="input-field"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <div className="two-column">
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "5px",
                  }}
                >
                  Start
                </label>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={currentExperience.startDate}
                  onChange={(e) =>
                    handleExperienceChange("startDate", e.target.value)
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "5px",
                  }}
                >
                  End
                </label>
                <input
                  type="date"
                  placeholder="End Date"
                  value={currentExperience.endDate}
                  onChange={(e) =>
                    handleExperienceChange("endDate", e.target.value)
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Describe your role and achievements..."
              value={currentExperience.description}
              onChange={(e) =>
                handleExperienceChange("description", e.target.value)
              }
              className="textarea-field"
              rows="4"
            />
          </div>
          <div className="button-group">
            <button
              onClick={handleAddExperience}
              disabled={
                !currentExperience.jobTitle ||
                !currentExperience.company ||
                !currentExperience.startDate ||
                !currentExperience.endDate
              }
              className="next-button"
            >
              Next
            </button>
            <button onClick={handleNoExperience} className="no-exp-button">
              No Experience
            </button>
          </div>
        </div>
      )}

      {!showConfirmation && step === 6 && (
        <div className="form-step float-in">
          <h2>Add your education</h2>
          <div className="two-column">
            <div className="form-group">
              <label>Institution</label>
              <input
                type="text"
                placeholder="e.g. Elizade University"
                value={currentEducation.institution}
                onChange={(e) =>
                  handleEducationChange("institution", e.target.value)
                }
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Degree</label>
              <input
                type="text"
                placeholder="e.g. Bachelor of Science in Computer Science"
                value={currentEducation.degree}
                onChange={(e) =>
                  handleEducationChange("degree", e.target.value)
                }
                className="input-field"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Duration</label>
            <div className="two-column">
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "5px",
                  }}
                >
                  Start
                </label>
                <input
                  type="date"
                  placeholder="Start Date"
                  value={currentEducation.startDate}
                  onChange={(e) =>
                    handleEducationChange("startDate", e.target.value)
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginBottom: "5px",
                  }}
                >
                  End
                </label>
                <input
                  type="date"
                  placeholder="End Date"
                  value={currentEducation.endDate}
                  onChange={(e) =>
                    handleEducationChange("endDate", e.target.value)
                  }
                  className="input-field"
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Relevant Coursework</label>
            <textarea
              placeholder="List relevant courses..."
              value={currentEducation.coursework}
              onChange={(e) =>
                handleEducationChange("coursework", e.target.value)
              }
              className="textarea-field"
              rows="4"
            />
          </div>
          <button
            onClick={handleAddEducation}
            disabled={
              !currentEducation.institution ||
              !currentEducation.degree ||
              !currentEducation.startDate ||
              !currentEducation.endDate
            }
            className="next-button"
          >
            Next
          </button>
        </div>
      )}

      {!showConfirmation && step === 7 && (
        <div className="form-step float-in">
          <h2>Upload your profile picture</h2>
          {formData.profilePicture && (
            <div className="preview-image">
              <img src={formData.profilePicture} alt="Profile preview" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="file-label">
            Choose Image
          </label>
          <button
            onClick={() => handleNext()}
            disabled={!formData.profilePicture || saving}
            className="next-button"
          >
            {saving ? "Saving..." : "Complete"}
          </button>
        </div>
      )}

      {step === 8 && (
        <div className="completion-screen float-in">
          <div className="success-icon">✨</div>
          <h1>Welcome aboard, {formData.fullName}!</h1>
          <p>
            Your profile is all set up. Let's start your journey with
            InternConnect!
          </p>
          <button
            className="start-button"
            onClick={async () => {
              const saved = await saveOnboardingData();
              if (saved) {
                setTimeout(() => {
                  navigate("/dashboard");
                }, 1500);
              }
            }}
            disabled={saving}
          >
            {saving ? "Setting up..." : "Get Started"}
          </button>
        </div>
      )}

      <div className="progress-dots">
        {[1, 2, 3, 4, 5, 6, 7].map((dot) => (
          <span key={dot} className={`dot ${step >= dot ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
};

export default OnboardingPage;
