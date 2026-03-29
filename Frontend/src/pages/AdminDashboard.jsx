import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../context/AuthContext";

const DEFAULT_STATS = {
  team: 0,
  projects: 0,
  lastLogin: null,
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError("");
        const statsResponse = await axiosInstance.get("/api/admin/stats");
        setStats({ ...DEFAULT_STATS, ...statsResponse.data });
      } catch (err) {
        const message = err.response?.data?.error || "Could not load admin stats.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const cards = [
    { label: "Team Members", value: stats.team },
    { label: "Projects", value: stats.projects },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-brand-primary md:px-10">
      <section className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl bg-white p-6 shadow-md md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-brand-heading">Admin Panel</h1>
              <p className="mt-1 text-sm text-brand-secondary">
                Logged in as {user?.email || "admin"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-xl bg-white p-10 text-center shadow-md">
              <p className="text-lg text-brand-secondary">Loading admin data...</p>
            </div>
          ) : null}

          {error ? (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : null}

          {!isLoading && !error ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <article key={card.label} className="rounded-xl bg-white p-5 shadow-md">
                  <p className="text-sm text-brand-secondary">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-brand-heading">{card.value}</p>
                </article>
              ))}
            </div>
          ) : null}

          <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold text-brand-heading">Last Login</h2>
            <p className="mt-2 text-brand-secondary">
              {stats.lastLogin ? new Date(stats.lastLogin).toLocaleString() : "No previous login recorded"}
            </p>
          </div>
      </section>
    </main>
  );
}