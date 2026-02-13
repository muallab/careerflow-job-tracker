import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [newStatus, setNewStatus] = useState("WISHLIST");
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/jobs/`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(jobs.map((j) => j.status))).sort();
    return ["ALL", ...unique];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        q.length === 0 ||
        job.company.toLowerCase().includes(q) ||
        job.title.toLowerCase().includes(q);

      const matchesStatus = status === "ALL" || job.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [jobs, query, status]);

  async function handleCreateJob(e) {
  e.preventDefault();

  if (!company.trim() || !title.trim()) {
    setError("Company and title are required.");
    return;
  }

  try {
    setSubmitting(true);
    setError("");

    const res = await fetch(`${API_BASE}/api/jobs/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: company.trim(),
        title: title.trim(),
        status: newStatus,
      }),
    });

    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }

    const created = await res.json();

    setJobs((prev) => [created, ...prev]);

    setCompany("");
    setTitle("");
    setNewStatus("WISHLIST");
  } catch (err) {
    setError("Could not create job.");
  } finally {
    setSubmitting(false);
  }
}


  return (
    <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 8 }}>CareerFlow</h1>
      <form
  onSubmit={handleCreateJob}
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr 180px 140px",
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  }}
>
  <input
    value={company}
    onChange={(e) => setCompany(e.target.value)}
    placeholder="Company"
    style={{
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.2)",
    }}
  />

  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Title"
    style={{
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.2)",
    }}
  />

  <select
    value={newStatus}
    onChange={(e) => setNewStatus(e.target.value)}
    style={{
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.2)",
    }}
  >
    <option value="WISHLIST">WISHLIST</option>
    <option value="APPLIED">APPLIED</option>
    <option value="INTERVIEW">INTERVIEW</option>
    <option value="OFFER">OFFER</option>
    <option value="REJECTED">REJECTED</option>
  </select>

  <button
    type="submit"
    disabled={submitting}
    style={{
      padding: "10px 12px",
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.25)",
      cursor: submitting ? "not-allowed" : "pointer",
      opacity: submitting ? 0.7 : 1,
    }}
  >
    {submitting ? "Adding..." : "Add Job"}
  </button>
</form>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Track applications like a real product.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 16, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or title…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.2)",
            minWidth: 170,
          }}
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && filteredJobs.length === 0 && (
        <p>No matching jobs. Try clearing the search or filter.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.15)",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{job.company}</div>
              <div style={{ opacity: 0.85 }}>{job.title}</div>
            </div>

            <div
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.2)",
                fontSize: 12,
                whiteSpace: "nowrap",
              }}
            >
              {job.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
