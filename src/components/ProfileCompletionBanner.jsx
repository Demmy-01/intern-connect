import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import organizationService from "../lib/organizationService";
import { Button } from "./button.jsx";

const ProfileCompletionBanner = () => {
  const [profileStatus, setProfileStatus] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    const status = await organizationService.checkProfileCompletion();
    setProfileStatus(status);
  };

  if (!profileStatus || profileStatus.isComplete || !isVisible) {
    return null;
  }

  return (
    <div className="profile-completion-banner">
      <div className="banner-content">
        <div className="completion-info">
          <div className="completion-text">
            <h3>Complete Your Organization Profile</h3>
            <p>
              Please complete your profile to get the most out of our platform.
            </p>
          </div>
          <div className="completion-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${profileStatus.completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">
              {profileStatus.completionPercentage}% Complete
            </span>
          </div>
        </div>
        <div className="banner-actions">
          <Link to="/organization-profile-edit">
            <Button label="Complete Profile" />
          </Link>
          <Button
            label="Dismiss"
            onClick={() => setIsVisible(false)}
            className="secondary-button"
          />
        </div>
      </div>
      <div className="missing-fields">
        <p>Missing information:</p>
        <ul>
          {profileStatus.missingFields.map((field, index) => (
            <li key={index}>{field.label}</li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .profile-completion-banner {
          background: white;
          color: #333;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .banner-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .completion-info {
          flex: 1;
        }

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }

        p {
          margin: 0;
          font-size: 0.875rem;
          color: #4b5563;
        }

        .completion-progress {
          margin-top: 1rem;
        }

        .progress-bar {
          background-color: #f3f4f6;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          background-color: #1070e5;
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .banner-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .complete-profile-btn {
          background-color: white;
          color: #1a73e8;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .complete-profile-btn:hover {
          background-color: #f8f9fa;
        }

        .dismiss-btn {
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.5);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .dismiss-btn:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .missing-fields {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .missing-fields p {
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .missing-fields ul {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .missing-fields li {
          background-color: #f3f4f6;
          color: #4b5563;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default ProfileCompletionBanner;
