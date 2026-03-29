import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import PageLoader from "./components/PageLoader";
import ProtectedRoute from "./components/ProtectedRoute";

// Eager loaded (critical pages)
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import SiteFooter from "./components/SiteFooter";

// Code-split routes (lazy loaded)
const About = lazy(() => import("./pages/About"));
const OurTeam = lazy(() => import("./pages/OurTeam"));
const WhatWeDo = lazy(() => import("./pages/WhatWeDo"));
const BeneficiaryPortfolio = lazy(() => import("./pages/BeneficiaryPortfolio"));
const SupportUs = lazy(() => import("./pages/SupportUs"));
const Contact = lazy(() => import("./pages/Contact"));
const Impact = lazy(() => import("./pages/Impact"));
const Volunteers = lazy(() => import("./pages/Volunteers"));

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

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-right" />
            <Routes>

              {/* Home (eagerly loaded - critical) */}
              <Route path="/" element={<Home />} />

              {/* Navbar Pages (code-split with Suspense) */}
              <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
              <Route path="/our-team" element={<Suspense fallback={<PageLoader />}><OurTeam /></Suspense>} />
              <Route path="/what-we-do" element={<Suspense fallback={<PageLoader />}><WhatWeDo /></Suspense>} />
              <Route path="/beneficiary-portfolio" element={<Suspense fallback={<PageLoader />}><BeneficiaryPortfolio /></Suspense>} />
              <Route path="/support" element={<Suspense fallback={<PageLoader />}><SupportUs /></Suspense>} />
              <Route path="/blogs" element={<Suspense fallback={<PageLoader />}><Blogs /></Suspense>} />
              <Route path="/volunteers" element={<Suspense fallback={<PageLoader />}><Volunteers /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
              <Route path="/impact" element={<Suspense fallback={<PageLoader />}><Impact /></Suspense>} />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Not Found (catch-all) */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;