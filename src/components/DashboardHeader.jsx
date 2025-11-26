import { Buttons } from "./button-1.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { User } from "lucide-react";
import profileService from "../lib/profileService";
import LogoutModal from "./LogoutModal";

// Header Component
const DashboardHeader = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [profileUsername, setProfileUsername] = useState("User");
  const [profileImage, setProfileImage] = useState(null);
  const [useDefaultIcon, setUseDefaultIcon] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && user.id) {
        try {
          const result = await profileService.getProfile(user.id);
          if (result.success && result.data) {
            setProfileUsername(result.data.username || "User");
            if (result.data.profileImage) {
              setProfileImage(result.data.profileImage);
              setUseDefaultIcon(false);
            }
          }
        } catch (error) {
          console.error("Failed to fetch profile data:", error);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="dashboard-header">
      <div className="dashboard-profile-section">
        <div className="dashboard-avatar">
          {useDefaultIcon ? (
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={32} color="#4f46e5" />
            </div>
          ) : (
            <img src={profileImage} alt="Profile" />
          )}
        </div>
        <div className="dashboard-welcome-text">
          <h1>Welcome back, {profileUsername}!</h1>
          <p>Here's your internship search snapshot.</p>
        </div>
      </div>
      <div className="dashboard-actions">
        <Link to="/profile">
          <Buttons label="View Profile" />
        </Link>
        <Link to="/internships">
          <Buttons label="Explore Internships" />
        </Link>
        <Buttons label="Logout" onClick={handleLogoutClick} />
      </div>
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onClose={handleLogoutCancel}
      />
    </div>
  );
};

export default DashboardHeader;
