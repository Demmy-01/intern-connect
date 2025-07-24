import Footer from "../components/footer";
import Navbar from "../components/navbar";
import OpportunityCard from "../components/OpportunityCard";
import application from "../assets/application.png";

export function SeamlessApplication() {
  return (
    <>
      <Navbar />
      <OpportunityCard
        title="Seamless application process"
        description="At Intern Connect, applying for internships has never been easier. Our user-friendly platform allows students to create an account and access numerous internship opportunities in one place. With just a few clicks, students can submit all the necessary documents required by organizations. We prioritize a seamless application experience, ensuring that students can focus on what truly matters: showcasing their skills and passion. By streamlining the application process, we help students save time and effort, making it easier for them to land their dream internships. Experience the convenience of Intern Connect and elevate your career prospects!
Schedule appointment"
        image={application}
      />
      <Footer />
    </>
  );
}
