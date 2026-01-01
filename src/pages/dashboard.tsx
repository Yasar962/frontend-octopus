import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth";
import "../components/dashboard.css";

type Repo = {
  id: number;
  name: string;
  status: string;
};

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

  const [repoUrl, setRepoUrl] = useState("");
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    const res = await fetch("http://localhost:8000/repositories");
    setRepositories(await res.json());
  };

  const fetchIssues = async (repoId: number, filter: string | null = null) => {
    let url = `http://localhost:8000/issues?repo_id=${repoId}`;
    if (filter) url += `&difficulty=${filter}`;
    const res = await fetch(url);
    setIssues(await res.json());
  };

  // 🔁 Poll while analyzing
  useEffect(() => {
    if (!selectedRepo) return;

    fetchIssues(selectedRepo.id, difficultyFilter);

    if (selectedRepo.status === "analyzing" || selectedRepo.status === "queued") {
      const interval = setInterval(() => {
        fetchRepositories();
        fetchIssues(selectedRepo.id, difficultyFilter);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [selectedRepo, difficultyFilter]);

  const analyzeRepo = async () => {
    if (!repoUrl) return;
    setLoading(true);

    await fetch(
      `http://localhost:8000/analyze?repo_url=${encodeURIComponent(repoUrl)}`,
      { method: "POST" }
    );

    setRepoUrl("");
    setLoading(false);
    fetchRepositories();
  };

  const deleteRepository = async (repoId: number) => {
    const confirmed = window.confirm("Delete repository permanently?");
    if (!confirmed) return;

    await fetch(`http://localhost:8000/repositories/${repoId}`, {
      method: "DELETE",
    });

    if (selectedRepo?.id === repoId) {
      setSelectedRepo(null);
      setIssues([]);
      setSelectedIssue(null);
      setSolution("");
    }

    fetchRepositories();
  };

  const handleRepoClick = (repo: Repo) => {
    setSelectedRepo(repo);
    setSelectedIssue(null);
    setSolution("");
  };

  const handleIssueClick = async (issue: Issue) => {
    setSelectedIssue(issue);
    setSolution("Thinking...");

    const res = await fetch(`http://localhost:8000/solutions/${issue.id}`);
    const data = await res.json();

    const formatted = data.steps
      .map(
        (s: any) =>
          `Step ${s.step}: ${s.title}\n` +
          `• Explanation: ${s.explanation}\n` +
          `• File: ${s.file}\n` +
          `• Action: ${s.action}\n` +
          `• Verify: ${s.verification}\n`
      )
      .join("\n");

    setSolution(formatted);
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="logo">OCTOPUS</div>
        <div className="avatar">
          <img src={(user as any)?.avatar} />
        </div>
      </div>

      <div className="dashboard-content">
        <div className="glass-card repo-panel">
          <h3>Repository Analyzer</h3>

          <input
            className="solver-input"
            placeholder="Paste GitHub repo URL..."
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <button className="solve-btn" onClick={analyzeRepo} disabled={loading}>
            {loading ? "Queued..." : "Analyze Repository"}
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

        <div className="glass-card middle-panel">
          <div className="middle-panel-content">
            {!selectedRepo && <p>Select a repository</p>}

            {selectedRepo && !selectedIssue && (
              <>
                <h3>Issues</h3>

                {selectedRepo.status !== "ready" && (
                  <p>🔄 Issues are loading progressively...</p>
                )}

                <div className="filter-bar">
                  {["Beginner", "Moderate", "Professional"].map((d) => (
                    <button
                      key={d}
                      className={difficultyFilter === d ? "active" : ""}
                      onClick={() => setDifficultyFilter(d)}
                    >
                      {d}
                    </button>
                  ))}
                  <button
                    className={!difficultyFilter ? "active" : ""}
                    onClick={() => setDifficultyFilter(null)}
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
                        #{issue.number} — {issue.title}
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
                <button className="back-btn" onClick={() => setSelectedIssue(null)}>
                  ← Back
                </button>
                <h3>{selectedIssue.title}</h3>
                <p>{selectedIssue.body}</p>
              </>
            )}
          </div>
        </div>

        <div className="glass-card solver-panel">
          <h3>AI Solution</h3>
          {!selectedIssue ? (
            <p>Select an issue</p>
          ) : (
            <pre style={{ whiteSpace: "pre-wrap" }}>{solution}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
