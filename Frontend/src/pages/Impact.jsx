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

      <div className="main-content">
        <div className="section">
          <div className="container">
            <h1 className="text-center font-bold mb-10">
              Impact Reports & CSR Documents
            </h1>

            <div className="grid md:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <div className="doc-card" key={index}>
                  <h2>{doc.name}</h2>

                  <a
                    href={`/docs/${encodeURIComponent(doc.file)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="home-btn"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
