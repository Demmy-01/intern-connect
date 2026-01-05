import React from "react";
import { X, Users, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../style/AccountTypeModal.css";

const AccountTypeModal = ({ isOpen, onClose, type = "login" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleStudentClick = () => {
    navigate(type === "login" ? "/login" : "/signup");
    onClose();
  };

  const handleOrganizationClick = () => {
    navigate(type === "login" ? "/organization-login" : "/organization-signup");
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="account-type-modal-backdrop" onClick={handleBackdropClick}>
      <div className="account-type-modal">
        <button className="account-type-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="account-type-title">
          {type === "login" ? "Login as" : "Sign up as"}
        </h2>
        <p className="account-type-subtitle">
          Choose your account type to continue
        </p>

        <div className="account-type-options">
          {/* Student Option */}
          <button
            className="account-option student-option"
            onClick={handleStudentClick}
          >
            <div className="option-icon student-icon">
              <Users size={32} />
            </div>
            <h3 className="option-title">Student</h3>
            <p className="option-description">
              Find and apply to internship opportunities
            </p>
          </button>

          {/* Organization Option */}
          <button
            className="account-option organization-option"
            onClick={handleOrganizationClick}
          >
            <div className="option-icon organization-icon">
              <Briefcase size={32} />
            </div>
            <h3 className="option-title">Organization</h3>
            <p className="option-description">
              Post internships and hire talented students
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTypeModal;
