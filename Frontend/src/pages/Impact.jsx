import { useState } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

const documents = [
  { name: "80G Certificate", file: "80G.pdf", category: "org" },
  { name: "PAN Card", file: "Pan Card.pdf", category: "org" },
  { name: "TAN Card", file: "Tan Card 402109.pdf", category: "org" },
  { name: "Certificate of Incorporation", file: "CERTIFICATE OF INCORPORATION.PDF", category: "org" },
  { name: "Form 10A", file: "Form 10A_ARN (3).pdf", category: "org" },
  { name: "MOA Subscriber Sheet", file: "subscribersheet_MOA.pdf", category: "org" },

  { name: "ITR Acknowledgement", file: "TRIKAY CARE AND CREATION ASSOCIATION ITR ACKNOWLEDGEMENT F.Y 22-23.pdf", category: "csr" },
  { name: "Balance Sheet", file: "TRIKEY CARE AND CREATION ASSOCIATION BALANCE SHEET CA SIGNED.pdf", category: "csr" },
  { name: "Fund Utilization", file: "Fund Utilization.pdf", category: "csr" },

  { name: "Activity Report", file: "TCCA Activity report Document (A4).pdf", category: "project" },
  { name: "Progress Report", file: "Progress Report.pdf", category: "project" },
  { name: "Project Report", file: "Trikay Fund utilization and project report.pdf", category: "project" },
  { name: "Form LE", file: "AAJCT7962LE20221_signed.pdf", category: "project" },
  { name: "Form LF", file: "AAJCT7962LF20221_signed.pdf", category: "project" },
];

export default function Impact() {
  const [filter, setFilter] = useState("org");

  const filteredDocs = documents.filter(doc => doc.category === filter);

  return (
    <>
      <Navbar />

      <main className="support-bg px-6 py-16 text-lg text-brand-primary">
        <section className="mx-auto max-w-6xl">

          <h1 className="heading-page mb-6 text-center">
            Impact Reports & CSR Documents
          </h1>

          {/* 🔥 DROPDOWN */}
          <div className="mb-10 flex justify-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border px-4 py-2 text-lg shadow"
            >
              <option value="org">Organization Info</option>
              <option value="csr">CSR Reports</option>
              <option value="project">Implemented Projects</option>
            </select>
          </div>

          {/* DOCUMENT GRID */}
          <div className="grid gap-6 md:grid-cols-3">

            {filteredDocs.map((doc) => (
              <div
                key={doc.file}
                className="rounded-xl bg-white p-6 text-center shadow-md transition hover:shadow-xl"
              >
                <h2 className="mb-3 font-bold text-brand-heading">{doc.name}</h2>

                <a
                  href={`/docs/${encodeURIComponent(doc.file)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-full bg-blue-600 px-6 py-2 text-brand-inverse transition hover:scale-105 hover:shadow-lg"
                >
                  View
                </a>
              </div>
            ))}

          </div>

        </section>
      </main>

      <SiteFooter />
    </>
  );
}