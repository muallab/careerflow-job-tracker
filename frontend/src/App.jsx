import { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function statusBg(status) {
  if (status === "WISHLIST") return "#e0f2fe";   // light blue
  if (status === "APPLIED") return "#ede9fe";    // light purple
  if (status === "INTERVIEW") return "#fef3c7";  // light yellow
  if (status === "OFFER") return "#dcfce7";      // light green
  return "#fee2e2";                               // light red (REJECTED)
}

function statusBorder(status) {
  if (status === "WISHLIST") return "rgba(2, 132, 199, 0.35)";
  if (status === "APPLIED") return "rgba(124, 58, 237, 0.30)";
  if (status === "INTERVIEW") return "rgba(217, 119, 6, 0.30)";
  if (status === "OFFER") return "rgba(22, 163, 74, 0.28)";
  return "rgba(220, 38, 38, 0.28)";
}

export default function App() {
  // -------------------
  // State
  // -------------------
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [newStatus, setNewStatus] = useState("WISHLIST");
  const [submitting, setSubmitting] = useState(false);

  // -------------------
  // Load jobs (READ)
  // -------------------
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
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  // -------------------
  // Derived UI data
  // -------------------
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

  // -------------------
  // CREATE
  // -------------------
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

      if (!res.ok) throw new Error(`Create failed: ${res.status}`);

      const created = await res.json();
      setJobs((prev) => [created, ...prev]);

      setCompany("");
      setTitle("");
      setNewStatus("WISHLIST");
    } catch (err) {
      setError(err?.message || "Could not create job.");
    } finally {
      setSubmitting(false);
    }
  }

  // -------------------
  // DELETE
  // -------------------
  async function handleDeleteJob(jobId) {
    const ok = window.confirm("Delete this job?");
    if (!ok) return;

    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      setError(err?.message || "Could not delete job.");
    }
  }

  // -------------------
  // UPDATE (PATCH status)
  // -------------------
  async function handleUpdateStatus(jobId, nextStatus) {
    try {
      setError("");

      const res = await fetch(`${API_BASE}/api/jobs/${jobId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);

      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
    } catch (err) {
      setError(err?.message || "Could not update status.");
    }
  }

  // -------------------
  // UI
  // -------------------
  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 980,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>CareerFlow</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>
            Track applications like a real product.
          </p>
        </div>

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {loading ? "Loading…" : `${filteredJobs.length} shown / ${jobs.length} total`}
        </div>
      </div>

      {/* Create form */}
      <form
        onSubmit={handleCreateJob}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 180px 140px",
          gap: 12,
          marginTop: 16,
          marginBottom: 12,
        }}
      >
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
          }}
        />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
          }}
        />

        <select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: `1px solid ${statusBorder(newStatus)}`,
            background: statusBg(newStatus),
            cursor: "pointer",
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
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.25)",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.7 : 1,
            background: "transparent",
            fontWeight: 600,
          }}
        >
          {submitting ? "Adding..." : "Add Job"}
        </button>
      </form>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or title…"
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
          }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.18)",
            minWidth: 170,
            cursor: "pointer",
            background: status === "ALL" ? "#f3f4f6" : statusBg(status),
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

      {/* Job cards */}
      <div style={{ display: "grid", gap: 12 }}>
        {filteredJobs.map((job) => (
          <div
            key={job.id}
            style={{
              padding: 14,
              borderRadius: 16,
              border: "1px solid rgba(0,0,0,0.14)",
              boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 750, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.company}
              </div>
              <div style={{ opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.title}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select
                value={job.status}
                onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 12,
                  border: `1px solid ${statusBorder(job.status)}`,
                  fontSize: 12,
                  background: statusBg(job.status),
                  cursor: "pointer",
                }}
              >
                <option value="WISHLIST">WISHLIST</option>
                <option value="APPLIED">APPLIED</option>
                <option value="INTERVIEW">INTERVIEW</option>
                <option value="OFFER">OFFER</option>
                <option value="REJECTED">REJECTED</option>
              </select>

              <button
                type="button"
                onClick={() => handleDeleteJob(job.id)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.22)",
                  cursor: "pointer",
                  background: "transparent",
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}