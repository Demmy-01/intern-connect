import { Button } from "../components/button";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../style/about.css";
import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import organization from "../assets/organization.png";
import students from "../assets/students.png";
import value from "../assets/value.png";
import application from "../assets/application.png";
import partner from "../assets/partner.png";

export function About() {
  // Handle fade-in animations on scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in-visible");
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

  return (
    <>
      <Navbar textColor="active" />
      <section className="section-1">
        <div className="content">
          <h1>About Intern Connect</h1>
          <p>
            We're dedicated to bridging the gap between ambitious students and
            innovative companies, creating pathways to successful careers.
          </p>
          <Link to="/team" className="cta-button">
            <Button label="Meet the team" className="explore-button" />
          </Link>
        </div>
      </section>

      <div className="section-2 fade-in">
        <div className="mission-container">
          <div className="mission-badge">Our Mission</div>
          <h1 className="mission-title">
            To Unlock Potential, One Internship at a Time
          </h1>
          <p className="mission-description">
            Our mission is to simplify the internship search process, making it
            accessible, efficient, and effective for students everywhere. We
            believe that the right internship can be a transformative
            experience, and we're committed to making those connections happen.
          </p>
        </div>
      </div>

      <div className="section-3 fade-in">
        <div className="animated-orb-1"></div>
        <div className="animated-orb-2"></div>
        <div className="animated-orb-3"></div>
        <div className="animated-orb-4"></div>
        <div className="animated-orb-5"></div>
        <div className="animated-orb-6"></div>
        <div className="animated-orb-7"></div>
        <div className="container">
          <div className="mission-badge">What we do</div>

          <div className="feature-card">
            <div className="card-content-1">
              <h3 className="card-title">Students</h3>
              <p className="card-description">
                We provide an extensive database of verified internship
                opportunities tailored to your field of study and career
                interests. With easy search and application features, finding
                the perfect internship has never been simpler.
              </p>
            </div>
            <div className="card-image">
              <img src={students} alt="Students" />
            </div>
          </div>

          <div className="feature-card reverse">
            <div className="card-image">
              <img src={organization} alt="Organizations" />
            </div>
            <div className="card-content-1">
              <h3 className="card-title">Organizations</h3>
              <p className="card-description">
                We help organizations streamline their recruitment process by
                offering a space to post openings and connect with qualified,
                motivated students. It's a win-win for businesses and interns
                alike.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-4 fade-in">
        <div className="bg-animation">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
          <div className="floating-circle circle-4"></div>
        </div>

        <div className="geometric-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="content-wrapper">
          <div className="header-section">
            <div className="mission-badge">Our Core Values</div>
            <p>The principles that guide our work and our community.</p>
          </div>

          <div className="values-grid">
            <div className="value-card mission-card">
              <div className="icon-container">
                <div className="icon-wrapper mission-icon">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <div className="ping-effect"></div>
              </div>
              <h3>Our Mission</h3>
              <p>
                To create a seamless, transparent, and impactful internship
                ecosystem that connects talented students with employers and
                empowers organizations with fresh, dynamic talent.
              </p>
              <div className="accent-line"></div>
            </div>

            <div className="value-card vision-card">
              <div className="icon-container">
                <div className="icon-wrapper vision-icon">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </div>
                <div className="ping-effect"></div>
              </div>
              <h3>Our Vision</h3>
              <p>
                To be the leading platform for fostering meaningful connections
                between students and organizations, strengthening the global
                workforce, and driving innovation across industries.
              </p>
              <div className="accent-line"></div>
            </div>
            <div className="value-card values-card">
              <div className="icon-container">
                <div className="icon-wrapper values-icon">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ping-effect"></div>
              </div>
              <h3>Our Values</h3>
              <p>
                At Intern Connect, we value empowerment, connection, innovation,
                excellence, and integrity. We foster meaningful relationships
                between talents and organizations, making internships seamless,
                impactful, and accessible for everyone.
              </p>
              <div className="accent-line"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-5 fade-in">
        <div className="section-5-bg-animation">
          <div className="section-5-floating-circle section-5-circle-1"></div>
          <div className="section-5-floating-circle section-5-circle-2"></div>
          <div className="section-5-floating-circle section-5-circle-3"></div>
          <div className="section-5-floating-circle section-5-circle-4"></div>
        </div>

        <div className="section-5-geometric-shapes">
          <div className="section-5-shape section-5-shape-1"></div>
          <div className="section-5-shape section-5-shape-2"></div>
          <div className="section-5-shape section-5-shape-3"></div>
          <div className="section-5-shape section-5-shape-4"></div>
        </div>

        <div className="section-5-content-wrapper">
          <div className="section-5-header">
            <div className="mission-badge">CONNECTING INTERNS</div>
            <h2>Discover opportunities that match your skills</h2>
          </div>

          <div className="section-5-grid">
            <Link to="/internship-opportunities" className="section-5-link">
              <div className="section-5-card section-5-card-1">
                <div className="section-5-image-container">
                  <img src={value} alt="" className="section-5-image" />
                  <div className="section-5-overlay"></div>
                  <div className="section-5-hover-effect"></div>
                </div>
                <div className="section-5-content">
                  <div className="section-5-title-container">
                    <h3>Internship Opportunities</h3>
                    <div className="section-5-arrow">→</div>
                  </div>
                  <p>
                    Discover a wide range of internship opportunities tailored
                    for students.
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/seamless-application" className="section-5-link">
              <div className="section-5-card section-5-card-2">
                <div className="section-5-image-container">
                  <img src={application} alt="" className="section-5-image" />
                  <div className="section-5-overlay"></div>
                  <div className="section-5-hover-effect"></div>
                </div>
                <div className="section-5-content">
                  <div className="section-5-title-container">
                    <h3>Seamless application process</h3>
                    <div className="section-5-arrow">→</div>
                  </div>
                  <p>
                    Simplify your internship applications with our user-friendly
                    platform.
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/tailored-internships" className="section-5-link">
              <div className="section-5-card section-5-card-3">
                <div className="section-5-image-container">
                  <img src={partner} alt="" className="section-5-image" />
                  <div className="section-5-overlay"></div>
                  <div className="section-5-hover-effect"></div>
                </div>
                <div className="section-5-content">
                  <div className="section-5-title-container">
                    <h3>Tailored Internship Matches</h3>
                    <div className="section-5-arrow">→</div>
                  </div>
                  <p>
                    Find the perfect internship that aligns with your career
                    goals.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="join-us fade-in">
        <div className="join-us-bg-animation">
          <div className="join-us-floating-circle join-us-circle-1"></div>
          <div className="join-us-floating-circle join-us-circle-2"></div>
          <div className="join-us-floating-circle join-us-circle-3"></div>
          <div className="join-us-floating-circle join-us-circle-4"></div>
          <div className="join-us-floating-circle join-us-circle-5"></div>
        </div>

        <div className="join-us-geometric-shapes">
          <div className="join-us-shape join-us-shape-1"></div>
          <div className="join-us-shape join-us-shape-2"></div>
          <div className="join-us-shape join-us-shape-3"></div>
          <div className="join-us-shape join-us-shape-4"></div>
          <div className="join-us-shape join-us-shape-5"></div>
          <div className="join-us-shape join-us-shape-6"></div>
        </div>

        <div className="join-us-particles">
          <div className="join-us-particle join-us-particle-1"></div>
          <div className="join-us-particle join-us-particle-2"></div>
          <div className="join-us-particle join-us-particle-3"></div>
          <div className="join-us-particle join-us-particle-4"></div>
          <div className="join-us-particle join-us-particle-5"></div>
          <div className="join-us-particle join-us-particle-6"></div>
          <div className="join-us-particle join-us-particle-7"></div>
          <div className="join-us-particle join-us-particle-8"></div>
        </div>

        <div className="join-us-content-wrapper">
          <div className="join-us-content">
            <h2>Join Us</h2>
            <p>
              Become a part of the Intern Connect community and take the next
              step in your career or recruitment journey. Together, let's build
              a stronger, more connected future.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
