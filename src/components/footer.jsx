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
    <footer className="footer-ft">
      <div className="footer-overlay-ft"></div>
      <div className="container-ft">
        <div className="footer-content-ft">
          {/* Company Info Section */}
          <div className="section-ft">
            <div className="logo-section-ft">
              <div className="logo-ft">
                <img
                  src={logo_blue}
                  alt="Intern Connect"
                  height={"25px"}
                  width={"25px"}
                />
              </div>
              <div>
                <h3 className="company-name-ft h3">Intern Connect</h3>
                <p className="developer-credit-ft text-base">
                  Developed by DANDEM Digitals
                </p>
              </div>
            </div>
            <p className="company-tagline-ft text-base">
              Connecting talented interns with innovative companies. Your
              gateway to meaningful internship opportunities and career growth.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="section-ft">
            <h4 className="section-title-ft h4">Quick Links</h4>
            <ul className="link-list-ft">
              <li className="link-item-ft">
                <Link to="/" className="link-ft">
                  Home Page
                </Link>
              </li>
              <li className="link-item-ft">
                <Link to="/about" className="link-ft">
                  About Us
                </Link>
              </li>
              <li className="link-item-ft">
                <Link to="/team" className="link-ft">
                  Meet the team
                </Link>
              </li>
              <li className="link-item-ft">
                <Link to="/dashboard" className="link-ft">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="section-ft">
            <h4 className="section-title-ft h4">Contact Us</h4>
            <div className="contact-info-ft">
              <div className="contact-item-ft">
                <div className="contact-icon-ft">
                  <Phone size={20} />
                </div>
                <div>
                  <div>
                    <a href="tel:+234 913 580 4702" className="link-ft">
                      +234 913 580 4702
                    </a>
                  </div>
                  <div>
                    <a href="tel:+234 810 777 3828" className="link-ft">
                      +234 810 777 3828
                    </a>
                  </div>
                  <div>
                    <a href="tel:+234 701 968 3215" className="link-ft">
                      +234 701 968 3215
                    </a>
                  </div>
                </div>
              </div>
              <div className="contact-item-ft">
                <div className="contact-icon-ft">
                  <Mail size={20} />
                </div>
                <div>
                  <a href="mailto:dandemdig@gmail.com" className="link-ft">
                    dandemdig@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider-ft"></div>

        <div className="bottom-section-ft">
          <p className="copyright-ft">
            © {new Date().getFullYear()} Intern Connect. All rights reserved.
          </p>
          <div className="social-links-ft">
            <a
              href="#"
              className="social-link-ft"
              aria-label="Facebook"
              target="_blank"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="social-link-ft"
              aria-label="Twitter"
              target="_blank"
            >
              <Twitter size={18} />
            </a>
            <a
              href="https://www.linkedin.com/company/dandem-intern-connect/posts/?feedView=all"
              className="social-link-ft"
              aria-label="LinkedIn"
              target="_blank"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="https://www.instagram.com/intern_connects?igsh=MW0yY3pvajczOHBvYQ=="
              className="social-link-ft"
              aria-label="Instagram"
              target="_blank"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;2