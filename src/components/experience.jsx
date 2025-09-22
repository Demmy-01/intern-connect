import apply from "../assets/apply.png";
import "../style/experience.css";

const ExperienceItem = ({ title, company, duration, description }) => (
  <div className="prof-experience-item">
    <div className="prof-experience-header">
      <div className="prof-company-logo">
        <img src={apply} alt="Company Logo" />
      </div>
      <div className="prof-experience-content">
        <h3>{title}</h3>
        <div className="prof-company-name">{company}</div>
        <div className="prof-duration">{duration}</div>
        <p className="prof-description">{description}</p>
      </div>
    </div>
  </div>
);

export default ExperienceItem;
