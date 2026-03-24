import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

export default function BeneficiaryPortfolio() {
  return (
    <>
      <Navbar />

      <main className="org-page">
        <section className="org-card">
          <h1 className="org-title">Beneficiary Portfolio</h1>
          <p className="org-intro">
            A closer look at the communities and groups we support.
          </p>

          <article className="org-tab-content" role="tabpanel">
            <h2>Whom We Support</h2>
            <p>
              Our beneficiary portfolio includes children, women, youth, and
              families from underserved communities. Programs are designed around
              real local needs, including school readiness, skill-building,
              healthcare camps, and financial awareness.
            </p>

            <ul>
              <li>Children receiving educational and care support</li>
              <li>Women-led self-help and livelihood initiatives</li>
              <li>Youth development through career and skills programs</li>
            </ul>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
