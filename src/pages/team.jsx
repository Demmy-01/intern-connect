import "../style/team.css";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";
import daniel from "../assets/daniel.png";
import demmy from "../assets/demmy.jpg";
import david from "../assets/david.jpg";
import faith from "../assets/faith.jpg";
import boma from "../assets/boma.jpg";
import jade from "../assets/jade.jpg";
import feranmi from "../assets/feranmi.jpg";

export function Team() {
  const teamMembers = [
    {
      name: "Daniel Adeyemo",
      duty: "UI/UX Designer",
      role: "Co-founder DANDEM Digitals",
      image: daniel,
      linkedin: "https://www.linkedin.com/in/daniel-adeyemo-622125285/",
    },
    {
      name: "Oluwademilade Adebiyi",
      duty: "Frontend Developer",
      role: "Co-founder DANDEM Digitals",
      image: demmy,
      linkedin: "https://www.linkedin.com/in/oluwademilade-adebiyi-7a6b29294/",
    },
    {
      name: "Jaiyeoba Oluwaferanmi",
      duty: "Data Analyst",
      role: "Founder KulKraft",
      image: feranmi,
      linkedin: "https://www.linkedin.com/in/oluwaferanmi-jaiyeoba-8256b6323/",
    },
    {
      name: "Akinpelu Faith",
      duty: "Backend Developer",
      role: "Software Engineer",
      image: faith,
      linkedin: "https://www.linkedin.com/in/faith-akinpelu-303580245/",
    },
    {
      name: "Achike David",
      duty: "Graphics Designer",
      role: "Founder David Graphix",
      image: david,
      linkedin: "https://www.linkedin.com/in/david-achike-49543130b/",
    },
    {
      name: "Boma Amos-Atuboyedia",
      duty: "PR Strategist & Reputation Manager",
      role: "Founder HairKulture",
      image: boma,
      linkedin: "https://www.linkedin.com/in/boma-amos-atuboyedia-3355a2245/",
    },
    {
      name: "Adewunmi Omojolaade",
      duty: "Software Tester",
      image: jade,
      linkedin: "https://www.linkedin.com/in/shonola-omojolaade-500653376/",
    },
  ];
  return (
    <>
      <Navbar />
      <div className="meet-the-team">
        <div className="team-header">
          <h1>Meet Our Team</h1>
          <p>The passionate individuals driving Intern Connect forward.</p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={`team-member ${
                index === teamMembers.length - 1 ? "team-single" : ""
              }`}
            >
              <div className="team-avatar">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="team-info">
                <h3>{member.name}</h3>
                <div className="duty">{member.duty}</div>
                <div className="role">{member.role}</div>
                <a
                  href={member.linkedin}
                  className="team-linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
