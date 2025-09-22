import { Button } from "../components/button.jsx";

// JobCard Component
const JobCardApply = ({
  logo,
  jobTitle = "Software Engineer Intern",
  company = "Innovate Inc.",
  location = "Lagos, Nigeria",
  duration = "3 Months",
  timePosted = "4d ago",
  tags = ["Paid"],
  onApply = () => {},
  onViewDetails = () => {},
}) => {
  return (
    <>
      <style>
        {`
          .int-job-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 2px 0 var(--card-shadow);
            transition: all 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          }

          .int-job-card:hover {
            box-shadow: 0 4px 6px -1px var(--shadow-medium);
            transform: translateY(-2px);
          }

          .int-job-card-content {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .int-job-card-left {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            flex: 1;
            min-width: 0;
          }

          .int-company-logo-container {
            flex-shrink: 0;
          }

          .int-company-logo {
            width: 3rem;
            height: 3rem;
            border-radius: 0.5rem;
            object-fit: cover;
          }

          .int-logo-placeholder {
            width: 3rem;
            height: 3rem;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .int-logo-placeholder-text {
            color: white;
            font-weight: bold;
            font-size: 1.125rem;
          }

          .int-job-details {
            flex: 1;
            min-width: 0;
          }

          .int-job-title {
            color: var(--text-primary);
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            line-height: 1.4;
          }

          .int-company-name {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            line-height: 1.4;
          }

          .int-job-metadata {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: var(--text-tertiary);
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }

          .int-metadata-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .int-metadata-icon {
            width: 1rem;
            height: 1rem;
          }

          .int-tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .int-tag {
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
          }

          .int-tag-paid {
            background-color: #fbbf24;
            color: black;
          }

          .int-tag-remote {
            background-color: #10b981;
            color: white;
          }

          .int-tag-onsite {
            background-color: #3b82f6;
            color: white;
          }

          .int-tag-hybrid {
            background-color: #8b5cf6;
            color: white;
          }

          .int-job-card-right {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 0.5rem;
            margin-left: 1rem;
          }

          .int-apply-btn {
            /* optional: keep styling hooks for the Button if needed */
          }

          .int-time-posted {
            color: var(--text-tertiary);
            font-size: 0.75rem;
          }

          @media (max-width: 768px) {
            .int-job-card {
              padding: 1rem;
            }

            .int-job-card-content {
              flex-direction: column;
            }

            .int-job-card-right {
              width: 100%;
              flex-direction: row;
              justify-content: space-between;
              align-items: center;
              margin-left: 0;
            }
          }
        `}
      </style>
      <div className="int-job-card">
        <div className="int-job-card-content">
          {/* Left side - Logo and Job Info */}
          <div className="int-job-card-left">
            {/* Company Logo */}
            <div className="int-company-logo-container">
              {logo ? (
                <img
                  src={logo}
                  alt={`${company} logo`}
                  className="int-company-logo"
                />
              ) : (
                <div className="int-logo-placeholder">
                  <span className="int-logo-placeholder-text">
                    {company.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Job Details */}
            <div className="int-job-details">
              <h3 className="int-job-title">{jobTitle}</h3>
              <p className="int-company-name">{company}</p>

              {/* Location and Duration */}
              <div className="int-job-metadata">
                <div className="int-metadata-item">
                  <svg
                    className="int-metadata-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{location}</span>
                </div>
                <div className="int-metadata-item">
                  <svg
                    className="int-metadata-icon"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{duration}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="int-tags-container">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`int-tag int-tag-${tag.toLowerCase()}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Apply Button and Time */}
          <div className="int-job-card-right">
            <Button
              label="Apply Now"
              onClick={onApply}
              className="int-apply-btn"
            />
            <Button
              label="View Internship"
              onClick={onViewDetails}
              className="int-apply-btn"
            />
            <span className="int-time-posted">{timePosted}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobCardApply;
