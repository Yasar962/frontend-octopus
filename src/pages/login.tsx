import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "../pages/landing.tsx";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const token = sessionStorage.getItem("github_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to Octopus</h1>
      <Landing />
    </div>
  );
};

export default Login;
