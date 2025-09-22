import "../style/education.css";

// Reusable Education Component
const EducationItem = ({ institution, degree, duration, coursework }) => (
  <div className="prof-education-item">
    <div className="prof-education-header">
      <div className="prof-institution-logo">
        <span>🎓</span>
      </div>
      <div className="prof-education-content">
        <h3>{institution}</h3>
        <div className="prof-degree-name">{degree}</div>
        <div className="prof-duration">{duration}</div>
        <p className="prof-coursework">{coursework}</p>
      </div>
    </div>
  </div>
);

export default EducationItem;
