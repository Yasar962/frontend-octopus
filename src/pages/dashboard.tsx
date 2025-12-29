import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth";
import "../components/dashboard.css";

type Issue = {
  id: number;
  number: number;
  title: string;
  body: string;
  difficulty: "Beginner" | "Moderate" | "Professional";
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = verifyToken();

  // Repo analysis
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Issues state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // 🔹 Fetch issues from backend
  const fetchIssues = async (filter: string | null = null) => {
    if (!result?.repo) return;

    const repoId = 1; // TEMP: replace with real repo_id later

    const url = filter
      ? `http://localhost:8000/issues?repo_id=${repoId}&difficulty=${filter}`
      : `http://localhost:8000/issues?repo_id=${repoId}`;

    const res = await fetch(url);
    const data = await res.json();
    setIssues(data);
  };

  // 🔹 Analyze repo (ingest issues)
  const analyzeRepo = async () => {
    if (!repoUrl) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8000/analyze?repo_url=${encodeURIComponent(repoUrl)}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze repository");
      }

      const data = await response.json();
      setResult(data);

      // 🔥 Immediately fetch issues after ingestion
      await fetchIssues(difficultyFilter);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Redirecting...</p>;

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">OCTOPUS</div>
        <div className="avatar">
          <img
            src={(user as any)?.avatar || "/placeholder-avatar.png"}
            alt={(user as any)?.username || "User"}
          />
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Panel */}
        <div className="glass-card repo-panel">
          <h3>Your Repositories</h3>
        </div>

        {/* Center Panel */}
        <div className="glass-card">
          <h3>Issues</h3>
          <p>Welcome {(user as any)?.username}</p>

          {/* 🔹 Difficulty Filter Bar */}
          <div className="filter-bar">
            {["Beginner", "Moderate", "Professional"].map((level) => (
              <button
                key={level}
                className={difficultyFilter === level ? "active" : ""}
                onClick={() => {
                  setDifficultyFilter(level);
                  fetchIssues(level);
                }}
              >
                {level}
              </button>
            ))}

            <button
              onClick={() => {
                setDifficultyFilter(null);
                fetchIssues(null);
              }}
            >
              All
            </button>
          </div>

          {/* 🔹 Issues List */}
          <div className="issues-list">
            {issues.length === 0 && <p>No issues found.</p>}

            {issues.map((issue) => (
              <div key={issue.id} className="issue-card">
                <h4>
                  #{issue.number} — {issue.title}
                </h4>

                <span className={`badge ${issue.difficulty.toLowerCase()}`}>
                  {issue.difficulty}
                </span>

                <p>{issue.body.slice(0, 200)}...</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="glass-card solver-panel">
          <h3>Repository Analyzer</h3>

          <input
            type="text"
            className="solver-input"
            placeholder="Paste GitHub repo URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <button
            className="solve-btn"
            onClick={analyzeRepo}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Repository"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {result && (
            <div className="analysis-result">
              <p>
                <strong>Repo:</strong> {result.repo?.name}
              </p>
              <p>
                <strong>Issues ingested:</strong> {result.issues_ingested}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
