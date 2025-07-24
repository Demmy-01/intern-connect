import "../style/footer.css";
import logo_blue from "../assets/logo_blue.png";
import { Link, useLocation } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-overlay"></div>
      <div className="container">
        <div className="footer-content">
          {/* Company Info Section */}
          <div className="section">
            <div className="logo-section">
              <div className="logo">
                <img
                  src={logo_blue}
                  alt="Intern Connect"
                  height={"25px"}
                  width={"25px"}
                />
              </div>
              <div>
                <h3 className="company-name h3">Intern Connect</h3>
                <p className="developer-credit text-base">
                  Developed by DANDEM Digitals
                </p>
              </div>
            </div>
            <p className="company-tagline text-base">
              Connecting talented interns with innovative companies. Your
              gateway to meaningful internship opportunities and career growth.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="section">
            <h4 className="section-title h4">Quick Links</h4>
            <ul className="link-list">
              <li className="link-item">
                <Link to="/" className="link">
                  Home Page
                </Link>
              </li>
              <li className="link-item">
                <Link to="/about" className="link">
                  About Us
                </Link>
              </li>
              <li className="link-item">
                <Link to="/create-cv" className="link">
                  Create CV
                </Link>
              </li>
              <li className="link-item">
                <Link to="/interview-prep" className="link">
                  Interview Prep
                </Link>
              </li>
              <li className="link-item">
                <Link to="/team" className="link">
                  Meet the team
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="section">
            <h4 className="section-title h4">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <div>
                    <a href="tel:+234 913 580 4702" className="link">
                      +234 913 580 4702
                    </a>
                  </div>
                  <div>
                    <a href="tel:+234 810 777 3828" className="link">
                      +234 810 777 3828
                    </a>
                  </div>
                  <div>
                    <a href="tel:+234 701 968 3215" className="link">
                      +234 701 968 3215
                    </a>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <a href="mailto:dandemdig@gmail.com" className="link">
                    dandemdig@gmail.com
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={20} />
                </div>
                <div>Lagos, Nigeria</div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="bottom-section">
          <p className="copyright">
            © {new Date().getFullYear()} Intern Connect. All rights reserved.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a
              href="https://www.linkedin.com/company/dandem-intern-connect/posts/?feedView=all"
              className="social-link"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
