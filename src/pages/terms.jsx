import { Button } from "../components/button";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import "../style/terms.css";

export default function Terms() {
  return (
    <>
      <Navbar textColor="active" />
      <section className="terms-section-1">
        <div className="terms-content">
          <h1>Terms & Conditions</h1>
        </div>
      </section>

      <section className="terms-body">
        <div className="terms-container">
          {/* General Terms */}
          <div className="terms-section">
            <h2>1. General Terms (Applies to All Users)</h2>
            <div className="terms-item">
              <p>
                <strong>1.1</strong> By creating an account, you confirm that
                the information provided is accurate and truthful.
              </p>
            </div>
            <div className="terms-item">
              <p>
                <strong>1.2</strong> You agree not to use InternConnect for
                fraudulent, misleading, or harmful purposes.
              </p>
            </div>
            <div className="terms-item">
              <p>
                <strong>1.3</strong> You must not impersonate another person,
                company, or misrepresent your affiliation.
              </p>
            </div>
            <div className="terms-item">
              <p>
                <strong>1.4</strong> InternConnect reserves the right to suspend
                or terminate accounts that violate these terms.
              </p>
            </div>
            <div className="terms-item">
              <p>
                <strong>1.5</strong> InternConnect provides a platform for
                connection but is not responsible for the direct relationship,
                payment, or disputes between students and organizations.
              </p>
            </div>
          </div>

          {/* For Students */}
          <div className="terms-section">
            <h2>2. For Students</h2>

            <h3>2.1 Eligibility</h3>
            <ul>
              <li>
                You must be a student, recent graduate, or seeking internship
                opportunities.
              </li>
              <li>
                You agree to provide accurate academic and personal details in
                your profile.
              </li>
            </ul>

            <h3>2.2 Application Process</h3>
            <ul>
              <li>
                You may apply only to opportunities you genuinely qualify for.
              </li>
              <li>
                You must not submit false, plagiarized, or misleading
                CVs/documents.
              </li>
            </ul>

            <h3>2.3 Responsibilities</h3>
            <ul>
              <li>
                Maintain professionalism during applications and interviews.
              </li>
              <li>Respect confidentiality of organizations' information.</li>
              <li>
                If selected, commit to agreed internship terms (duration,
                responsibilities, working hours).
              </li>
            </ul>

            <h3>2.4 Prohibited Activities</h3>
            <ul>
              <li>
                Misuse of the platform to spam, harass, or defraud
                organizations.
              </li>
              <li>Sharing accounts or applying on behalf of someone else.</li>
            </ul>

            <h3>2.5 Disclaimer</h3>
            <ul>
              <li>InternConnect does not guarantee internship placement.</li>
              <li>
                Any stipend, allowance, or benefits are solely the
                organization's responsibility.
              </li>
            </ul>
          </div>

          {/* For Organization */}
          <div className="terms-section">
            <h2>3. For Organization</h2>

            <h3>3.1 Eligibility</h3>
            <ul>
              <li>
                You must be a legally registered company, business, or
                recognized institution.
              </li>
              <li>
                You agree to provide accurate company details during
                registration.
              </li>
            </ul>

            <h3>3.2 Internship Postings</h3>
            <ul>
              <li>
                All listings must be genuine and accurately describe the role,
                duration, and requirements.
              </li>
              <li>
                Stipend or compensation (if applicable) must be clearly stated.
              </li>
              <li>
                You must not post misleading or exploitative opportunities.
              </li>
            </ul>

            <h3>3.3 Responsibilities</h3>
            <ul>
              <li>
                Provide a safe and supportive learning environment for interns.
              </li>
              <li>
                Abide by fair labor and internship practices (reasonable hours,
                no discrimination, etc.).
              </li>
              <li>Respect interns' rights and confidentiality.</li>
            </ul>

            <h3>3.4 Verification</h3>
            <ul>
              <li>
                Organizations may be required to provide proof of registration,
                official email verification, or supporting documents.
              </li>
              <li>
                Verified organizations will receive a "Verified" badge on
                InternConnect.
              </li>
            </ul>

            <h3>3.5 Prohibited Activities</h3>
            <ul>
              <li>
                Posting fake, or misleading "roles disguised as internships.
              </li>
              <li>
                Using InternConnect to recruit for unrelated or harmful
                purposes.
              </li>
            </ul>

            <h3>3.6 Disclaimer</h3>
            <ul>
              <li>
                InternConnect is not liable for the performance, behavior, or
                contractual agreements between organizations and interns.
              </li>
            </ul>
          </div>

          {/* Privacy & Data */}
          <div className="terms-section">
            <h2>4. Privacy & Data</h2>
            <div className="terms-item">
              <p>
                <strong>4.1</strong> InternConnect respects your privacy and
                handles your data according to our Privacy Policy.
              </p>
            </div>
            <div className="terms-item">
              <p>
                <strong>4.2</strong> Users consent to their information being
                shared between students and organizations solely for internship
                purposes.
              </p>
            </div>
            <div className="terms-item">
              <p>
                <strong>4.3</strong> InternConnect will not sell or misuse your
                data.
              </p>
            </div>
          </div>

          {/* Account Suspension */}
          <div className="terms-section">
            <h2>5. Account Suspension & Termination</h2>
            <h3>5.1 InternConnect may suspend or terminate accounts that:</h3>
            <ul>
              <li>Provide false information</li>
              <li>Engage in fraud, harassment, or exploitation</li>
              <li>Misuse the platform against its intended purpose</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className="terms-section">
            <h2>6. Limitation of Liability</h2>
            <ul>
              <li>InternConnect acts only as a connecting platform.</li>
              <li>
                <strong>We are not responsible for:</strong>
              </li>
              <li>
                The accuracy of information provided by students or
                organizations
              </li>
              <li>
                Internship outcomes (selection, rejection, stipends, disputes)
              </li>
              <li>
                Any losses, damages, or claims arising from use of the platform
              </li>
            </ul>
          </div>

          {/* Accept Button */}
          {/* <div className="terms-accept">
            <Button className="accept-button">Accept Terms & Conditions</Button>
          </div> */}
        </div>
      </section>

      <Footer />
    </>
  );
}
