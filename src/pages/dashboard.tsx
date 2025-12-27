import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyToken } from "../auth.ts";
import "../components/dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = verifyToken();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return <p>Redirecting...</p>;

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="logo">OCTOPUS</div>
        <div className="avatar">
          <img src={user.avatar} alt={user.username} />
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Panel - Repositories */}
        <div className="glass-card repo-panel">
          <h3>Your Repositories</h3>
          <ul>
            <li>Repository 1</li>
            <li>Repository 2</li>
            <li>Repository 3</li>
          </ul>
        </div>

        {/* Center Panel - Issues */}
        <div className="glass-card">
          <h3>Issues</h3>
          <div className="issue active">
            <h4>Welcome {user.username}</h4>
            <p>GitHub ID: {user.github_id}</p>
          </div>
        </div>

        {/* Right Panel - Solver */}
        <div className="glass-card solver-panel">
          <h3>AI Solver</h3>
          <p>Select an issue to get AI-powered suggestions</p>
          <input 
            type="text" 
            className="solver-input" 
            placeholder="Ask something about this issue..." 
          />
          <button className="solve-btn">Get Solution</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
