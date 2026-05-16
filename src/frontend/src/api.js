// api.js
// All backend calls go through this module.
// VITE_API_BASE_URL is injected at build time from the environment
// (mapped from a Kubernetes ConfigMap in production).

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function apiFetch(path) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`HTTP ${response.status} — ${text}`);
  }

  return response.json();
}

export const checkHealth = () => apiFetch("/health");
export const checkStatus = () => apiFetch("/api/status");
export { BASE_URL };
