const API_URL = "http://localhost:8000/api";

export const getToken = () => localStorage.getItem("token");

export async function api(endpoint: string, method = "GET", body?: any) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
