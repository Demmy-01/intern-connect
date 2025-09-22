// Profile.jsx
import { useState, useEffect } from "react";
import "../style/profile.css";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer";
import { Button } from "../components/button.jsx";
import SkillTag from "../components/SkillTag.jsx";
import ExperienceItem from "../components/experience.jsx";
import EducationItem from "../components/education.jsx";
import skill from "../assets/skills.png";
import phonee from "../assets/phone.png";
import mail from "../assets/mail.png";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import profileService from "../lib/profileService";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIncomplete, setIsIncomplete] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("Fetching profile...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Please log in");
      }

      const result = await profileService.getProfile(user.id);
      if (result.success) {
        const profileData = result.data;
        const mappedProfile = {
          display_name: profileData.username,
          username: profileData.username,
          bio: profileData.bio,
          phone: profileData.phone,
          avatar_url: profileData.profileImage,
          skills: profileData.skills,
          education: profileData.education,
          experiences: profileData.experiences,
          email: profileData.email,
        };

        setProfile(mappedProfile);
        setIsIncomplete(
          !profileData.bio.trim() &&
            profileData.skills.length === 0 &&
            profileData.education.length === 0
        );
        console.log("Profile fetched:", mappedProfile);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile)
    return (
      <div>
        No profile found. <button onClick={fetchProfile}>Retry</button>
      </div>
    );

  const {
    display_name: name,
    username,
    bio,
    phone,
    avatar_url: profileImage,
    skills,
    education,
    experiences,
    email,
  } = profile;

  return (
    <>
      <Navbar className="profile-nav" />
      <div className="prof-container">
        {isIncomplete && (
          <div
            className="profile-incomplete-banner"
            style={{
              background: "#fff3cd",
              padding: "10px",
              marginBottom: "20px",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
            }}
          >
            <strong>Complete your profile!</strong> Add your bio, skills,
            education, and experience to get started.
          </div>
        )}
        <div className="prof-card">
          {/* Left Panel */}
          <div className="prof-left-panel">
            <div className="prof-image">
              <img
                src={
                  profileImage ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                }
                alt={name}
              />
            </div>
            <h1 id="username" className="prof-name">
              {name}
            </h1>
            <div className="prof-username">@{username}</div>
            <div className="prof-bio">
              {bio || "Add a bio to tell us about yourself..."}
            </div>
            <Link to="/edit-profile">
              <Button
                label={isIncomplete ? "Complete Profile" : "Edit Profile"}
              />
            </Link>
            <br />
            <div className="prof-contact-info">
              <div className="prof-contact-item">
                <span className="prof-contact-icon">
                  <img src={mail} alt="Email" />
                </span>
                <span>{email}</span>
              </div>
              <div className="prof-contact-item">
                <span className="prof-contact-icon">
                  <img src={phonee} alt="Phone" />
                </span>
                <span>{phone || "Add your phone number"}</span>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="prof-right-panel">
            {/* Skills */}
            <div className="prof-section">
              <div className="prof-section-header">
                <span className="prof-section-icon">
                  <img src={skill} alt="Skills" className="prof-sidebar-icon" />
                </span>
                <h2>Skills</h2>
              </div>
              {skills.length > 0 ? (
                <div className="prof-skills-list">
                  {skills.map((s, index) => (
                    <SkillTag key={index}>{s}</SkillTag>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  No skills added yet.
                </p>
              )}
            </div>

            {/* Experience */}
            <div className="prof-section">
              <h2 className="prof-section-title">Experience</h2>
              {experiences.length > 0 ? (
                experiences.map((exp, index) => (
                  <ExperienceItem
                    key={index}
                    title={exp.title}
                    company={exp.company}
                    duration={exp.duration}
                    description={exp.description}
                  />
                ))
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  No experiences added yet.
                </p>
              )}
            </div>

            {/* Education */}
            <div className="prof-section">
              <h2>Education</h2>
              {education.length > 0 ? (
                education.map((edu, index) => (
                  <EducationItem
                    key={index}
                    institution={edu.institution}
                    degree={edu.degree}
                    duration={edu.duration}
                    coursework={edu.coursework}
                  />
                ))
              ) : (
                <p style={{ color: "#999", fontStyle: "italic" }}>
                  No education added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Profile;
