import Rectangle27 from "../assets/Rectangle-27.png";

const InternHeroSection = ({ children }) => {
  return (
    <>
      <style>
        {`
          .hero-section {
            background-image: linear-gradient(rgba(59, 131, 246, 0.34), rgba(146, 51, 234, 0.36)), 
                              url('${Rectangle27}');
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
            color: white;
            padding: 8rem 0;
          }

          .hero-content {
            text-align: center;
            margin-bottom: 2rem;
          }

          .hero-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: var(--text-on-primary);
          }

          .hero-subtitle {
            font-size: 1.25rem;
            opacity: 0.9;
            color: var(--text-on-primary);
          }

          @media (max-width: 768px) {
            .hero-title {
              font-size: 2rem;
            }

            .hero-subtitle {
              font-size: 1.125rem;
            }
          }
        `}
      </style>
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Find Your Dream Internship</h1>
            <p className="hero-subtitle">
              Discover amazing internship opportunities across Nigeria
            </p>
          </div>
          {children}
        </div>
      </div>
    </>
  );
};

export default InternHeroSection;
