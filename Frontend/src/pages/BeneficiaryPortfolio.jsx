import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

export default function BeneficiaryPortfolio() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen support-bg px-4 py-10">
        <section className="mx-auto max-w-5xl rounded-2xl border border-blue-100 bg-white p-6 shadow-lg md:p-10">
          <h1 className="heading-section md:text-4xl">Beneficiary Portfolio</h1>
          <p className="body-copy mt-2">
            A closer look at the communities and groups we support.
          </p>

          <article
            className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 md:p-7"
            role="tabpanel"
          >
            <h2 className="text-2xl font-bold text-green-800">Whom We Support</h2>
            <p className="body-copy mt-3">
              Our beneficiary portfolio includes children, women, youth, and
              families from underserved communities. Programs are designed around
              real local needs, including school readiness, skill-building,
              healthcare camps, and financial awareness.
            </p>

            <ul className="mt-4 space-y-2">
              <li className="ml-5 list-disc text-base text-brand-secondary">
                Children receiving educational and care support
              </li>
              <li className="ml-5 list-disc text-base text-brand-secondary">
                Women-led self-help and livelihood initiatives
              </li>
              <li className="ml-5 list-disc text-base text-brand-secondary">
                Youth development through career and skills programs
              </li>
            </ul>
          </article>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
