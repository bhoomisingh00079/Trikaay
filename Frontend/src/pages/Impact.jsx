import Navbar from "../components/Navbar";

export default function Impact() {
  return (
    <>
      <Navbar />

      <div className="main-content">

        <div className="section">
          <div className="container">

            <h1 className="text-center font-bold mb-10">
              Impact Reports & CSR Documents
            </h1>

            {/* DOCUMENT LIST */}
            <div className="grid md:grid-cols-3 gap-6">

              <div className="doc-card">
                <h2>Annual Report 2023</h2>
                <p>Overview of activities and impact.</p>
                <a href="/docs/report1.pdf" target="_blank" className="home-btn">View</a>
              </div>

              <div className="doc-card">
                <h2>CSR Report</h2>
                <p>Corporate social responsibility details.</p>
                <a href="/docs/report2.pdf" target="_blank" className="home-btn">View</a>
              </div>

              <div className="doc-card">
                <h2>Financial Report</h2>
                <p>Transparency and fund usage.</p>
                <a href="/docs/report3.pdf" target="_blank" className="home-btn">View</a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </>
  );
}