// components/InternshipRow.jsx
import React, { useState } from 'react';

const InternshipRow = ({ 
  id,
  position, 
  department, 
  description, 
  isActive, 
  onToggleStatus,
  onDelete 
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggleStatus(id, !isActive);
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this internship?')) {
      onDelete(id);
    }
  };

  return (
    <div className="internship-row">
      <div className="row-position">{position}</div>
      <div className="row-department">{department}</div>
      <div className="row-description">{description}</div>
      <div className="row-status">
        <div className="status-container">
          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <button
            className={`toggle-button ${isActive ? 'active' : 'inactive'}`}
            onClick={handleToggle}
            disabled={isToggling}
            title={isActive ? 'Deactivate internship' : 'Activate internship'}
          >
            <div className={`toggle-slider ${isActive ? 'active' : ''}`}>
              <div className="toggle-circle"></div>
            </div>
          </button>
        </div>
      </div>
      <div className="row-actions">
        <button 
          className="action-button delete-button" 
          onClick={handleDelete}
          title="Delete internship"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InternshipRow;