import { Button } from "./button";
import "../style/job.css";
import logo_blue from "../assets/logo_blue.png";
import { _colorExp } from "gsap/gsap-core";

const JobCard = ({
  logo,
  jobTitle = "Software Engineer Intern",
  company = "Innovate Inc.",
  location = "Lagos, Nigeria",
  duration = "3 Months",
  timePosted = "4d ago",
  tags = ["Paid"],
  onApply = () => {},
}) => {
  const getTagStyle = (tag) => {
    switch (tag.toLowerCase()) {
      case "paid":
        return "tag-paid";
    }
  };

  return (
    <div className="job-card">
      <div className="card-content">
        {/* Left side - Logo and Job Info */}
        <div className="left-content">
          {/* Company Logo */}
          <div className="logo-container">
            {logo ? (
              <img
                src={logo_blue}
                alt={`${company} logo`}
                className="company-logo"
              />
            ) : (
              <div className="logo-placeholder">
                <span className="logo-placeholder-text">
                  {company.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="job-details">
            <h3 className="job-title h3">{jobTitle}</h3>
            <p className="company-name text-base">{company}</p>

            {/* Location and Duration */}
            <div className="metadata">
              <div className="location-info">
                <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{location}</span>
              </div>
              <div className="duration-info">
                <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="tags-container">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`tag tag-${tag.toLowerCase().replace("-", "")}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Apply Button and Time */}
        <div className="right-content">
          <Button label="Apply Now" />
          <span className="time-posted">{timePosted}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
