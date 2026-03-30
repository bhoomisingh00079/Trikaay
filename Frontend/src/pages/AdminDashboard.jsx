import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * AdminDashboard - Full-featured admin interface with sticky sidebar navigation
 * Sections: Projects CRUD, Contact, Social Links, Google Sheets, Documents, MongoDB Viewer
 */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("cards");

  const navItems = [
    { id: "cards", label: "Home Cards (Projects)" },
    { id: "contact", label: "Contact & Address" },
    { id: "social", label: "Social Media Links" },
    { id: "sheets", label: "Volunteer Approvals" },
    { id: "documents", label: "Documents / Impact" },
    { id: "mongo", label: "MongoDB Viewer" },
  ];

  // Set up IntersectionObserver to highlight active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px", // Highlight when section is in middle of viewport
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ===== STICKY SIDEBAR NAVIGATION ===== */}
      <nav className="w-56 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-bold text-brand-primary">Admin Panel</h3>
          <p className="mt-1 text-xs text-brand-secondary truncate">
            {user?.email || "admin"}
          </p>
        </div>

        {/* Nav Links */}
        <ul className="space-y-1 p-4">
          {navItems.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => handleNavClick(id)}
                className={`block w-full px-3 py-2 text-left text-sm rounded-md transition ${
                  activeSection === id
                    ? "bg-brand-primary bg-opacity-10 text-brand-primary font-semibold border-l-2 border-brand-primary pl-2"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ===== MAIN SCROLLABLE CONTENT ===== */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl space-y-20">
          {/* ===== SECTION 1: HOME CARDS (PROJECTS CRUD) ===== */}
          <section id="cards" className="scroll-mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-heading">Home Page Cards (Projects)</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage multilingual project cards displayed on the home page
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-500">Projects CRUD section - implemented in Phase 2.2</p>
            </div>
          </section>

          {/* ===== SECTION 2: CONTACT & ADDRESS ===== */}
          <section id="contact" className="scroll-mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-heading">Contact & Address Information</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage contact details. Sensitive info is encrypted at rest.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-500">Contact editor form - implemented in Phase 2.3</p>
            </div>
          </section>

          {/* ===== SECTION 3: SOCIAL MEDIA LINKS ===== */}
          <section id="social" className="scroll-mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-heading">Social Media Links</h2>
              <p className="mt-1 text-sm text-gray-600">
                Update links to your social media profiles (public info)
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-500">Social links editor - implemented in Phase 2.4</p>
            </div>
          </section>

          {/* ===== SECTION 4: GOOGLE SHEETS VIEWER & APPROVALS ===== */}
          <section id="sheets" className="scroll-mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-heading">Volunteer Approvals & Contacts</h2>
              <p className="mt-1 text-sm text-gray-600">
                View and approve volunteer applications. Updates sync with Google Sheets.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-500">Google Sheets viewer with tabs - implemented in Phase 2.5</p>
            </div>
          </section>

          {/* ===== SECTION 5: DOCUMENTS / IMPACT REPORTS UPLOAD ===== */}
          <section id="documents" className="scroll-mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-heading">Documents & Impact Reports</h2>
              <p className="mt-1 text-sm text-gray-600">
                Upload and manage PDFs and documents that support your impact narrative
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-500">Document upload and list - implemented in Phase 2.6</p>
            </div>
          </section>

          {/* ===== SECTION 6: MONGODB DATA VIEWER (AT BOTTOM) ===== */}
          <section id="mongo" className="scroll-mt-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-brand-heading">Database Viewer (Read-Only)</h2>
              <p className="mt-1 text-sm text-gray-600">
                Quick sanity check of what is stored in MongoDB. No editing here—edit above.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-500">MongoDB read-only viewer - implemented in Phase 2.7</p>
            </div>
          </section>

          {/* Bottom padding */}
          <div className="h-20" />
        </div>
      </main>
    </div>
  );
}
