import Navbar from "../components/Navbar";

export default function OurTeam() {
  return (
    <>
      <Navbar />

      <main className="org-page">
        <section className="org-card">
          <h1 className="org-title">Our Team</h1>
          <p className="org-intro">
            Meet the people who build and run our community programs.
          </p>

          <article className="org-tab-content" role="tabpanel">
            <h2>People Behind The Mission</h2>
            <p>
              Our team combines social workers, educators, mentors, and field
              coordinators who collaborate closely with local communities. We
              believe trust and consistency are the foundation of every
              successful grassroots initiative.
            </p>

            <ul>
              <li>Experienced leadership with on-ground expertise</li>
              <li>Skilled volunteers supporting education and outreach</li>
              <li>Partnerships with local institutions for scale</li>
            </ul>
          </article>
        </section>
      </main>
    </>
  );
}
