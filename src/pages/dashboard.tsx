import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth";
import { authFetch } from "../api";
import "../components/dashboard.css";

type Repo = {
  id: number;
  name: string;
  status: string;
};

type Issue = {
  id: number;
  issue_number: number;
  title: string;
  body: string;
  difficulty: "Beginner" | "Moderate" | "Professional" | "Pending";
};

type SolutionStep = {
  step: number;
  title: string;
  explanation: string;
  file: string;
  action: string;
  verification: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = verifyToken();

  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const [solutionSteps, setSolutionSteps] = useState<SolutionStep[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔒 Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // 🔁 Load repos on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const res = await authFetch("http://localhost:8000/repositories");
      const data = await res.json();
      setRepositories(data);
    } catch (err) {
      console.error("Failed to fetch repositories", err);
    }
  };

  const fetchIssues = async (repoId: number, filter: string | null = null) => {
    try {
      let url = `http://localhost:8000/issues?repo_id=${repoId}`;
      if (filter) url += `&difficulty=${filter}`;

      const res = await authFetch(url);
      const data = await res.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch {
      setIssues([]);
    }
  };

  const analyzeRepo = async () => {
    if (!repoUrl) return;
    setLoading(true);

    try {
      await authFetch(
        `http://localhost:8000/analyze?repo_url=${encodeURIComponent(repoUrl)}`,
        { method: "POST" }
      );
      setRepoUrl("");
      fetchRepositories();
    } finally {
      setLoading(false);
    }
  };

  const deleteRepository = async (repoId: number) => {
    if (!window.confirm("Delete repository permanently?")) return;

    try {
      await authFetch(
        `http://localhost:8000/repositories/${repoId}`,
        { method: "DELETE" }
      );

      if (selectedRepo?.id === repoId) {
        setSelectedRepo(null);
        setIssues([]);
        setSelectedIssue(null);
        setSolutionSteps([]);
      }

      fetchRepositories();
    } catch {
      alert("Failed to delete repository");
    }
  };

  const handleRepoClick = (repo: Repo) => {
    setSelectedRepo(repo);
    setSelectedIssue(null);
    setSolutionSteps([]);
    fetchIssues(repo.id, difficultyFilter);
  };

  const handleIssueClick = async (issue: Issue) => {
    setSelectedIssue(issue);
    setSolutionSteps([]);

    try {
      const res = await authFetch(
        `http://localhost:8000/solutions/${issue.id}`
      );
      const data = await res.json();
      setSolutionSteps(Array.isArray(data.steps) ? data.steps : []);
    } catch {
      setSolutionSteps([]);
    }
  };

  const submitFeedback = async (stepNumber: number) => {
    const error = prompt("Paste the error output or explain what failed:");
    if (!error || !selectedIssue) return;

    try {
      await authFetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue_id: selectedIssue.id,
          step_number: stepNumber,
          error
        })
      });

      alert("Feedback submitted. AI will refine this step.");
      const res = await authFetch(
      `http://localhost:8000/solutions/${selectedIssue.id}`
    );
    const data = await res.json();

    setSolutionSteps(Array.isArray(data.steps) ? data.steps : []);
      
    } catch {
      alert("Failed to submit feedback");
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="logo">OCTOPUS</div>
        <div className="avatar">
          <img src={(user as any)?.avatar} />
        </div>
      </div>

      <div className="dashboard-content">
        {/* LEFT PANEL */}
        <div className="glass-card repo-panel">
          <h3>Repository Analyzer</h3>

          <input
            className="solver-input"
            placeholder="Paste GitHub repo URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <button className="solve-btn" onClick={analyzeRepo} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Repository"}
          </button>

          <h3 style={{ marginTop: 20 }}>Your Repositories</h3>

          {repositories.map((repo) => (
            <div key={repo.id} className="repo-item">
              <button className="repo-btn" onClick={() => handleRepoClick(repo)}>
                {repo.name}
                {repo.status !== "ready" && ` (${repo.status})`}
              </button>

              <button
                className="delete-repo-btn"
                onClick={() => deleteRepository(repo.id)}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        {/* MIDDLE PANEL */}
        <div className="glass-card middle-panel">
          <div className="middle-panel-content">
            {!selectedRepo && <p>Select a repository</p>}

            {selectedRepo && !selectedIssue && (
              <>
                <h3>Issues</h3>

                <div className="filter-bar">
                  {["Beginner", "Moderate", "Professional"].map((d) => (
                    <button
                      key={d}
                      className={difficultyFilter === d ? "active" : ""}
                      onClick={() => {
                        setDifficultyFilter(d);
                        fetchIssues(selectedRepo.id, d);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    className={!difficultyFilter ? "active" : ""}
                    onClick={() => {
                      setDifficultyFilter(null);
                      fetchIssues(selectedRepo.id);
                    }}
                  >
                    All
                  </button>
                </div>

                <div className="issues-list">
                  {issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="issue-card"
                      onClick={() => handleIssueClick(issue)}
                    >
                      <h4>
                        #{issue.issue_number} — {issue.title}
                      </h4>
                      <span
                        className={`badge ${issue.difficulty.toLowerCase()}`}
                      >
                        {issue.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {selectedIssue && (
              <>
                <button
                  className="back-btn"
                  onClick={() => {
                    setSelectedIssue(null);
                    setSolutionSteps([]);
                  }}
                >
                  ← Back
                </button>

                <h3>{selectedIssue.title}</h3>
                <p>{selectedIssue.body}</p>
              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="glass-card solver-panel">
          <h3>AI Solution</h3>

          {!selectedIssue && <p>Select an issue to get AI solution</p>}

          {selectedIssue && solutionSteps.length === 0 && (
            <p>Thinking…</p>
          )}

          {solutionSteps.map((step) => (
            <div key={step.step} className="solution-step">
              <h4>Step {step.step}: {step.title}</h4>

              <p><strong>Explanation:</strong> {step.explanation}</p>
              <p><strong>File:</strong> {step.file}</p>
              <p><strong>Action:</strong> {step.action}</p>
              <p><strong>Verify:</strong> {step.verification}</p>

              <button
                className="feedback-btn"
                onClick={() => submitFeedback(step.step)}
              >
                ❌ This step failed
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
