import "../style/skilltag.css";

// Reusable Skill Component
const SkillTag = ({ children, isAddButton = false }) => (
  <span className={`prof-skill-tag ${isAddButton ? "prof-add-skill" : ""}`}>
    {children}
  </span>
);

export default SkillTag;
