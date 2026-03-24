import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import About from "./pages/About";
import OurTeam from "./pages/OurTeam";
import BeneficiaryPortfolio from "./pages/BeneficiaryPortfolio";
import Contact from "./pages/Contact";
import Impact from "./pages/Impact";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";

// Temporary pages (as per navbar links)
function Support() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="section">
          <div className="container">
            <h1 className="text-center font-bold">Support Us Page</h1>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}

function Blogs() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <div className="section">
          <div className="container">
            <h1 className="text-center font-bold">Blogs Page</h1>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
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