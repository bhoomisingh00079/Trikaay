import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import OurTeam from "./pages/OurTeam";
import WhatWeDo from "./pages/WhatWeDo";
import BeneficiaryPortfolio from "./pages/BeneficiaryPortfolio";
import SupportUs from "./pages/SupportUs";
import Contact from "./pages/Contact";
import Impact from "./pages/Impact";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

// Temporary pages (as per navbar links)
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
      <ScrollToTop />
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Navbar Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/what-we-do" element={<WhatWeDo />} />
        <Route path="/beneficiary-portfolio" element={<BeneficiaryPortfolio />} />
        <Route path="/support" element={<SupportUs />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/impact" element={<Impact />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;