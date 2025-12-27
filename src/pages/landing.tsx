import "../components/landing.css";

const Landing = () => {
  const handleGitHubLogin = () => {
    // Let the backend handle the GitHub OAuth flow
    window.location.href = "http://localhost:8000/auth/github";
  };

  return (
    <div className="landing-container">
      <div className="overlay" />

      <div className="login-card">
        <h1 className="title">OCTOPUS</h1>
        <p className="subtitle">
          Analyze repositories. Solve issues. Build smarter.
        </p>

        <button className="github-btn" onClick={handleGitHubLogin}>
          <svg
            className="github-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56v-2.04c-3.2.7-3.87-1.37-3.87-1.37-.53-1.35-1.29-1.71-1.29-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.73 1.26 3.4.96.1-.75.41-1.26.74-1.55-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.19-3.07-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.17.92-.26 1.9-.38 2.88-.38.98 0 1.96.13 2.88.38 2.21-1.48 3.18-1.17 3.18-1.17.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.07 0 4.4-2.69 5.36-5.25 5.64.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.5 11.5 0 0023.5 12C23.5 5.73 18.27.5 12 .5z" />
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  );
};

export default Landing;
