import "../style/profilewarning.css";

const ProfileWarningModal = ({ open, onClose, missingFields }) => {
  if (!open) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-box">
        <h2 className="profile-modal-title">
          Incomplete Profile ⚠️
        </h2>

        <p className="profile-modal-text">
          You haven’t completed your profile. Kindly update:
        </p>

        <ul className="profile-modal-list">
          {missingFields.map((field, index) => (
            <li key={index}>{field}</li>
          ))}
        </ul>

        <div className="profile-modal-actions">
          <button onClick={onClose} className="modal-cancel-btn">
            Cancel
          </button>

          <button
            onClick={() => window.location.href = "/profile"}
            className="modal-update-btn"
          >
            Update Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileWarningModal;