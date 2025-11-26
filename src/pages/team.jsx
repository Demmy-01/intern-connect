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
import tolu from "../assets/tolu.jpeg";
import bobzi from "../assets/bobzi.jpeg";

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
      name: "Shonola Omojolaade",
      duty: "Software Tester",
      image: jade,
      linkedin: "https://www.linkedin.com/in/shonola-omojolaade-500653376/",
    },
    {
      name: "Afolabi-Ige Omobobola",
      duty: "Social Media and Outreach Manager",
      role: "CEO GizmosHaus",
      image: bobzi,
      linkedin: "https://www.linkedin.com/in/omobobola-afolabi-ige-759b1928b/",
    },
    {
      name: "Ogundare Toluwase",
      duty: "Frontend Developer",
      role: "Software Developer",
      image: tolu,
      linkedin: "https://www.linkedin.com/in/toluwaseogundare/",
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
              className={`team-member`}
            >
              <div className="team-avatar">
                <img src={member.image} alt={member.name} />
              </div>
              <div className="team-info">
                <h5>{member.name}</h5>
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
