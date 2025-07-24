import { Button } from "./button.jsx";

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
            <Button label="Apply Now" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .internship-availability {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
          padding-top: 120px;
          padding-bottom: 100px;
        }

        .bg-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .shape-1 {
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 120px;
          height: 120px;
          background: linear-gradient(45deg, #f093fb, #f5576c);
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #4facfe, #00f2fe);
          bottom: 30%;
          left: 20%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, #a8edea, #fed6e3);
          top: 10%;
          right: 30%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .opportunity-card {
          max-width: 1000px;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 1;
        }

        .card-content {
          display: flex;
          min-height: 500px;
        }

        .image-section {
          flex: 1.2;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-wrapper {
          position: relative;
          padding: 5px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s ease;
          width: 100%;
          max-width: 320px;
        }

        .image-wrapper:hover {
          transform: translateY(-8px) scale(1.03);
        }

        .opportunity-image {
          width: 100%;
          height: 280px;
          object-fit: cover;
          border-radius: 15px;
        }

        .content-section {
          flex: 1.8;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .opportunity-title {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .opportunity-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #4a5568;
          margin-bottom: 30px;
          text-align: justify;
        }

        .apply-button {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
          max-width: fit-content;
        }

        .apply-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .arrow-icon {
          width: 20px;
          height: 20px;
          transition: transform 0.2s ease;
        }

        .apply-button:hover .arrow-icon {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .internship-availability {
            padding-top: 100px;
            padding-bottom: 70px;
          }

          .card-content {
            flex-direction: column;
            min-height: auto;
          }

          .image-section,
          .content-section {
            padding: 30px;
            margin-left: 1%;
          }

          .opportunity-title {
            font-size: 2rem;
            text-align: center;
          }

          .opportunity-description {
            font-size: 1rem;
            text-align: left;
          }

          .apply-button {
            width: 100%;
            justify-content: center;
            max-width: none;
          }
        }

        @media (max-width: 480px) {
          .opportunity-title {
            font-size: 1.8rem;
          }

          .image-section,
          .content-section {
            padding: 20px;
          }

          .opportunity-image {
            width: 100%;
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export default OpportunityCard;
