import React from "react";
import { LogOut } from "lucide-react";
import "../style/logout-modal.css";

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-backdrop" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-content">
          <div className="logout-icon">
            <LogOut size={24} />
          </div>
          <h2>Confirm Logout</h2>
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="logout-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="logout-button" onClick={onConfirm}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
