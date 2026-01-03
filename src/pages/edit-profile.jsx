// EditProfile.jsx - Using ProfileService
import { useState, useEffect } from "react";
import { toast } from "../components/ui/sonner";
import "../style/edit-profile.css";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer";
import Loader from "../components/Loader.jsx";
import { Button } from "../components/button.jsx";
import skill from "../assets/skills.png";
import { supabase } from "../lib/supabase";
import profileService from "../lib/profileService";
import { Camera } from "lucide-react";

const EditProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: "",
    skills: [],
    experiences: [],
    education: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile using service...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const result = await profileService.getProfile(user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      if (result.data) {
        setProfileData(result.data);
        console.log("Profile loaded successfully");
      } else {
        // No profile exists yet - set defaults
        setProfileData((prev) => ({
          ...prev,
          email: user.email || "",
        }));
        console.log("No profile found - using defaults");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Load error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Check required fields (experience is optional)
    if (!profileData.name?.trim()) errors.name = "Full name is required";
    if (!profileData.username?.trim()) errors.username = "Username is required";
    if (!profileData.phone?.trim()) errors.phone = "Phone number is required";
    if (!profileData.bio?.trim()) errors.bio = "Bio is required";
    
    // Check education fields
    profileData.education.forEach((edu, idx) => {
      if (edu.institution?.trim() || edu.degree?.trim() || edu.duration?.trim() || edu.coursework?.trim()) {
        // If any education field is filled, require all
        if (!edu.institution?.trim()) errors[`education_${idx}_institution`] = "Institution is required";
        if (!edu.degree?.trim()) errors[`education_${idx}_degree`] = "Degree is required";
        if (!edu.duration?.trim()) errors[`education_${idx}_duration`] = "Duration is required";
      }
    });
    
    // Check skills
    if (profileData.skills.length === 0) errors.skills = "Add at least one skill";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const addExperience = () => {
    setProfileData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { title: "", company: "", duration: "", description: "" },
      ],
    }));
  };

  const removeExperience = (index) => {
    setProfileData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addEducation = () => {
    setProfileData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { institution: "", degree: "", duration: "", coursework: "" },
      ],
    }));
  };

  const removeEducation = (index) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before saving
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      console.log("Starting save using service...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const result = await profileService.updateProfile(user.id, profileData);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Profile updated successfully!");
      window.history.back();
    } catch (err) {
      console.error("Save error:", err);
      setError(`Save error: ${err.message}`);
      toast.error(`Save error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const result = await profileService.uploadProfileImage(user.id, file);

      if (!result.success) {
        throw new Error(result.message);
      }

      setProfileData((prev) => ({
        ...prev,
        profileImage: result.imageUrl,
      }));

      toast.success("Profile image updated successfully!");
      console.log("Image uploaded successfully");
    } catch (err) {
      console.error("Image upload error:", err);
      setError(`Image upload error: ${err.message}`);
      toast.error(`Image upload error: ${err.message}`);
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) return <Loader message="Loading your profile..." />;
  if (error)
    return <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>;

  return (
    <>
      <Navbar className="profile-nav" />
      <div className="edit-prof-container">
        <div className="edit-prof-header">
          <h1>Edit Profile</h1>
          <p>Update your personal information and professional details</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-prof-form">
          <div className="edit-prof-card">
            {/* Basic Information Section */}
            <div className="edit-prof-section">
              <div className="edit-prof-section-header">
                <h2>Basic Information</h2>
              </div>

              <div className="edit-prof-image-section">
                <div className="edit-prof-image-preview">
                  <img
                    src={
                      profileData.profileImage ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    }
                    alt="Profile Preview"
                  />
                  {imageUploading && (
                    <div className="edit-prof-image-loading">
                      <div className="edit-prof-spinner"></div>
                    </div>
                  )}
                  <div className="edit-prof-image-overlay">
                    <label
                      htmlFor="profile-image-input"
                      className="edit-prof-image-btn"
                      title="Click to change photo"
                    >
                      <Camera size={24} />
                      Change Photo
                    </label>
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      disabled={saving || imageUploading}
                    />
                  </div>
                </div>
              </div>

              <div className="edit-prof-form-grid">
                <div className="edit-prof-form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={saving}
                    className={validationErrors.name ? "edit-prof-input-error" : ""}
                  />
                  {validationErrors.name && (
                    <span className="edit-prof-error-text">{validationErrors.name}</span>
                  )}
                </div>

                <div className="edit-prof-form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={profileData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    placeholder="Enter your username"
                    required
                    disabled={saving}
                    className={validationErrors.username ? "edit-prof-input-error" : ""}
                  />
                  {validationErrors.username && (
                    <span className="edit-prof-error-text">{validationErrors.username}</span>
                  )}
                </div>

                <div className="edit-prof-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    readOnly
                    placeholder="From your account"
                  />
                </div>

                <div className="edit-prof-form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    disabled={saving}
                    className={validationErrors.phone ? "edit-prof-input-error" : ""}
                  />
                  {validationErrors.phone && (
                    <span className="edit-prof-error-text">{validationErrors.phone}</span>
                  )}
                </div>
              </div>

              <div className="edit-prof-form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows="4"
                  disabled={saving}
                  className={validationErrors.bio ? "edit-prof-input-error" : ""}
                />
                {validationErrors.bio && (
                  <span className="edit-prof-error-text">{validationErrors.bio}</span>
                )}
              </div>
            </div>

            {/* Skills Section */}
            <div className="edit-prof-section">
              <div className="edit-prof-section-header">
                <span className="edit-prof-section-icon">
                  <img src={skill} alt="Skills Icon" />
                </span>
                <h2>Skills</h2>
              </div>
              {validationErrors.skills && (
                <div className="edit-prof-error-text" style={{ marginBottom: "16px" }}>
                  {validationErrors.skills}
                </div>
              )}

              <div className="edit-prof-skills-container">
                <div className="edit-prof-skills-list">
                  {profileData.skills.map((skillItem, index) => (
                    <div key={index} className="edit-prof-skill-tag">
                      <span>{skillItem}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skillItem)}
                        className="edit-prof-skill-remove"
                        disabled={saving}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="edit-prof-add-skill">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill"
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addSkill())
                    }
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="edit-prof-add-btn"
                    disabled={saving}
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>

            {/* Experience Section */}
            <div className="edit-prof-section">
              <div className="edit-prof-section-header">
                <h2>Experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="edit-prof-add-btn"
                  disabled={saving}
                >
                  + Add Experience
                </button>
              </div>

              {profileData.experiences.map((exp, index) => (
                <div key={index} className="edit-prof-experience-item">
                  <div className="edit-prof-item-header">
                    <h4>Experience {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="edit-prof-remove-btn"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="edit-prof-form-grid">
                    <div className="edit-prof-form-group">
                      <label>Job Title</label>
                      <input
                        type="text"
                        value={exp.title || ""}
                        onChange={(e) =>
                          handleExperienceChange(index, "title", e.target.value)
                        }
                        placeholder="e.g. UI/UX Designer"
                        disabled={saving}
                      />
                    </div>

                    <div className="edit-prof-form-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        placeholder="e.g. AgroMall"
                        disabled={saving}
                      />
                    </div>

                    <div className="edit-prof-form-group edit-prof-full-width">
                      <label>Duration</label>
                      <input
                        type="text"
                        value={exp.duration || ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        placeholder="e.g. April 23, 2025 - September 5, 2025"
                        disabled={saving}
                      />
                    </div>

                    <div className="edit-prof-form-group edit-prof-full-width">
                      <label>Description</label>
                      <textarea
                        value={exp.description || ""}
                        onChange={(e) =>
                          handleExperienceChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Describe your role and achievements..."
                        rows="3"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Education Section */}
            <div className="edit-prof-section">
              <div className="edit-prof-section-header">
                <h2>Education</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="edit-prof-add-btn"
                  disabled={saving}
                >
                  + Add Education
                </button>
              </div>

              {profileData.education.map((edu, index) => (
                <div key={index} className="edit-prof-education-item">
                  <div className="edit-prof-item-header">
                    <h4>Education {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="edit-prof-remove-btn"
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="edit-prof-form-grid">
                    <div className="edit-prof-form-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Elizade University"
                        disabled={saving}
                      />
                    </div>

                    <div className="edit-prof-form-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) =>
                          handleEducationChange(index, "degree", e.target.value)
                        }
                        placeholder="e.g. Bachelor of Science in Computer Science"
                        disabled={saving}
                      />
                    </div>

                    <div className="edit-prof-form-group edit-prof-full-width">
                      <label>Duration</label>
                      <input
                        type="text"
                        value={edu.duration || ""}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Sep 2021 - May 2025"
                        disabled={saving}
                      />
                    </div>

                    <div className="edit-prof-form-group edit-prof-full-width">
                      <label>Relevant Coursework</label>
                      <textarea
                        value={edu.coursework || ""}
                        onChange={(e) =>
                          handleEducationChange(
                            index,
                            "coursework",
                            e.target.value
                          )
                        }
                        placeholder="List relevant courses..."
                        rows="2"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Form Actions */}
            <div className="edit-prof-actions">
              <Button
                type="button"
                className="edit-prof-cancel-btn"
                onClick={() => window.history.back()}
                label="Cancel"
                disabled={saving}
              />
              <Button
                type="submit"
                className="edit-prof-save-btn"
                disabled={saving}
                label={saving ? "Saving..." : "Save Changes"}
              />
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditProfile;
