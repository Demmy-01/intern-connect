import { Button } from "./button.jsx";
import "../style/opportunity-card.css";
import { Link } from "react-router-dom";

const OpportunityCard = ({
  title = "Internship Opportunities",
  description = "Intern Connect connects ambitious students with a diverse array of internship opportunities. Organizations actively seeking interns can easily post listings, highlighting the specific skills and talents they require. Students can explore these listings, filtering by their specific fields of interest. By creating an account, students gain access to a streamlined application process where they can submit required documents directly to potential employers. This platform empowers students to kickstart their careers, gain valuable experience, and enhance their resumes. Join Intern Connect today and take the first step towards a successful professional journey!",
  image = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
}) => {
  return (
    <div className="internship-availability">
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
      </div>

      <div className="opportunity-card">
        <div className="card-content">
          {/* Image Section */}
          <div className="image-section">
            <div className="image-wrapper">
              <img src={image} alt={title} className="opportunity-image" />
            </div>
          </div>

          {/* Content Section */}
          <div className="content-section">
            <h1 className="opportunity-title">{title}</h1>
            <p className="opportunity-description">{description}</p>
            <Link to="/internships">
              <Button label="Apply Now" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
