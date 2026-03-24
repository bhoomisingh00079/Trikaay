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
      <main className="px-6 py-16 text-lg leading-7">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-center text-4xl font-bold text-slate-900">Support Us Page</h1>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Blogs() {
  return (
    <>
      <Navbar />
      <main className="px-6 py-16 text-lg leading-7">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-center text-4xl font-bold text-slate-900">Blogs Page</h1>
        </section>
      </main>
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