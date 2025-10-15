import { Briefcase } from "lucide-react";
import "../style/experience.css";

const ExperienceItem = ({ title, company, duration, description }) => (
  <div className="prof-experience-item">
    <div className="prof-experience-header">
      <div className="prof-company-logo">
        <Briefcase className="h-4.5 w-4.5" />
      </div>
      <div className="prof-experience-content">
        <h3>{title}</h3>
        <div className="prof-company-name">{company}</div>
        <div className="prof-duration">{duration}</div>
      </div>
    </div>
    <div className="prof-experience-divider">
      <div className="prof-experience-divider-line"></div>
    </div>
    <p className="prof-description">{description}</p>
  </div>
);

export default ExperienceItem;