import { Button } from "../components/button";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../style/about.css";
import { Link } from "react-router-dom";
import organization from "../assets/organization.png";
import students from "../assets/students.png";
import value from "../assets/value.png";
import application from "../assets/application.png";
import partner from "../assets/partner.png";

export function About() {
  return (
    <>
      <Navbar />
      <section class="section-1">
        <div class="content">
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

      <div class="section-2">
        <div class="mission-container">
          <div class="mission-badge">Our Mission</div>
          <h1 class="mission-title">
            To Unlock Potential, One Internship at a Time
          </h1>
          <p class="mission-description">
            Our mission is to simplify the internship search process, making it
            accessible, efficient, and effective for students everywhere. We
            believe that the right internship can be a transformative
            experience, and we're committed to making those connections happen.
          </p>
        </div>
      </div>

      <div class="section-3">
        <div class="animated-orb-1"></div>
        <div class="animated-orb-2"></div>
        <div class="animated-orb-3"></div>
        <div class="animated-orb-4"></div>
        <div class="animated-orb-5"></div>
        <div class="animated-orb-6"></div>
        <div class="animated-orb-7"></div>
        <div class="container">
          <div class="mission-badge">What we do</div>

          <div class="feature-card">
            <div class="card-content-1">
              <h3 class="card-title">Students</h3>
              <p class="card-description">
                We provide an extensive database of verified internship
                opportunities tailored to your field of study and career
                interests. With easy search and application features, finding
                the perfect internship has never been simpler.
              </p>
            </div>
            <div class="card-image">
              <img src={students} alt="Students" />
            </div>
          </div>

          <div class="feature-card reverse">
            <div class="card-image">
              <img src={organization} alt="Organizations" />
            </div>
            <div class="card-content-1">
              <h3 class="card-title">Organizations</h3>
              <p class="card-description">
                We help organizations streamline their recruitment process by
                offering a space to post openings and connect with qualified,
                motivated students. It's a win-win for businesses and interns
                alike.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section class="section-4">
        <div class="bg-animation">
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
          <div class="floating-circle circle-3"></div>
          <div class="floating-circle circle-4"></div>
        </div>

        <div class="geometric-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>

        <div class="content-wrapper">
          <div class="header-section">
            <div class="mission-badge">Our Core Values</div>
            <p>The principles that guide our work and our community.</p>
          </div>

          <div class="values-grid">
            <div class="value-card mission-card">
              <div class="icon-container">
                <div class="icon-wrapper mission-icon">
                  <svg
                    class="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <div class="ping-effect"></div>
              </div>
              <h3>Our Mission</h3>
              <p>
                To create a seamless, transparent, and impactful internship
                ecosystem that connects talented students with employers and
                empowers organizations with fresh, dynamic talent.
              </p>
              <div class="accent-line"></div>
            </div>

            <div class="value-card vision-card">
              <div class="icon-container">
                <div class="icon-wrapper vision-icon">
                  <svg
                    class="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                </div>
                <div class="ping-effect"></div>
              </div>
              <h3>Our Vision</h3>
              <p>
                To be the leading platform for fostering meaningful connections
                between students and organizations, strengthening the global
                workforce, and driving innovation across industries.
              </p>
              <div class="accent-line"></div>
            </div>
            <div class="value-card values-card">
              <div class="icon-container">
                <div class="icon-wrapper values-icon">
                  <svg
                    class="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <div class="ping-effect"></div>
              </div>
              <h3>Our Values</h3>
              <p>
                At Intern Connect, we value empowerment, connection, innovation,
                excellence, and integrity. We foster meaningful relationships
                between talents and organizations, making internships seamless,
                impactful, and accessible for everyone.
              </p>
              <div class="accent-line"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-5">
        <div class="section-5-bg-animation">
          <div class="section-5-floating-circle section-5-circle-1"></div>
          <div class="section-5-floating-circle section-5-circle-2"></div>
          <div class="section-5-floating-circle section-5-circle-3"></div>
          <div class="section-5-floating-circle section-5-circle-4"></div>
        </div>

        <div class="section-5-geometric-shapes">
          <div class="section-5-shape section-5-shape-1"></div>
          <div class="section-5-shape section-5-shape-2"></div>
          <div class="section-5-shape section-5-shape-3"></div>
          <div class="section-5-shape section-5-shape-4"></div>
        </div>

        <div class="section-5-content-wrapper">
          <div class="section-5-header">
            <div class="mission-badge">CONNECTING INTERNS</div>
            <h2>Discover opportunities that match your skills</h2>
          </div>

          <div class="section-5-grid">
            <Link to="/internship-opportunities" className="section-5-link">
              <div class="section-5-card section-5-card-1">
                <div class="section-5-image-container">
                  <img src={value} alt="" class="section-5-image" />
                  <div class="section-5-overlay"></div>
                  <div class="section-5-hover-effect"></div>
                </div>
                <div class="section-5-content">
                  <div class="section-5-title-container">
                    <h3>Internship Opportunities</h3>
                    <div class="section-5-arrow">→</div>
                  </div>
                  <p>
                    Discover a wide range of internship opportunities tailored
                    for students.
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/seamless-application" className="section-5-link">
              <div class="section-5-card section-5-card-2">
                <div class="section-5-image-container">
                  <img src={application} alt="" class="section-5-image" />
                  <div class="section-5-overlay"></div>
                  <div class="section-5-hover-effect"></div>
                </div>
                <div class="section-5-content">
                  <div class="section-5-title-container">
                    <h3>Seamless application process</h3>
                    <div class="section-5-arrow">→</div>
                  </div>
                  <p>
                    Simplify your internship applications with our user-friendly
                    platform.
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/tailored-internships" className="section-5-link">
              <div class="section-5-card section-5-card-3">
                <div class="section-5-image-container">
                  <img src={partner} alt="" class="section-5-image" />
                  <div class="section-5-overlay"></div>
                  <div class="section-5-hover-effect"></div>
                </div>
                <div class="section-5-content">
                  <div class="section-5-title-container">
                    <h3>Tailored Internship Matches</h3>
                    <div class="section-5-arrow">→</div>
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

      <section class="join-us">
        <div class="join-us-bg-animation">
          <div class="join-us-floating-circle join-us-circle-1"></div>
          <div class="join-us-floating-circle join-us-circle-2"></div>
          <div class="join-us-floating-circle join-us-circle-3"></div>
          <div class="join-us-floating-circle join-us-circle-4"></div>
          <div class="join-us-floating-circle join-us-circle-5"></div>
        </div>

        <div class="join-us-geometric-shapes">
          <div class="join-us-shape join-us-shape-1"></div>
          <div class="join-us-shape join-us-shape-2"></div>
          <div class="join-us-shape join-us-shape-3"></div>
          <div class="join-us-shape join-us-shape-4"></div>
          <div class="join-us-shape join-us-shape-5"></div>
          <div class="join-us-shape join-us-shape-6"></div>
        </div>

        <div class="join-us-particles">
          <div class="join-us-particle join-us-particle-1"></div>
          <div class="join-us-particle join-us-particle-2"></div>
          <div class="join-us-particle join-us-particle-3"></div>
          <div class="join-us-particle join-us-particle-4"></div>
          <div class="join-us-particle join-us-particle-5"></div>
          <div class="join-us-particle join-us-particle-6"></div>
          <div class="join-us-particle join-us-particle-7"></div>
          <div class="join-us-particle join-us-particle-8"></div>
        </div>

        <div class="join-us-content-wrapper">
          <div class="join-us-content">
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
