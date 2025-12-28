import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth";
import "../components/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = verifyToken();

  // ✅ Hooks MUST be inside component
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // ✅ Function MUST be inside component
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
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze repository");
      }

      const data = await response.json();
      setResult(data);
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
              <p><strong>Repo:</strong> {result.repo?.name}</p>
              <p><strong>Issues:</strong> {result.issues_ingested}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
