import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/jobs/`);
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

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

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>CareerFlow – Jobs</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {!loading && !error && jobs.length === 0 && <p>No jobs yet.</p>}

      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <strong>{job.company}</strong> — {job.title} ({job.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
