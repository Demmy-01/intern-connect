import Navbar from "../components/navbar";
import "../style/home.css";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  X,
  Info,
  Lightbulb,
  Mouse,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../components/button.jsx";
import React, { useState } from "react";
import Rectangle27 from "../assets/Rectangle-27.png";
import ShinyText from "../components/ShinyText.jsx";
import JobCard from "../components/job-listing.jsx";
import SplitText from "../components/SplitText.jsx";
import Footer from "../components/footer.jsx";
import logo_blue from "../assets/logo_blue.png";

export function Home() {
  const [showTips, setShowTips] = useState(false);

  // Handle tips button position
  React.useEffect(() => {
    const jobListingSection = document.querySelector(".job-listing");
    const tipsButton = document.querySelector(".tips-toggle");

    const updateTipsPosition = () => {
      if (jobListingSection && tipsButton) {
        const rect = jobListingSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          const scrollPosition = window.scrollY;
          const sectionTop = jobListingSection.offsetTop;
          const sectionBottom = sectionTop + jobListingSection.offsetHeight;

          if (
            scrollPosition >= sectionTop &&
            scrollPosition <= sectionBottom - tipsButton.offsetHeight
          ) {
            tipsButton.style.position = "fixed";
            tipsButton.style.top = "50%";
          } else {
            tipsButton.style.position = "absolute";
            tipsButton.style.top = "20px";
          }
        }
      }
    };

    window.addEventListener("scroll", updateTipsPosition);
    updateTipsPosition(); // Initial position

    return () => window.removeEventListener("scroll", updateTipsPosition);
  }, []);

  const toggleTips = () => {
    setShowTips(!showTips);
  };

  return (
    <>
      <Navbar />
      <div className="hero-container">
        {/* Background Image */}
        <div className="background-image-container">
          <img
            src={Rectangle27}
            alt="Background"
            className="background-image"
          />
          <div className="background-overlay"></div>
        </div>

        {/* Content Container */}
        <div className="content-container">
          {/* Hero Text */}
          <div className="hero-text">
            <h1 className="hero-title">Find your next internship faster.</h1>
            <ShinyText
              text="Discover thousands of opportunities and use our AI tools to land your dream role."
              disabled={false}
              speed={3}
              className="hero-subtitle"
            />
          </div>

          {/* Search Form */}
          <div className="search-form">
            <div className="search-grid">
              {/* Role or Keyword Input */}
              <div className="input-group">
                <Search className="input-icon" />
                <input
                  type="text"
                  placeholder="Role or Keyword"
                  className="form-input"
                />
              </div>

              {/* Location Input */}
              <div className="input-group">
                <MapPin className="input-icon" />
                <input
                  type="text"
                  placeholder="Location"
                  className="form-input"
                />
              </div>

              {/* Type Dropdown */}
              <div className="input-group">
                <Briefcase className="input-icon" />
                <select className="form-select">
                  <option value="">Type</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <div className="select-arrow">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Duration Dropdown */}
              <div className="input-group">
                <Calendar className="input-icon" />
                <select className="form-select">
                  <option value="">Duration</option>
                  <option value="3-months">3 months</option>
                  <option value="6-months">6 months</option>
                  <option value="12-months">12 months</option>
                </select>
                <div className="select-arrow">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="button-container">
            <Button label="Explore Internship" className="explore-button" />
          </div>
        </div>
      </div>

      <div className="job-listing">
        <div className="job-cards">
          <h2 className="job-listing-title">
            <div className="mission-badge">Available Internship</div>
          </h2>
          <div className="job-listing-grid">
            <JobCard
              logo={logo_blue}
              jobTitle="Software Engineer"
              company="FSDH Merchant Bank"
              location="Akure, Nigeria"
              duration="6 months"
              timePosted="6 days"
              tags={["Paid"]}
            />
            <JobCard
              jobTitle="Frontend Developer"
              company="TechStart Nigeria"
              location="Remote"
              duration="3 months"
              timePosted="2 days"
              tags={["Paid"]}
            />
            <JobCard
              jobTitle="Data Analyst"
              company="FinTech Co."
              location="Lagos, Nigeria"
              duration="6 months"
              timePosted="1 week"
              tags={["Paid"]}
            />
            <JobCard
              jobTitle="UI/UX Design Intern"
              company="Creative Studios"
              location="Abuja, Nigeria"
              duration="3 months"
              timePosted="3 days"
              tags={["Paid"]}
            />
          </div>
        </div>

        <button className="tips-toggle" onClick={toggleTips}>
          <Info size={20} />
          Tips
        </button>

        <div className={`job-tips ${showTips ? "show" : ""}`}>
          <div className="tips-header">
            <h3>How it works</h3>
            <button className="close-tips" onClick={toggleTips}>
              <X size={24} />
            </button>
          </div>

          <div className="job-tips-content">
            <div className="tip-card">
              <div className="tip-icon">
                <Search />
              </div>
              <div className="tip-content">
                <h4>Search & Discover</h4>
                <p>Find internships that match your skills and interests.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">
                <Mouse />
              </div>
              <div className="tip-content">
                <h4>Apply with Ease</h4>
                <p>Use our AI tools to craft the perfect application.</p>
              </div>
            </div>

            <div className="tip-card">
              <div className="tip-icon">
                <CheckCircle2 />
              </div>
              <div className="tip-content">
                <h4>Get Hired</h4>
                <p>Land your dream internship and kickstart your career.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <Footer />
      </footer>
    </>
  );
}
