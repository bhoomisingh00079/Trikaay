import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { apiUrl, mediaFileUrl } from "../utils/api";
import { useSyncListener, SYNC_EVENTS } from "../utils/sync";

const HARD_CODED_REPORT = {
  originalName: "TCCA Activity report Document (A4).pdf",
  title: "TCCA Activity Report",
  category: "project",
  staticUrl: "/docs/TCCA%20Activity%20report%20Document%20(A4).pdf",
};

export default function Impact() {
  const [filter, setFilter] = useState("all");
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const fetchingDocs = useRef(false);

  const fetchDocuments = useCallback(async () => {
    if (fetchingDocs.current) return;
    fetchingDocs.current = true;
    try {
      const response = await fetch(apiUrl('/api/media/docs'));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setDocuments(data);
        setFetchError("");
      } else {
        setDocuments([]);
        setFetchError("No documents found in media API.");
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setFetchError("Could not load reports from API.");
    } finally {
      setIsLoading(false);
      fetchingDocs.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useSyncListener([SYNC_EVENTS.DOCUMENTS_UPDATED], () => {
    fetchDocuments();
  });

  const docsWithHardcoded = useMemo(() => {
    const exists = documents.some((doc) => doc.originalName === HARD_CODED_REPORT.originalName);
    if (exists) return documents;
    return [HARD_CODED_REPORT, ...documents];
  }, [documents]);

  const filteredDocs = useMemo(
    () => (filter === "all" ? docsWithHardcoded : docsWithHardcoded.filter((doc) => doc.category === filter)),
    [docsWithHardcoded, filter]
  );

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
              <option value="all">All Reports</option>
              <option value="org">Organization Info</option>
              <option value="csr">CSR Reports</option>
              <option value="project">Implemented Projects</option>
            </select>
          </div>

          {fetchError ? (
            <p className="mb-6 text-center text-sm text-amber-700">{fetchError}</p>
          ) : null}

          {/* DOCUMENT GRID */}
          <div className="grid gap-6 md:grid-cols-3">
            {isLoading ? (
              <p className="col-span-full text-center text-brand-secondary">Loading documents...</p>
            ) : null}

            {!isLoading && filteredDocs.length === 0 ? (
              <p className="col-span-full text-center text-brand-secondary">No reports found for the selected filter.</p>
            ) : null}

            {filteredDocs.map((doc) => (
              <div
                key={doc.originalName}
                className="rounded-xl bg-white p-6 text-center shadow-md transition hover:shadow-xl"
              >
                <h2 className="mb-3 font-bold text-brand-heading">{doc.title || doc.originalName}</h2>

                <a
                  href={doc.staticUrl || mediaFileUrl(doc.originalName)}
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