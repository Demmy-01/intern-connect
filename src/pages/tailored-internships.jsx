import Footer from "../components/footer";
import Navbar from "../components/navbar";
import OpportunityCard from "../components/OpportunityCard";
import partner from "../assets/partner.png";

export function TailoredInternship() {
  return (
    <>
      <Navbar />
      <OpportunityCard
        title="Tailored Internship Opportunities"
        description="At Intern Connect, we understand that every student has unique aspirations and skills. Our Tailored Internship Matches service uses advanced algorithms to connect students with organizations that fit their specific interests and career objectives. By creating a personalized profile, students can receive customized internship opportunities that align perfectly with their field of study. Say goodbye to generic applications and embrace a targeted approach that maximizes your chances of landing the internship of your dreams. Join us today and take the first step towards your professional future!"
        image={partner}
      />
      <Footer />
    </>
  );
}
