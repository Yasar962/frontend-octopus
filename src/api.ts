export const authFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = sessionStorage.getItem("github_token");

  if (!token) {
    throw new Error("No auth token found");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  return res;
};
