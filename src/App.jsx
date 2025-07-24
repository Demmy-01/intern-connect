import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/home";
import { About } from "./pages/about";
import { Team } from "./pages/team";
import { InternshipOpportunities } from "./pages/internship-opportunities";
import { SeamlessApplication } from "./pages/seamless-application";
import { TailoredInternship } from "./pages/tailored-internships";
import Login from "./pages/login";
import SignUp from "./pages/signup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<h1>Contact Us</h1>} />
        <Route path="/team" element={<Team />} />
        <Route path="/seamless-application" element={<SeamlessApplication />} />
        <Route path="/tailored-internships" element={<TailoredInternship />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/internship-opportunities"
          element={<InternshipOpportunities />}
        />
      </Routes>
    </Router>
  );
}

export default App;
