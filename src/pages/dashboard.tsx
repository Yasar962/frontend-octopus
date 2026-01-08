import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth";
import { authFetch } from "../api";
import "../components/dashboard.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import octorLogoHorizontal from "../assets/Octor logo horizontal.svg";

const API_BASE = import.meta.env.VITE_API_BASE_URL;



type Repo = {
  issues_classified: number;
  id: number;
  name: string;
  status: string;
  analysis_stage?: string;
  issues_ingested?: number;
};

type Issue = {
  id: number;
  issue_number: number;
  title: string;
  body: string;
  difficulty: "Beginner" | "Moderate" | "Professional" | "Pending";
  image_url?: string;
};

type SolutionStep = {
  step: number;
  title: string;
  explanation: string;
  file: string;
  action: string;
  verification: string;
};
const extractImageUrls = (text: string): string[] => {
  if (!text) return [];

  const urls = new Set<string>();

  // Markdown images: ![alt](url)
  const markdownRegex = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)/gi;
  let match;
  while ((match = markdownRegex.exec(text)) !== null) {
    urls.add(match[1]);
  }

  // HTML images: <img src="url" />
  const htmlRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  while ((match = htmlRegex.exec(text)) !== null) {
    urls.add(match[1]);
  }

  // Raw image URLs (fallback)
  const rawRegex = /(https?:\/\/[^\s]+?\.(png|jpg|jpeg|gif|webp))/gi;
  while ((match = rawRegex.exec(text)) !== null) {
    urls.add(match[1]);
  }

  return Array.from(urls);
};

const stripImagesFromMarkdown = (text: string): string => {
  if (!text) return "";

  return text
    // Markdown images
    .replace(/!\[[^\]]*\]\([^)]+\)/gi, "")
    // HTML images
    .replace(/<img[^>]*>/gi, "")
    .trim();
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

  // 🔹 Avatar menu
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 🔹 WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);

  // 🔒 Fetch GitHub Repos
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);


  const fetchGitHubRepos = async () => {
    try {
      const res = await authFetch("/github/repos");
      const data = await res.json();
      setGithubRepos(data);
    } catch {
      console.error("Failed to load GitHub repos");
    }
  };

  useEffect(() => {
    fetchGitHubRepos();
  }, []);

  // 🔒 Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  // 🔁 Close avatar menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 🔁 Load repositories ONCE (no polling)
  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const res = await authFetch("/repositories");
      const data = await res.json();
      setRepositories(data);
    } catch (err) {
      console.error("Failed to fetch repositories", err);
    }
  };

  const fetchIssues = async (repoId: number, filter: string | null = null) => {
    try {
      let url = `/issues?repo_id=${repoId}`;
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
        `/analyze?repo_url=${encodeURIComponent(repoUrl)}`,
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
        `/repositories/${repoId}`,
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

  // 🔌 WebSocket connection (NO polling fallback)
  const connectWS = (repoId: number) => {
    if (wsRef.current) wsRef.current.close();

    const wsBase = import.meta.env.VITE_API_BASE_URL.replace(/^http/, "ws");
    wsRef.current = new WebSocket(`${wsBase}/ws/progress/${repoId}`);

    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setRepositories((prev) =>
        prev.map((r) =>
          r.id === repoId
            ? {
                ...r,
                issues_ingested: data.issues_ingested ?? r.issues_ingested,
                issues_classified: data.issues_classified ?? r.issues_classified,
              }
            : r
        )
      );
    };
  };


  const handleRepoClick = (repo: Repo) => {
    setSelectedRepo(repo);
    setSelectedIssue(null);
    setSolutionSteps([]);
    fetchIssues(repo.id, difficultyFilter);
    connectWS(repo.id);
  };

  const handleIssueClick = async (issue: Issue) => {
    setSelectedIssue(issue);
    setSolutionSteps([]);

    try {
      const res = await authFetch(
        `/solutions/${issue.id}`
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
      await authFetch("/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issue_id: selectedIssue.id,
          step_number: stepNumber,
          error,
        }),
      });

      const res = await authFetch(
        `/solutions/${selectedIssue.id}`
      );
      const data = await res.json();
      setSolutionSteps(Array.isArray(data.steps) ? data.steps : []);
    } catch {
      alert("Failed to submit feedback");
    }
  };

  // 🔹 Avatar actions
  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const switchAccount = () => {
    sessionStorage.clear();
    window.location.href = `${API_BASE}/auth/github`;
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* TOP BAR */}
      <div className="top-bar">
        <div className="logo-container">
          <img
            src={octorLogoHorizontal}
            alt="Octor"
            className="logo-image"
          />
        </div>


        <div className="avatar-wrapper" ref={menuRef}>
          <img
            src={(user as any)?.avatar}
            className="avatar-img"
            onClick={() => setMenuOpen(!menuOpen)}
          />

          {menuOpen && (
            <div className="avatar-menu">
              <div className="avatar-menu-header">
                <img src={(user as any)?.avatar} />
                <div>
                  <strong>{(user as any)?.login || "GitHub User"}</strong>
                  <small>Connected</small>
                </div>
              </div>

              <button
                onClick={() => {
                  const username = (user as any)?.login;
                  if (username) {
                    window.open(`https://github.com/${username}`, "_blank");
                  }
                }}
              >
                Profile
              </button>


              <button onClick={switchAccount}>Switch Account</button>

              <button className="danger" onClick={logout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div
  className={`dashboard-content ${
    selectedIssue ? "issue-selected" : ""
  }`}
>

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

          <div className="repo-dropdown">
            <button
              className="dropdown-btn"
              onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
            >
              ▼ Select from your GitHub repositories
            </button>

            {repoDropdownOpen && (
              <div className="dropdown-list">
                {githubRepos.map((r) => (
                  <div
                    key={r.full_name}
                    className="dropdown-item"
                    onClick={() => {
                      setRepoUrl(r.url);
                      setRepoDropdownOpen(false);
                    }}
                  >
                    <strong>{r.name}</strong>
                    <small>{r.private ? "Private" : "Public"}</small>
                  </div>
                ))}
              </div>
            )}
          </div>


          <h3 style={{ marginTop: 20 }}>Your Repositories</h3>

          {repositories.map((repo) => (
            <div key={repo.id} className="repo-item">
              <button
                className="repo-btn"
                onClick={() => handleRepoClick(repo)}
              >
                <div className="repo-name">{repo.name}</div>

                <div className="repo-meta">
                  <div className="repo-progress-line">
                    <span className="repo-label">Ingested:</span>
                    <span className="repo-value">{repo.issues_ingested ?? 0}</span>
                  </div>

                  <div className="repo-progress-line">
                    <span className="repo-label">Classified:</span>
                    <span className="repo-value">{repo.issues_classified ?? 0}</span>
                  </div>
                </div>


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
            {!selectedRepo && (
              <p style={{ opacity: 0.7 }}>
                Select a repository to view issues and insights
              </p>
            )}


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
                      fetchIssues(selectedRepo.id, null);
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

<div className="issue-markdown">
  <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    code({ className, children }) {
      const isBlock = className?.includes("language-");

      if (isBlock) {
        return (
          <pre className="code-block">
            <code>{children}</code>
          </pre>
        );
      }

      return (
        <code className="inline-code">
          {children}
        </code>
      );
    },
  }}
>
  {stripImagesFromMarkdown(selectedIssue.body)}
</ReactMarkdown>

</div>




{extractImageUrls(selectedIssue.body).length > 0 && (
  <div className="issue-images">
    {extractImageUrls(selectedIssue.body).map((url, index) => (
      <img
  key={index}
  src={url}
  alt="Issue attachment"
  className="issue-image clickable"
  loading="lazy"
  onClick={() => setPreviewImage(url)}
  onError={(e) => {
    e.currentTarget.style.display = "none";
  }}
/>

    ))}
  </div>
)}

              </>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="glass-card solver-panel">
          <h3>AI Solution</h3>

          {!selectedIssue && <p>Select an issue to get AI solution</p>}

          {selectedIssue && solutionSteps.length === 0 && <p>Thinking…</p>}

          {solutionSteps.map((step) => (
            <div key={step.step} className="solution-step">
              <h4>
                Step {step.step}: {step.title}
              </h4>

              <p>
                <strong>Explanation:</strong> {step.explanation}
              </p>
              <p>
                <strong>File:</strong> {step.file}
              </p>
              <p>
                <strong>Action:</strong>
              </p>
              <pre className="code-block">{step.action}</pre>

              <p>
                <strong>Verify:</strong> {step.verification}
              </p>

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
      {previewImage && (
  <div
    className="image-preview-overlay"
    onClick={() => setPreviewImage(null)}
  >
    <img
      src={previewImage}
      className="image-preview"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}

    </div>
  );
};

export default Dashboard;
