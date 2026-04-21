import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  approveComment,
  approveVolunteer,
  createProject,
  deleteMediaByName,
  deleteMedia,
  deleteProject,
  getSheetComments,
  getMediaDocsAll,
  getMediaDocs,
  getProjects,
  getSheetContacts,
  getSheetSubscribers,
  getSheetVolunteers,
  getSiteSettings,
  getTeamMembers,
  updateProject,
  updateSiteSettings,
  uploadMedia,
} from "../utils/api";
import { mediaFileUrl, normalizeAssetUrl } from "../utils/api";

const FALLBACK_ADDRESS = "Swapnalaya children's home for girls, Old Panvel, Navi Mumbai - 410206";

const emptyProjectForm = {
  title: "",
  marathiTitle: "",
  shortDescriptionEn: "",
  shortDescriptionMr: "",
  fullDescriptionEn: "",
  fullDescriptionMr: "",
  isVisible: true,
};

function getStatusKey(row) {
  if (!row) return "Status";
  const key = Object.keys(row).find((k) => /^status$/i.test(k));
  return key || "Status";
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("cards");
  const mainScrollRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [projectImageFile, setProjectImageFile] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectBusy, setProjectBusy] = useState(false);

  const [siteSettings, setSiteSettings] = useState(null);
  const [contactForm, setContactForm] = useState({
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
    contactAddressSwapnalaya: "",
  });
  const [socialForm, setSocialForm] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    whatsapp: "",
  });
  const [settingsBusy, setSettingsBusy] = useState(false);

  const [volunteers, setVolunteers] = useState([]);
  const [sheetContacts, setSheetContacts] = useState([]);
  const [sheetComments, setSheetComments] = useState([]);
  const [sheetSubscribers, setSheetSubscribers] = useState([]);

  const [documents, setDocuments] = useState([]);
  const [mongoMediaAssets, setMongoMediaAssets] = useState([]);
  const [docBusy, setDocBusy] = useState(false);
  const [docForm, setDocForm] = useState({ title: "", category: "general", file: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheetErrors, setSheetErrors] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const isSyncingRef = useRef(false);

  const navItems = [
    { id: "cards", label: "Projects" },
    { id: "contact", label: "Contact & Address" },
    { id: "social", label: "Social Media Links" },
    { id: "sheets", label: "Volunteer Requests" },
    { id: "documents", label: "Documents" },
    { id: "mongo", label: "Saved Records" },
  ];

  async function refreshProjectsAndTeam() {
    const [projectRes, teamRes] = await Promise.all([getProjects(), getTeamMembers()]);
    setProjects(projectRes.data || []);
    setTeamMembers(teamRes.data || []);
  }

  async function refreshSiteSettings() {
    const settingsRes = await getSiteSettings();
    const data = settingsRes.data || {};
    const hydrated = {
      ...data,
      contactAddress: data.contactAddress || FALLBACK_ADDRESS,
      socialLinks: data.socialLinks || {},
    };

    setSiteSettings(hydrated);
    setContactForm({
      contactPhone: hydrated.contactPhone || "",
      contactEmail: hydrated.contactEmail || "",
      contactAddress: hydrated.contactAddress || FALLBACK_ADDRESS,
      contactAddressSwapnalaya: hydrated.contactAddressSwapnalaya || "",
    });

    setSocialForm({
      facebook: hydrated.socialLinks?.facebook || "",
      instagram: hydrated.socialLinks?.instagram || "",
      linkedin: hydrated.socialLinks?.linkedin || "",
      twitter: hydrated.socialLinks?.twitter || "",
      youtube: hydrated.socialLinks?.youtube || "",
      whatsapp: hydrated.socialLinks?.whatsapp || "",
    });
  }

  async function refreshSheets() {
    const [volunteerRes, contactsRes, commentsRes, subscribersRes] = await Promise.allSettled([
      getSheetVolunteers(),
      getSheetContacts(),
      getSheetComments(),
      getSheetSubscribers(),
    ]);

    const errors = [];

    if (volunteerRes.status === "fulfilled") {
      setVolunteers(volunteerRes.value.data || []);
    } else {
      setVolunteers([]);
      errors.push(volunteerRes.reason?.response?.data?.error || "Failed to fetch volunteer data");
    }

    if (contactsRes.status === "fulfilled") {
      setSheetContacts(contactsRes.value.data || []);
    } else {
      setSheetContacts([]);
      errors.push(contactsRes.reason?.response?.data?.error || "Failed to fetch contact sheet data");
    }

    if (commentsRes.status === "fulfilled") {
      setSheetComments(commentsRes.value.data || []);
    } else {
      setSheetComments([]);
      errors.push(commentsRes.reason?.response?.data?.error || "Failed to fetch comments sheet data");
    }

    if (subscribersRes.status === "fulfilled") {
      setSheetSubscribers(subscribersRes.value.data || []);
    } else {
      setSheetSubscribers([]);
      errors.push(subscribersRes.reason?.response?.data?.error || "Failed to fetch subscribers sheet data");
    }

    setSheetErrors(errors);
  }

  async function refreshDocs() {
    const docsRes = await getMediaDocs();
    setDocuments(docsRes.data || []);

    const allDocsRes = await getMediaDocsAll();
    setMongoMediaAssets(allDocsRes.data || []);
  }

  async function syncDashboardLiveData() {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    try {
      await Promise.allSettled([
        refreshProjectsAndTeam(),
        refreshSheets(),
        refreshDocs(),
      ]);
      setLastSyncedAt(new Date());
    } finally {
      isSyncingRef.current = false;
    }
  }

  async function handleManualSync() {
    try {
      setIsManualSyncing(true);
      await syncDashboardLiveData();
    } finally {
      setIsManualSyncing(false);
    }
  }

  useEffect(() => {
    const scrollRoot = mainScrollRef.current;
    if (!scrollRoot) return;

    const updateActiveSection = () => {
      const rootTop = scrollRoot.getBoundingClientRect().top;
      const scrollAnchor = scrollRoot.scrollTop + 140;
      let current = navItems[0].id;

      navItems.forEach(({ id }) => {
        const sectionEl = document.getElementById(id);
        if (!sectionEl) return;

        const sectionTop = sectionEl.getBoundingClientRect().top - rootTop + scrollRoot.scrollTop;
        if (scrollAnchor >= sectionTop) {
          current = id;
        }
      });

      setActiveSection(current);
    };

    updateActiveSection();
    scrollRoot.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      scrollRoot.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        setError("");
        await Promise.all([
          refreshProjectsAndTeam(),
          refreshSiteSettings(),
          refreshSheets(),
          refreshDocs(),
        ]);
      } catch (err) {
        setError(err?.response?.data?.error || "Failed to load admin dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    let intervalMs = 90000;

    if (activeSection === "sheets") {
      intervalMs = 20000;
    } else if (activeSection === "mongo" || activeSection === "documents") {
      intervalMs = 30000;
    } else if (activeSection === "cards") {
      intervalMs = 45000;
    }

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        syncDashboardLiveData();
      }
    }, intervalMs);

    const onVisibilityChange = () => {
      if (!document.hidden) {
        syncDashboardLiveData();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [activeSection]);

  function handleNavClick(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  }

  function resetProjectForm() {
    setProjectForm(emptyProjectForm);
    setProjectImageFile(null);
    setEditingProjectId(null);
  }

  function mapProjectToForm(project) {
    return {
      title: project.title || "",
      marathiTitle: project.marathiTitle || "",
      shortDescriptionEn: project.shortDescriptionEn || "",
      shortDescriptionMr: project.shortDescriptionMr || "",
      fullDescriptionEn: project.fullDescriptionEn || "",
      fullDescriptionMr: project.fullDescriptionMr || "",
      isVisible: project.isVisible !== false,
    };
  }

  function getFileNameFromAssetUrl(url) {
    if (!url) return "";
    const marker = "/api/media/file/";
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return "";
    return decodeURIComponent(url.slice(markerIndex + marker.length));
  }

  async function submitProjectForm(e) {
    e.preventDefault();
    if (!projectForm.title.trim()) return;

    if (!editingProjectId && !projectImageFile) {
      alert("Please upload a project image (JPEG or PNG).");
      return;
    }

    const currentProject = editingProjectId
      ? projects.find((item) => item._id === editingProjectId)
      : null;

    let imageUrl = currentProject?.images?.[0] || "";

    if (projectImageFile) {
      const imageForm = new FormData();
      imageForm.append("file", projectImageFile);
      imageForm.append("title", `${projectForm.title} image`);
      imageForm.append("category", "project");

      const uploadRes = await uploadMedia(imageForm);
      const uploadedName = uploadRes?.data?.originalName;
      imageUrl = uploadedName ? `/api/media/file/${encodeURIComponent(uploadedName)}` : imageUrl;

      const previousName = getFileNameFromAssetUrl(currentProject?.images?.[0] || "");
      if (previousName && previousName !== uploadedName) {
        try {
          await deleteMediaByName(previousName);
        } catch (deleteErr) {
          console.warn("Old project image cleanup failed:", deleteErr?.message || deleteErr);
        }
      }
    }

    const payload = {
      ...projectForm,
      images: imageUrl ? [imageUrl] : [],
      description: projectForm.shortDescriptionEn || projectForm.title,
    };

    try {
      setProjectBusy(true);
      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
      } else {
        await createProject(payload);
      }
      await refreshProjectsAndTeam();
      resetProjectForm();
    } catch (err) {
      alert(err?.response?.data?.error || "Unable to save project.");
    } finally {
      setProjectBusy(false);
    }
  }

  async function removeProject(id) {
    if (!window.confirm("Delete this project card?")) return;
    try {
      await deleteProject(id);
      await refreshProjectsAndTeam();
      if (editingProjectId === id) resetProjectForm();
    } catch (err) {
      alert(err?.response?.data?.error || "Unable to delete project.");
    }
  }

  async function toggleProjectVisibility(project) {
    try {
      await updateProject(project._id, { isVisible: !project.isVisible });
      await refreshProjectsAndTeam();
    } catch (err) {
      alert(err?.response?.data?.error || "Unable to update visibility.");
    }
  }

  async function saveContactSettings(e) {
    e.preventDefault();
    try {
      setSettingsBusy(true);
      await updateSiteSettings({
        contactPhone: contactForm.contactPhone,
        contactEmail: contactForm.contactEmail,
        contactAddress: contactForm.contactAddress,
        contactAddressSwapnalaya: contactForm.contactAddressSwapnalaya,
      });
      await refreshSiteSettings();
      alert("Contact settings updated.");
    } catch (err) {
      alert(err?.response?.data?.error || "Unable to save contact settings.");
    } finally {
      setSettingsBusy(false);
    }
  }

  async function saveSocialSettings(e) {
    e.preventDefault();
    try {
      setSettingsBusy(true);
      await updateSiteSettings({ socialLinks: socialForm });
      await refreshSiteSettings();
      alert("Social links updated.");
    } catch (err) {
      alert(err?.response?.data?.error || "Unable to save social links.");
    } finally {
      setSettingsBusy(false);
    }
  }

  async function handleApproveVolunteer(row) {
    const statusKey = getStatusKey(row);
    const rowNumber = row.rowNumber || row.rowIndex;
    const previous = [...volunteers];

    setVolunteers((curr) =>
      curr.map((item) =>
        (item.rowNumber || item.rowIndex) === rowNumber ? { ...item, [statusKey]: "Approved" } : item
      )
    );

    try {
      const response = await approveVolunteer(rowNumber);
      if (response?.data?.warning) {
        alert(`⚠ ${response.data.warning}`);
      }
      // Refresh to get updated certificate ID and status
      await refreshSheets();
    } catch (err) {
      setVolunteers(previous);
      alert(err?.response?.data?.error || "Approval failed.");
    }
  }

  async function handleApproveComment(row) {
    const statusKey = getStatusKey(row);
    const rowNumber = row.rowNumber;
    const previous = [...sheetComments];

    setSheetComments((curr) =>
      curr.map((item) =>
        item.rowNumber === rowNumber ? { ...item, [statusKey]: "Approved" } : item
      )
    );

    try {
      await approveComment(rowNumber);
    } catch (err) {
      setSheetComments(previous);
      alert(err?.response?.data?.error || "Comment approval failed.");
    }
  }

  async function handleUploadDoc(e) {
    e.preventDefault();
    if (!docForm.file) return;

    const form = new FormData();
    form.append("file", docForm.file);
    form.append("title", docForm.title || docForm.file.name);
    form.append("category", docForm.category);

    try {
      setDocBusy(true);
      await uploadMedia(form);
      setDocForm({ title: "", category: "general", file: null });
      await refreshDocs();
    } catch (err) {
      alert(err?.response?.data?.error || "Upload failed.");
    } finally {
      setDocBusy(false);
    }
  }

  async function handleDeleteDoc(id) {
    if (!window.confirm("Delete this document?")) return;
    try {
      await deleteMedia(id);
      await refreshDocs();
    } catch (err) {
      alert(err?.response?.data?.error || "Delete failed.");
    }
  }

  const volunteerColumns = useMemo(() => {
    const first = volunteers[0];
    if (!first) return [];
    return Object.keys(first).filter((k) => k !== "rowIndex" && k !== "rowNumber");
  }, [volunteers]);

  const contactsColumns = useMemo(() => {
    const first = sheetContacts[0];
    if (!first) return [];
    return Object.keys(first).filter((k) => k !== "rowIndex" && k !== "rowNumber");
  }, [sheetContacts]);

  const commentsColumns = useMemo(() => {
    const first = sheetComments[0];
    if (!first) return [];
    return Object.keys(first).filter((k) => k !== "rowIndex" && k !== "rowNumber");
  }, [sheetComments]);

  const subscriberColumns = useMemo(() => {
    const first = sheetSubscribers[0];
    if (!first) return [];
    return Object.keys(first).filter((k) => k !== "rowIndex" && k !== "rowNumber");
  }, [sheetSubscribers]);

  const mongoCertificateAssets = useMemo(
    () => mongoMediaAssets.filter((asset) => String(asset.category || "").toLowerCase() === "certificate"),
    [mongoMediaAssets]
  );

  const mongoNonCertificateAssets = useMemo(
    () => mongoMediaAssets.filter((asset) => String(asset.category || "").toLowerCase() !== "certificate"),
    [mongoMediaAssets]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-brand-primary">
      <nav className="w-56 flex-shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-bold text-brand-primary">Admin Panel</h3>
          <p className="mt-1 text-xs text-brand-secondary truncate">{user?.email || "admin"}</p>
        </div>

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

        <div className="border-t border-gray-200 my-4" />
        <div className="p-4">
          <button onClick={logout} className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
            Logout
          </button>
        </div>
      </nav>

      <main ref={mainScrollRef} className="flex-1 overflow-y-auto p-8">
        {error ? <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</div> : null}
        {loading ? <div className="rounded border bg-white p-6">Loading admin dashboard...</div> : null}

        {!loading ? (
          <div className="max-w-6xl space-y-16">
            <section id="cards" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Projects</h2>
                <p className="text-sm text-gray-600">Add, edit, and manage project details shown on your website.</p>
              </div>

              <form onSubmit={submitProjectForm} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-lg font-semibold">{editingProjectId ? "Edit Project" : "Add Project"}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="rounded border p-2" placeholder="Title (English)" value={projectForm.title} onChange={(e) => setProjectForm((p) => ({ ...p, title: e.target.value }))} required />
                  <input className="rounded border p-2" placeholder="Title (Marathi)" value={projectForm.marathiTitle} onChange={(e) => setProjectForm((p) => ({ ...p, marathiTitle: e.target.value }))} />
                  <input className="rounded border p-2" placeholder="Short description EN" value={projectForm.shortDescriptionEn} onChange={(e) => setProjectForm((p) => ({ ...p, shortDescriptionEn: e.target.value }))} />
                  <input className="rounded border p-2" placeholder="Short description MR" value={projectForm.shortDescriptionMr} onChange={(e) => setProjectForm((p) => ({ ...p, shortDescriptionMr: e.target.value }))} />
                  <textarea className="rounded border p-2 md:col-span-2" placeholder="Full description EN" value={projectForm.fullDescriptionEn} onChange={(e) => setProjectForm((p) => ({ ...p, fullDescriptionEn: e.target.value }))} rows={2} />
                  <textarea className="rounded border p-2 md:col-span-2" placeholder="Full description MR" value={projectForm.fullDescriptionMr} onChange={(e) => setProjectForm((p) => ({ ...p, fullDescriptionMr: e.target.value }))} rows={2} />
                  <div className="md:col-span-2 rounded border p-3">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Project Image (JPEG/PNG)</label>
                    <input
                      className="w-full rounded border p-2"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => setProjectImageFile(e.target.files?.[0] || null)}
                    />

                    {editingProjectId && projects.find((item) => item._id === editingProjectId)?.images?.[0] ? (
                      <div className="mt-3">
                        <p className="mb-1 text-xs text-gray-600">Existing image</p>
                        <img
                          src={normalizeAssetUrl(projects.find((item) => item._id === editingProjectId)?.images?.[0])}
                          alt="Existing project"
                          className="h-24 w-40 rounded object-cover border"
                        />
                      </div>
                    ) : null}

                    {projectImageFile ? (
                      <p className="mt-2 text-xs text-blue-700">New image selected: {projectImageFile.name}</p>
                    ) : null}
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={projectForm.isVisible} onChange={(e) => setProjectForm((p) => ({ ...p, isVisible: e.target.checked }))} />
                  Visible
                </label>
                <div className="flex gap-2">
                  <button disabled={projectBusy} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{projectBusy ? "Saving..." : "Save"}</button>
                  {editingProjectId ? (
                    <button type="button" onClick={resetProjectForm} className="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300">Cancel</button>
                  ) : null}
                </div>
              </form>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <article key={project._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <h4 className="font-bold text-brand-heading">{project.title}</h4>
                    <p className="text-sm text-gray-600">{project.marathiTitle || "-"}</p>
                    <p className="mt-2 text-sm">{(project.shortDescriptionEn || project.description || "").slice(0, 120)}</p>
                    <p className="mt-2 text-xs text-gray-500">Project No: {project.projectNumber || "-"} | Visible: {project.isVisible ? "Yes" : "No"}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => { setEditingProjectId(project._id); setProjectImageFile(null); setProjectForm(mapProjectToForm(project)); }} className="rounded bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600">Edit</button>
                      <button type="button" onClick={() => toggleProjectVisibility(project)} className="rounded bg-indigo-500 px-3 py-1 text-sm text-white hover:bg-indigo-600">Toggle</button>
                      <button type="button" onClick={() => removeProject(project._id)} className="rounded bg-rose-600 px-3 py-1 text-sm text-white hover:bg-rose-700">Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="contact" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Contact and Address</h2>
                <p className="text-sm text-gray-600">Update phone number, email, and address details.</p>
              </div>
              <form onSubmit={saveContactSettings} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                <input className="w-full rounded border p-2" placeholder="Phone number" value={contactForm.contactPhone} onChange={(e) => setContactForm((p) => ({ ...p, contactPhone: e.target.value }))} />
                <input className="w-full rounded border p-2" placeholder="Email address" value={contactForm.contactEmail} onChange={(e) => setContactForm((p) => ({ ...p, contactEmail: e.target.value }))} />
                <textarea className="w-full rounded border p-2" rows={3} placeholder="Main address" value={contactForm.contactAddress} onChange={(e) => setContactForm((p) => ({ ...p, contactAddress: e.target.value }))} />
                <textarea className="w-full rounded border p-2" rows={3} placeholder="Swapnalaya address" value={contactForm.contactAddressSwapnalaya} onChange={(e) => setContactForm((p) => ({ ...p, contactAddressSwapnalaya: e.target.value }))} />
                <button disabled={settingsBusy} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{settingsBusy ? "Saving..." : "Save Contact"}</button>
              </form>
            </section>

            <section id="social" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Social Media Links</h2>
              </div>
              <form onSubmit={saveSocialSettings} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm grid gap-3 md:grid-cols-2">
                <input className="rounded border p-2" placeholder="Facebook URL" value={socialForm.facebook} onChange={(e) => setSocialForm((p) => ({ ...p, facebook: e.target.value }))} />
                <input className="rounded border p-2" placeholder="Instagram URL" value={socialForm.instagram} onChange={(e) => setSocialForm((p) => ({ ...p, instagram: e.target.value }))} />
                <input className="rounded border p-2" placeholder="LinkedIn URL" value={socialForm.linkedin} onChange={(e) => setSocialForm((p) => ({ ...p, linkedin: e.target.value }))} />
                <input className="rounded border p-2" placeholder="Twitter/X URL" value={socialForm.twitter} onChange={(e) => setSocialForm((p) => ({ ...p, twitter: e.target.value }))} />
                <input className="rounded border p-2" placeholder="YouTube URL" value={socialForm.youtube} onChange={(e) => setSocialForm((p) => ({ ...p, youtube: e.target.value }))} />
                <input className="rounded border p-2" placeholder="WhatsApp number" value={socialForm.whatsapp} onChange={(e) => setSocialForm((p) => ({ ...p, whatsapp: e.target.value }))} />
                <div className="md:col-span-2">
                  <button disabled={settingsBusy} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{settingsBusy ? "Saving..." : "Save Social Links"}</button>
                </div>
              </form>
            </section>

            <section id="sheets" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Volunteer Requests</h2>
                <p className="text-xs text-gray-500">
                  Updates automatically{lastSyncedAt ? ` | Last updated: ${lastSyncedAt.toLocaleTimeString()}` : ""}
                </p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    className="rounded border px-3 py-1 text-xs"
                  >
                    {isManualSyncing ? "Refreshing..." : "Refresh Now"}
                  </button>
                </div>
              </div>
              {sheetErrors.length > 0 ? (
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800 text-sm">
                  {sheetErrors.join(" | ")}
                </div>
              ) : null}

              <div className="space-y-5">
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Volunteers</h3>
                  <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
                    <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {volunteerColumns.map((col) => <th key={col} className="border-b p-2 text-left">{col}</th>)}
                        <th className="border-b p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((row) => {
                        const statusKey = getStatusKey(row);
                        const normalized = String(row[statusKey] || "").toLowerCase();
                        const isApproved = normalized === "approved" || normalized === "completed";
                        return (
                          <tr key={row.rowNumber || row.rowIndex}>
                            {volunteerColumns.map((col) => <td key={col} className="border-b p-2">{String(row[col] || "")}</td>)}
                            <td className="border-b p-2">
                              <button disabled={isApproved || !(row.rowNumber || row.rowIndex)} onClick={() => handleApproveVolunteer(row)} className={`rounded px-3 py-1 text-xs ${isApproved ? "bg-gray-200 text-gray-600" : "bg-green-600 text-white"}`}>
                                {isApproved ? "Approved" : "Approve"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Contacts</h3>
                  <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
                    <table className="min-w-full text-sm">
                    <thead>
                      <tr>{contactsColumns.map((col) => <th key={col} className="border-b p-2 text-left">{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sheetContacts.map((row) => (
                        <tr key={row.rowIndex}>
                          {contactsColumns.map((col) => <td key={col} className="border-b p-2">{String(row[col] || "")}</td>)}
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Comments Approval</h3>
                  <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
                    <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        {commentsColumns.map((col) => <th key={col} className="border-b p-2 text-left">{col}</th>)}
                        <th className="border-b p-2 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheetComments.map((row) => {
                        const statusKey = getStatusKey(row);
                        const normalized = String(row[statusKey] || "").toLowerCase();
                        const isApproved = normalized === "approved";

                        return (
                          <tr key={row.rowNumber || row.rowIndex}>
                            {commentsColumns.map((col) => <td key={col} className="border-b p-2">{String(row[col] || "")}</td>)}
                            <td className="border-b p-2">
                              <button
                                disabled={isApproved || !row.rowNumber}
                                onClick={() => handleApproveComment(row)}
                                className={`rounded px-3 py-1 text-xs ${isApproved ? "bg-gray-200 text-gray-600" : "bg-green-600 text-white"}`}
                              >
                                {isApproved ? "Approved" : "Approve"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Subscribers</h3>
                  <div className="overflow-x-auto overflow-y-auto max-h-[360px]">
                    <table className="min-w-full text-sm">
                    <thead>
                      <tr>{subscriberColumns.map((col) => <th key={col} className="border-b p-2 text-left">{col}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sheetSubscribers.map((row) => (
                        <tr key={row.rowNumber || row.rowIndex}>
                          {subscriberColumns.map((col) => <td key={col} className="border-b p-2">{String(row[col] || "")}</td>)}
                        </tr>
                      ))}
                    </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section id="documents" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Documents</h2>
                <p className="text-sm text-gray-600">Upload and manage your documents here.</p>
              </div>

              <form onSubmit={handleUploadDoc} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm grid gap-3 md:grid-cols-3">
                <input className="rounded border p-2" placeholder="Title" value={docForm.title} onChange={(e) => setDocForm((p) => ({ ...p, title: e.target.value }))} />
                <select className="rounded border p-2" value={docForm.category} onChange={(e) => setDocForm((p) => ({ ...p, category: e.target.value }))}>
                  <option value="org">org</option>
                  <option value="csr">csr</option>
                  <option value="project">project</option>
                  <option value="general">general</option>
                </select>
                <input className="rounded border p-2" type="file" accept="application/pdf" onChange={(e) => setDocForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
                <div className="md:col-span-3">
                  <button disabled={docBusy} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">{docBusy ? "Uploading..." : "Upload Document"}</button>
                </div>
              </form>

              <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left">Title</th>
                      <th className="border-b p-2 text-left">Category</th>
                      <th className="border-b p-2 text-left">Size</th>
                      <th className="border-b p-2 text-left">Uploaded</th>
                      <th className="border-b p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc._id || doc.originalName}>
                        <td className="border-b p-2">{doc.title || doc.originalName}</td>
                        <td className="border-b p-2">{doc.category}</td>
                        <td className="border-b p-2">{Math.round((doc.size || 0) / 1024)} KB</td>
                        <td className="border-b p-2">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "-"}</td>
                        <td className="border-b p-2">
                          <a href={mediaFileUrl(doc.originalName)} target="_blank" rel="noreferrer" className="mr-2 rounded border px-2 py-1 text-xs">View</a>
                          {doc._id ? (
                            <button onClick={() => handleDeleteDoc(doc._id)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700">Delete</button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-brand-heading">Volunteer Certificates</h3>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border-b p-2 text-left">Certificate Title</th>
                      <th className="border-b p-2 text-left">File Name</th>
                      <th className="border-b p-2 text-left">Created</th>
                      <th className="border-b p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mongoCertificateAssets.length === 0 ? (
                      <tr>
                        <td className="border-b p-2 text-gray-500" colSpan={4}>No certificates found yet.</td>
                      </tr>
                    ) : (
                      mongoCertificateAssets.map((asset) => (
                        <tr key={asset._id || asset.originalName}>
                          <td className="border-b p-2">{asset.title || "-"}</td>
                          <td className="border-b p-2">{asset.originalName}</td>
                          <td className="border-b p-2">{asset.createdAt ? new Date(asset.createdAt).toLocaleString() : "-"}</td>
                          <td className="border-b p-2">
                            <a href={mediaFileUrl(asset.originalName)} target="_blank" rel="noreferrer" className="rounded border px-2 py-1 text-xs">View</a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="mongo" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-brand-heading">Saved Records (View Only)</h2>
                <p className="text-sm text-gray-600">View the details currently saved in your system.</p>
              </div>

              <div className="space-y-5">
                <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Projects ({projects.length})</h3>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="border-b p-2 text-left">Title</th>
                        <th className="border-b p-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p) => (
                        <tr key={p._id}>
                          <td className="border-b p-2">{p.title}</td>
                          <td className="border-b p-2">{String(p.description || p.shortDescriptionEn || "").slice(0, 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Team Members ({teamMembers.length})</h3>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="border-b p-2 text-left">Name</th>
                        <th className="border-b p-2 text-left">Bio / Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teamMembers.map((m) => (
                        <tr key={m._id}>
                          <td className="border-b p-2">{m.name}</td>
                          <td className="border-b p-2">{String(m.bio || m.role || "").slice(0, 100)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Other Documents ({mongoNonCertificateAssets.length})</h3>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="border-b p-2 text-left">Title</th>
                        <th className="border-b p-2 text-left">Category</th>
                        <th className="border-b p-2 text-left">File Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mongoNonCertificateAssets.map((asset) => (
                        <tr key={asset._id || asset.originalName}>
                          <td className="border-b p-2">{asset.title || "-"}</td>
                          <td className="border-b p-2">{asset.category || "general"}</td>
                          <td className="border-b p-2">{asset.originalName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[420px] rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-lg font-semibold text-brand-heading">Volunteer Certificates ({mongoCertificateAssets.length})</h3>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="border-b p-2 text-left">Title</th>
                        <th className="border-b p-2 text-left">Category</th>
                        <th className="border-b p-2 text-left">File Name</th>
                        <th className="border-b p-2 text-left">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mongoCertificateAssets.length === 0 ? (
                        <tr>
                          <td className="border-b p-2 text-gray-500" colSpan={4}>No volunteer certificates found yet.</td>
                        </tr>
                      ) : (
                        mongoCertificateAssets.map((asset) => (
                          <tr key={asset._id || asset.originalName}>
                            <td className="border-b p-2">{asset.title || "-"}</td>
                            <td className="border-b p-2">{asset.category || "certificate"}</td>
                            <td className="border-b p-2">{asset.originalName}</td>
                            <td className="border-b p-2">{asset.createdAt ? new Date(asset.createdAt).toLocaleString() : "-"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <div className="h-8" />
          </div>
        ) : null}
      </main>
    </div>
  );
}
