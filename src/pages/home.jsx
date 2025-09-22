import Navbar from "../components/navbar";
import "../style/home.css";
import PageTransition from "../components/PageTransition";
import {
  Search,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle,
  Users,
  Mail,
  Phone,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "../components/button.jsx";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroBackground from "../assets/Rectangle-27.png";
import Footer from "../components/footer.jsx";

export default function Home() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    message: "",
  });

  // Enhanced fade-in animations on scroll with staggered delays
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Add staggered delay for multiple elements in the same section
          setTimeout(() => {
            entry.target.classList.add("fade-in-visible");
          }, index * 100);
        }
      });
    }, observerOptions);

    // Observe all fade-in elements
    const fadeElements = document.querySelectorAll(".fade-in");
    fadeElements.forEach((el) => observer.observe(el));

    return () => {
      fadeElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Smooth scroll effect for better UX
  useEffect(() => {
    const smoothScrollElements = document.querySelectorAll('a[href^="#"]');

    smoothScrollElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = element.getAttribute("href");
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      });
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);

    // Show success message (you can implement a toast notification here)
    alert("Thank you for your message! We'll get back to you soon.");

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      message: "",
    });
  };

  const handleExploreClick = () => {
    // You can navigate to internships page or implement search functionality
    navigate("/internships");
  };

  return (
    <PageTransition>
      <Navbar />

      {/* Hero Section */}
      <div className="hero-container">
        {/* Background Image */}
        <div className="background-image-container">
          <img
            src={heroBackground}
            alt="Professional background"
            className="background-image"
          />
          <div className="background-overlay"></div>
        </div>

        {/* Content Container */}
        <div className="content-container">
          {/* Hero Text */}
          <div className="hero-text fade-in">
            <h1 className="hero-title">Find your next internship faster.</h1>
            <p className="hero-subtitle">
              Discover thousands of opportunities and use our AI tools to land
              your dream role.
            </p>
          </div>

          {/* Search Form */}
          <div className="hero-search fade-in">
            <div className="search-grid search-form">
              {/* Role or Keyword Input */}
              <div className="input-group">
                <Search className="input-icon" />
                <input
                  type="text"
                  placeholder="Role or Keyword"
                  className="form-input"
                  aria-label="Search for internship role or keyword"
                />
              </div>

              {/* Location Input */}
              <div className="input-group">
                <MapPin className="input-icon" />
                <input
                  type="text"
                  placeholder="Location"
                  className="form-input"
                  aria-label="Internship location"
                />
              </div>

              {/* Type Dropdown */}
              <div className="input-group">
                <Briefcase className="input-icon" />
                <select className="form-select" aria-label="Internship type">
                  <option value="" disabled defaultValue="">
                    Type
                  </option>
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
                <select
                  className="form-select"
                  aria-label="Internship duration"
                >
                  <option value="" disabled defaultValue="">
                    Duration
                  </option>
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

            <div className="button-container">
              <Button
                label="Explore Internships"
                className="explore-button"
                onClick={handleExploreClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Why Internship is Important Section */}
      <section className="why-internship-section" id="why-internship">
        <div className="section-container">
          <div className="section-header fade-in">
            <h2 className="section-title-1">Why Internships are Important</h2>
            <p className="section-subtitle">
              Internships are the bridge between academic learning and
              professional success, providing invaluable real-world experience.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card fade-in">
              <div className="benefit-icon">
                <CheckCircle className="icon" />
              </div>
              <h3 className="benefit-title">Practical Experience</h3>
              <p className="benefit-description">
                Internships bridge the gap between classroom learning and
                real-world practice. They allow students and young professionals
                to apply theoretical knowledge to real projects, gain hands-on
                skills, and understand how industries actually operate.
              </p>
            </div>

            <div className="benefit-card fade-in">
              <div className="benefit-icon">
                <Search className="icon" />
              </div>
              <h3 className="benefit-title">Career Exploration</h3>
              <p className="benefit-description">
                An internship is an opportunity to explore different career
                paths without long-term commitment. It helps individuals
                discover their interests, strengths, and areas for growth,
                guiding them toward the right career choice.
              </p>
            </div>

            <div className="benefit-card fade-in">
              <div className="benefit-icon">
                <Users className="icon" />
              </div>
              <h3 className="benefit-title">Networking Opportunities</h3>
              <p className="benefit-description">
                Internships provide direct access to professionals, mentors, and
                peers in the industry. Building these relationships can open
                doors to future job opportunities, collaborations, and valuable
                guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Apply Section */}
      <section className="who-can-apply-section" id="who-can-apply">
        <div className="section-container">
          <div className="who-apply-content">
            <div className="who-apply-text fade-in">
              <h2 className="section-title-1">Who Can Apply</h2>
              <p className="who-apply-description">
                We welcome applications from enthusiastic undergraduate students
                who are eager to learn, grow, and gain hands-on industry
                experience. This program is specially tailored for
                undergraduates looking to bridge the gap between classroom
                knowledge and real-world practice.
              </p>
              <div className="requirements-list">
                <div className="requirement-item">
                  <CheckCircle className="requirement-icon" />
                  <span>Current undergraduate students</span>
                </div>
                <div className="requirement-item">
                  <CheckCircle className="requirement-icon" />
                  <span>Eager to learn and grow professionally</span>
                </div>
                <div className="requirement-item">
                  <CheckCircle className="requirement-icon" />
                  <span>Ready for hands-on industry experience</span>
                </div>
                <div className="requirement-item">
                  <CheckCircle className="requirement-icon" />
                  <span>Committed to bridging theory and practice</span>
                </div>
              </div>
            </div>
            <div className="who-apply-visual fade-in">
              <div className="students-illustration">
                <Users className="large-icon" />
                <div className="illustration-text">
                  <h3>Join Our Community</h3>
                  <p>Connect with ambitious students nationwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="how-to-apply-section" id="how-to-apply">
        <div className="section-container">
          <div className="section-header fade-in">
            <h2 className="section-title-1">How to Apply</h2>
            <p className="section-subtitle">
              Getting started is simple. Follow these easy steps to begin your
              internship journey and unlock your potential.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card fade-in">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Create Your Account</h3>
                <p className="step-description">
                  Create an account with your Gmail to get started and access
                  our comprehensive platform with all available opportunities.
                </p>
              </div>
            </div>

            <div className="step-card fade-in">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Access Your Dashboard</h3>
                <p className="step-description">
                  Navigate to your personalized dashboard and explore available
                  internship opportunities tailored to your profile.
                </p>
              </div>
            </div>

            <div className="step-card fade-in">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Search & Discover</h3>
                <p className="step-description">
                  Use our advanced search filters to find internships in your
                  field of interest and discover the perfect match for your
                  skills.
                </p>
              </div>
            </div>

            <div className="step-card fade-in">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Apply & Track</h3>
                <p className="step-description">
                  Submit your applications with ease and track your progress
                  through our notification system and application dashboard.
                </p>
              </div>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3 className="step-title">Contact Organization</h3>
                <p className="step-description">
                  Submit your applications with ease and track your progress
                  through our notification system and application dashboard.
                </p>
              </div>
            </div>
            <div className="step-card fade-in">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3 className="step-title">Contact Organization</h3>
                <p className="step-description">
                  Submit your applications with ease and track your progress
                  through our notification system and application dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="contact-section" id="contact">
        <div className="section-container">
          <div className="section-header fade-in">
            <h2 className="section-title-1">Contact Us</h2>
            <p className="section-subtitle">
              Get in touch with our team for personalized assistance and support
              on your internship journey.
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-form-container fade-in">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="contact-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="contact-input"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="contact-input"
                    placeholder="+234 123 456 7890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="contact-textarea"
                    placeholder="How can we help you? Tell us about your internship goals..."
                    rows="4"
                    required
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  label={
                    <span className="button-content">
                      <Send className="button-icon" />
                      Send Message
                    </span>
                  }
                  className="contact-submit-btn"
                />
              </form>
            </div>

            <div className="contact-info fade-in">
              <div className="contact-info-card">
                <h3 className="contact-info-title">Get in Touch</h3>

                <div className="contact-detail">
                  <Mail className="contact-icon" />
                  <div className="contact-text">
                    <h4>Email Address</h4>
                    <p>info@internshipplatform.com</p>
                  </div>
                </div>

                <div className="contact-detail">
                  <Phone className="contact-icon" />
                  <div className="contact-text">
                    <h4>Phone Number</h4>
                    <p>+234 123 456 7890</p>
                  </div>
                </div>

                <div className="contact-detail">
                  <Clock className="contact-icon" />
                  <div className="contact-text">
                    <h4>Business Hours</h4>
                    <p>
                      Monday - Friday: 8:00 AM - 6:00 PM
                      <br />
                      Saturday: 10:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </PageTransition>
  );
}
