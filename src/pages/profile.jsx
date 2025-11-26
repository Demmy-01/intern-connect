import { useState, useEffect } from "react";
import "../style/profile.css";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer";
import SkillTag from "../components/SkillTag.jsx";
import ExperienceItem from "../components/experience.jsx";
import EducationItem from "../components/education.jsx";
import Loader from "../components/Loader.jsx";
import phonee from "../assets/phone.png";
import mail from "../assets/mail.png";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import profileService from "../lib/profileService";
import image from "../assets/profile-hero-image.png";
import { BarChart3 } from "lucide-react";

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

  if (loading) return <Loader message="Loading profile..." />;
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

      {/* Cover Section */}
      <section className="prof-cover-section">
        <div className="prof-cover-image">
          <img src={image} alt="Cover" />
        </div>

        <div className="prof-edit-button-wrapper">
          <Link to="/edit-profile" className="prof-edit-btn-modern">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            {isIncomplete ? "Complete Profile" : "Edit Profile"}
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="prof-main-container">
        <div className="prof-content-wrapper">
          {isIncomplete && (
            <div className="profile-incomplete-banner">
              <strong>Complete your profile!</strong> Add your bio, skills,
              education, and experience to get started.
            </div>
          )}

          {/* Profile Header */}
          <div className="prof-header-section">
            <div className="prof-avatar-container">
              <img
                src={
                  profileImage ||
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                }
                alt={name}
                className="prof-avatar-large"
              />
            </div>
            <div className="prof-name-section">
              <h1 className="prof-display-name">{name}</h1>
            </div>
          </div>

          {/* Bio & Contact Card */}
          <section className="prof-card-modern">
            <div className="prof-card-content">
              <p className="prof-bio-text">
                {bio || "Add a bio to tell us about yourself..."}
              </p>
              <div className="prof-contact-grid">
                <div className="prof-contact-item-modern">
                  <span className="prof-icon-wrapper">
                    <img src={mail} alt="Email" />
                  </span>
                  <a href={`mailto:${email}`} className="prof-contact-link">
                    {email}
                  </a>
                </div>
                <div className="prof-contact-item-modern">
                  <span className="prof-icon-wrapper">
                    <img src={phonee} alt="Phone" />
                  </span>
                  <a href={`tel:${phone}`} className="prof-contact-link">
                    {phone || "Add your phone number"}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Skills Section */}
          <section className="prof-card-modern">
            <div className="prof-card-content">
              <div className="prof-section-title-modern">
                <BarChart3 className="h-5 w-5 text-slate-700" />
                <h2>Skills</h2>
              </div>
              {skills.length > 0 ? (
                <div className="prof-skills-grid">
                  {skills.map((s, index) => (
                    <SkillTag key={index}>{s}</SkillTag>
                  ))}
                </div>
              ) : (
                <p className="prof-empty-state">No skills added yet.</p>
              )}
            </div>
          </section>

          {/* Experience Section */}
          <section className="prof-card-modern">
            <div className="prof-card-content">
              <h2 className="prof-section-heading">Experience</h2>
              {experiences.length > 0 ? (
                <div className="prof-timeline">
                  {experiences.map((exp, index) => (
                    <ExperienceItem
                      key={index}
                      title={exp.title}
                      company={exp.company}
                      duration={exp.duration}
                      description={exp.description}
                    />
                  ))}
                </div>
              ) : (
                <p className="prof-empty-state">No experiences added yet.</p>
              )}
            </div>
          </section>

          {/* Education Section */}
          <section className="prof-card-modern prof-last-section">
            <div className="prof-card-content">
              <h2 className="prof-section-heading">Education</h2>
              {education.length > 0 ? (
                <div className="prof-timeline">
                  {education.map((edu, index) => (
                    <EducationItem
                      key={index}
                      institution={edu.institution}
                      degree={edu.degree}
                      duration={edu.duration}
                      coursework={edu.coursework}
                    />
                  ))}
                </div>
              ) : (
                <p className="prof-empty-state">No education added yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Profile;
