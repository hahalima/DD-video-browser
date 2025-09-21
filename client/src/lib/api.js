const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function apiGet(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    signal: options.signal,
    headers: { Accept: "application/json", ...(options.headers || {}) },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}
