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
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // 🔹 Fetch issues from backend on component mount
  useEffect(() => {
    fetchIssues();
  }, []);

  // 🔹 Fetch issues from backend
  const fetchIssues = async (filter: string | null = null) => {
    try {
      let url = `http://localhost:8000/issues?repo_id=1`;

      if (filter) {
        url += `&difficulty=${filter}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setIssues(data);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError("Failed to fetch issues");
    }
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

  // 🔹 Handle issue click
  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    // You can also navigate to a detailed view or open a modal
    console.log("Selected issue:", issue);
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
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
              className={difficultyFilter === null ? "active" : ""}
              onClick={() => {
                setDifficultyFilter(null);
                fetchIssues(null);
              }}
            >
              All
            </button>
          </div>

          {/* 🔹 Issues List */}
          <div className="issues-list" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {issues.length === 0 && <p>No issues found.</p>}

            {issues.map((issue) => (
              <div
                key={issue.id}
                className="issue-card"
                onClick={() => handleIssueClick(issue)}
                style={{ cursor: "pointer" }}
              >
                <h4>
                  #{issue.number} — {issue.title}
                </h4>

                <span className={`badge ${issue.difficulty.toLowerCase()}`}>
                  {issue.difficulty}
                </span>

                
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

          {/* 🔹 Selected Issue Detail */}
          {selectedIssue && (
            <div className="selected-issue">
              <h4>Selected Issue</h4>
              <p>
                <strong>#{selectedIssue.number}</strong> {selectedIssue.title}
              </p>
              <span className={`badge ${selectedIssue.difficulty.toLowerCase()}`}>
                {selectedIssue.difficulty}
              </span>
              <p>{selectedIssue.body}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;