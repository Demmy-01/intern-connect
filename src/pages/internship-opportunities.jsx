import Footer from "../components/footer";
import Navbar from "../components/navbar";
import OpportunityCard from "../components/OpportunityCard";
import value from "../assets/value.png";

export function InternshipOpportunities() {
  return (
    <>
      <Navbar />
      <OpportunityCard
        title="Internship Opportunities"
        description="Intern Connect connects
        ambitious students with a diverse array 
        of internship opportunities. Organizations 
        actively seeking interns can easily post 
        their openings, showcasing the skills and 
        talents they require. Students can explore
        these listings, filtering by their specific 
        fields of interest. By creating an account,
        students gain access to a streamlined application 
        process where they can submit required documents
        directly to potential employers. This platform
        empowers students to kickstart their careers,
        gain valuable experience, and enhance their
        resumes. Join Intern Connect today and take
        the first step towards a successful professional journey!"
        image={value}
      />
      <Footer />
    </>
  );
}
