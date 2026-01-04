const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  throw new Error("VITE_API_BASE_URL is not defined");
}

export const authFetch = async (
  path: string,
  options: RequestInit = {}
) => {
  const token = sessionStorage.getItem("github_token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const headers: HeadersInit = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  return res;
};
