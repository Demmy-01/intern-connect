import React from "react";
import { useNavigate } from "react-router-dom";

const AcceptedInternshipsModal = ({ isOpen, onClose, applications = [] }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Filter only accepted applications
  const acceptedApplications = applications.filter(app => app.status === 'accepted');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleInternshipClick = (internshipId) => {
    onClose();
    navigate(`/internship-details/${internshipId}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Accepted Internships</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {acceptedApplications.length === 0 ? (
            <div className="empty-offers">
              <div className="empty-icon">🎉</div>
              <p>No accepted offers yet</p>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>
                Keep applying! Your dream internship is waiting for you.
              </p>
            </div>
          ) : (
            <div className="offers-list">
              <div className="congratulations-banner">
                <div className="congrats-icon">🎊</div>
                <div className="congrats-text">
                  <h3>Congratulations!</h3>
                  <p>You have {acceptedApplications.length} accepted internship{acceptedApplications.length > 1 ? 's' : ''}!</p>
                </div>
              </div>

              {acceptedApplications.map((application) => (
                <div 
                  key={application.id} 
                  className="offer-item"
                  onClick={() => handleInternshipClick(application.internships?.id)}
                >
                  <div className="offer-main">
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
                    
                    <div className="offer-info">
                      <h3>{application.internships?.position_title || 'Unknown Position'}</h3>
                      <p className="company-name">
                        {application.internships?.organizations?.organization_name || 'Unknown Company'}
                      </p>
                      <div className="offer-details">
                        {application.internships?.location && (
                          <span className="detail-item">📍 {application.internships.location}</span>
                        )}
                        {application.internships?.work_type && (
                          <span className="detail-item">💼 {application.internships.work_type}</span>
                        )}
                        {application.internships?.compensation && (
                          <span className="detail-item">💰 {application.internships.compensation}</span>
                        )}
                      </div>
                      <p className="acceptance-date">
                        Accepted on {formatDate(application.applied_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="offer-status">
                    <div className="success-badge">
                      ✓ Accepted
                    </div>
                    <div className="view-details">
                      View Details →
                    </div>
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
          {acceptedApplications.length > 0 && (
            <button 
              className="btn-primary"
              onClick={() => {
                onClose();
                // You can add functionality to prepare for internship or view more details
              }}
            >
              Prepare for Internship
            </button>
          )}
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
          max-width: 700px;
          max-height: 80vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .modal-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: white;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }

        .empty-offers {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #64748b;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-offers p:first-of-type {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .offers-list {
          padding: 0;
        }

        .congratulations-banner {
          background: linear-gradient(135deg, #fef3c7, #fbbf24);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .congrats-icon {
          font-size: 2.5rem;
        }

        .congrats-text h3 {
          margin: 0 0 0.25rem 0;
          color: #92400e;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .congrats-text p {
          margin: 0;
          color: #a16207;
          font-size: 0.875rem;
        }

        .offer-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .offer-item:hover {
          background-color: #f8fdf8;
        }

        .offer-item:last-child {
          border-bottom: none;
        }

        .offer-main {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .company-logo {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .company-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .logo-placeholder {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.5rem;
        }

        .offer-info {
          flex: 1;
          min-width: 0;
        }

        .offer-info h3 {
          margin: 0 0 0.5rem 0;
          color: #1e293b;
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .company-name {
          margin: 0 0 0.75rem 0;
          color: #64748b;
          font-size: 1rem;
          font-weight: 500;
        }

        .offer-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .detail-item {
          font-size: 0.875rem;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .acceptance-date {
          margin: 0;
          color: #22c55e;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .offer-status {
          text-align: right;
          flex-shrink: 0;
        }

        .success-badge {
          background: #dcfce7;
          color: #16a34a;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .view-details {
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
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
          background: #f1f5f9;
          color: #64748b;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
          color: #475569;
        }

        .btn-primary {
          background: #22c55e;
          color: white;
        }

        .btn-primary:hover {
          background: #16a34a;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .offer-main {
            gap: 0.75rem;
          }

          .company-logo,
          .logo-placeholder {
            width: 50px;
            height: 50px;
          }

          .logo-placeholder {
            font-size: 1.25rem;
          }

          .offer-details {
            flex-direction: column;
            gap: 0.25rem;
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

export default AcceptedInternshipsModal;