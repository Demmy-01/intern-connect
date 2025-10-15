import { GraduationCap } from "lucide-react";
import "../style/education.css";

const EducationItem = ({ institution, degree, duration, coursework }) => (
  <div className="prof-education-item">
    <div className="prof-education-header">
      <div className="prof-institution-logo">
        <GraduationCap className="h-4.5 w-4.5" />
      </div>
      <div className="prof-education-content">
        <h3>{institution}</h3>
        <div className="prof-degree-name">{degree}</div>
        <div className="prof-duration">{duration}</div>
      </div>
    </div>
    <div className="prof-education-divider">
      <div className="prof-education-divider-line"></div>
    </div>
    <p className="prof-coursework">{coursework}</p>
  </div>
);

export default EducationItem;