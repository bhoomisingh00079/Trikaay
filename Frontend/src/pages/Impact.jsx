import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

const documents = [
  { name: "80G Certificate", file: "80G.pdf" },
  { name: "Form LE", file: "AAJCT7962LE20221_signed.pdf" },
  { name: "Form LF", file: "AAJCT7962LF20221_signed.pdf" },
  {
    name: "Certificate of Incorporation",
    file: "CERTIFICATE OF INCORPORATION.PDF",
  },
  { name: "Form 10A", file: "Form 10A_ARN (3).pdf" },
  { name: "Fund Utilization", file: "Fund Utilization.pdf" },
  { name: "PAN Card", file: "Pan Card.pdf" },
  { name: "Progress Report", file: "Progress Report.pdf" },
  { name: "MOA Subscriber Sheet", file: "subscribersheet_MOA.pdf" },
  { name: "TAN Card", file: "Tan Card 402109.pdf" },
  { name: "Activity Report", file: "TCCA Activity report Document (A4).pdf" },
  {
    name: "ITR Acknowledgement",
    file: "TRIKAY CARE AND CREATION ASSOCIATION ITR ACKNOWLEDGEMENT F.Y 22-23.pdf",
  },
  {
    name: "Project Report",
    file: "Trikay Fund utilization and project report.pdf",
  },
  {
    name: "Balance Sheet",
    file: "TRIKEY CARE AND CREATION ASSOCIATION BALANCE SHEET CA SIGNED.pdf",
  },
];

export default function Impact() {
  return (
    <>
      <Navbar />

      <main className="px-6 py-16 text-lg leading-7">
        <section className="mx-auto max-w-6xl">
          <h1 className="mb-10 text-center text-4xl font-bold text-slate-900">
              Impact Reports & CSR Documents
          </h1>

          <div className="grid gap-6 md:grid-cols-3">
            {documents.map((doc) => (
              <div
                className="rounded-xl bg-white p-6 text-center shadow-md transition hover:shadow-xl"
                key={doc.file}
              >
                <h2 className="mb-2 text-lg font-bold text-slate-900">{doc.name}</h2>

                <a
                  href={`/docs/${encodeURIComponent(doc.file)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition hover:scale-105 hover:bg-blue-700 hover:shadow-lg"
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
