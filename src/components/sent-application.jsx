import React from "react";
import { useNavigate } from "react-router-dom";

const SentApplicationModal = ({ isOpen, onClose, applications = [] }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'var(--success)';
      case 'rejected': return 'var(--error)';
      case 'pending': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      case 'reviewed': return 'Under Review';
      default: return 'Unknown';
    }
  };

  const handleApplicationClick = (internshipId) => {
    onClose();
    navigate(`/internship-details/${internshipId}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Your Applications</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {applications.length === 0 ? (
            <div className="empty-applications">
              <p>You haven't sent any applications yet.</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Start exploring internships and apply to your dream positions!
              </p>
            </div>
          ) : (
            <div className="applications-list">
              {applications.map((application) => (
                <div 
                  key={application.id} 
                  className="application-item"
                  onClick={() => handleApplicationClick(application.internships?.id)}
                >
                  <div className="application-main">
                    <div className="company-logo">
                      {application.internships?.organizations?.logo_url ? (
                        <img 
                          src={application.internships.organizations.logo_url} 
                          alt={application.internships.organizations.organization_name}
                        />
                      ) : (
                        <div className="logo-placeholder">
                          {application.internships?.organizations?.organization_name?.charAt(0) || 'C'}
                        </div>
                      )}
                    </div>
                    
                    <div className="application-info">
                      <h3>{application.internships?.position_title || 'Unknown Position'}</h3>
                      <p className="company-name">
                        {application.internships?.organizations?.organization_name || 'Unknown Company'}
                      </p>
                      <p className="application-details">
                        {application.internships?.location && (
                          <span>{application.internships.location} • </span>
                        )}
                        {application.internships?.work_type && (
                          <span>{application.internships.work_type}</span>
                        )}
                      </p>
                      <p className="application-date">
                        Applied on {formatDate(application.applied_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="application-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(application.status) }}
                    >
                      {getStatusText(application.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button 
            className="btn-primary"
            onClick={() => {
              onClose();
              navigate('/internships');
            }}
          >
            Explore More Internships
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--card-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 600;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: var(--text-secondary);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .empty-applications {
          text-align: center;
          padding: 3rem 1.5rem;
          color: var(--text-secondary);
        }

        .empty-applications p:first-child {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .applications-list {
          padding: 0;
        }

        .application-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--bg-tertiary);
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .application-item:hover {
          background-color: var(--bg-secondary);
        }

        .application-item:last-child {
          border-bottom: none;
        }

        .application-main {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .company-logo {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .logo-placeholder {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .application-info {
          flex: 1;
          min-width: 0;
        }

        .application-info h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .company-name {
          margin: 0 0 0.5rem 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .application-details {
          margin: 0 0 0.5rem 0;
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }

        .application-date {
          margin: 0;
          color: var(--text-tertiary);
          font-size: 0.75rem;
        }

        .application-status {
          flex-shrink: 0;
        }

        .status-badge {
          color: var(--text-on-primary);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .btn-secondary,
        .btn-primary {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          background: var(--card-bg);
          color: var(--text-primary);
        }

        .btn-primary {
          background: var(--primary);
          color: var(--text-on-primary);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .application-main {
            gap: 0.75rem;
          }

          .company-logo {
            width: 40px;
            height: 40px;
          }

          .logo-placeholder {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .modal-footer {
            flex-direction: column-reverse;
          }

          .btn-secondary,
          .btn-primary {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default SentApplicationModal;