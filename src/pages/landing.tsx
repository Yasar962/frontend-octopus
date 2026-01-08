import { useState } from "react";
import "../components/landing.css";
import InteractiveBackground from "../components/InteractiveBackground";
import octorLogo from "../assets/Octor logo.svg";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const Landing = () => {
  const [showAbout, setShowAbout] = useState(false);

  const handleGitHubLogin = () => {
    window.location.href = `${API_BASE}/auth/github`;
  };

  return (
    <div className="landing-container">
      {/* Background */}
      <InteractiveBackground />

      {/* Watermark logo */}
      <div className="company-logo-bg">
        <img src={octorLogo} alt="Octor Logo" />
      </div>

      {/* Main card */}
      <div
        className="content-card tilt-card"
        onMouseMove={(e) => {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const rotateX = -(y - rect.height / 2) / 20;
          const rotateY = (x - rect.width / 2) / 20;

          card.style.transform = `
            perspective(1200px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateZ(10px)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform =
            "perspective(1200px) rotateX(0) rotateY(0)";
        }}
      >
        {/* Logo */}
        <div className="logo-center tilt-logo">
          <img src={octorLogo} alt="Octor AI" />
        </div>

        <p className="subtitle">
          Analyze repositories. Solve issues. Build smarter.
        </p>

        {/* How it works */}
        <div className="how-it-works">
          <div className="step">
            <span className="step-index">01</span>
            <div>
              <h4>Connect GitHub</h4>
              <p>
                Securely authenticate with GitHub using OAuth.
                No passwords, no manual setup.
              </p>
            </div>
          </div>

          <div className="step">
            <span className="step-index">02</span>
            <div>
              <h4>Octor Analyzes</h4>
              <p>
                Octor understands your repositories, issues,
                and code context using AI.
              </p>
            </div>
          </div>

          <div className="step">
            <span className="step-index">03</span>
            <div>
              <h4>Actionable Insights</h4>
              <p>
                Get intelligent issue summaries, fix
                recommendations, and clarity.
              </p>
            </div>
          </div>
        </div>

        {/* Value strip */}
        <div className="value-strip">
          <span>Built for developers</span>
          <span>AI-driven insights</span>
          <span>Secure OAuth</span>
        </div>

        {/* Actions */}
        <div className="action-group">
          <button className="github-btn" onClick={handleGitHubLogin}>
            Continue with GitHub
          </button>

          <button
            className="what-is-btn what-is-center"
            onClick={() => setShowAbout(true)}
          >
            What is Octor?
          </button>
        </div>
      </div>

      {/* Popover card (OUTSIDE the card – correct) */}
      {showAbout && (
        <>
          <div
            className="about-popover-overlay"
            onClick={() => setShowAbout(false)}
          />

          <div className="about-popover">
            <h3>What is Octor?</h3>

            <p>
              Octor is an AI-powered engineering assistant that understands
              GitHub repositories beyond syntax — it understands intent.
            </p>

            <p>
              It analyzes issues, pull requests, and code structure to
              generate contextual insights and intelligent fix
              recommendations.
            </p>

            <div className="about-points">
              <div>Repository-aware intelligence</div>
              <div>Contextual issue understanding</div>
              <div>Secure, permission-based GitHub access</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Landing;
