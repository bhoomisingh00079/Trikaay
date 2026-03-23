import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import OurTeam from "./pages/OurTeam";
import BeneficiaryPortfolio from "./pages/BeneficiaryPortfolio";
import Contact from "./pages/Contact";
import Impact from "./pages/Impact";

// Temporary pages (as per navbar links)
function Support() {
  return <h1>Support Us Page</h1>;
}

function Blogs() {
  return <h1>Blogs Page</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Navbar Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/beneficiary-portfolio" element={<BeneficiaryPortfolio />} />
        <Route path="/support" element={<Support />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/impact" element={<Impact />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;