export const verifyToken = () => {
  const token = sessionStorage.getItem("github_token");
  if (!token) {
    console.log("No token found");
    return null;
  }

  try {
    // Decode JWT without verification (for frontend-only use)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("Invalid token format");
      return null;
    }

    // Decode the payload (second part)
    const decoded = JSON.parse(atob(parts[1]));
    console.log("Decoded token:", decoded);
    
    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log("Token expired");
      sessionStorage.clear();
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Token decode error:", error);
    sessionStorage.clear();
    return null;
  }
};
