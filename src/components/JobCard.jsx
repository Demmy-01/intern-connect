import React from "react";

const JobCard = ({
  id,
  title,
  company,
  logo,
  department,
  location,
  workType,
  onClick,
  arrow = "→",
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (id) {
      window.location.href = `/internship-details/${id}`;
    }
  };

  return (
    <div
      className="dashboard-job-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="dashboard-job-logo">
        <img src={logo} alt={`${company} logo`} />
      </div>
      <div className="dashboard-job-info">
        <h3>{title}</h3>
        <p className="company-name">{company}</p>
        {department && <p className="job-department">{department}</p>}
        <div className="job-meta">
          {location && <span className="job-location">{location}</span>}
          {workType && <span className="job-type">{workType}</span>}
        </div>
      </div>
      <div className="dashboard-job-arrow">{arrow}</div>

      <style jsx>{`
        .dashboard-job-card {
          transition: all 0.2s ease;
          border-radius: 8px;
          padding: 1rem;
        }

        .dashboard-job-card:hover {
          background-color: var(--bg-hover, #f8fafc);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadow-hover, rgba(0, 0, 0, 0.1));
        }

        .company-name {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0.25rem 0;
        }

        .job-department {
          color: var(--text-tertiary, #94a3b8);
          font-size: 0.75rem;
          margin: 0.25rem 0;
          font-style: italic;
        }

        .job-meta {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .job-location,
        .job-type {
          font-size: 0.75rem;
          color: var(--text-tertiary, #94a3b8);
          background: var(--tag-bg, #f1f5f9);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default JobCard;
