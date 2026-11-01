// Tiny fetch wrapper around the Spring Boot backend.
// Attaches the JWT from localStorage as a Bearer token.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

export function getToken() {
  return localStorage.getItem("pc_token");
}

export function setSession(token, user) {
  localStorage.setItem("pc_token", token);
  localStorage.setItem("pc_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("pc_token");
  localStorage.removeItem("pc_user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("pc_user"));
  } catch {
    return null;
  }
}

export async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE_URL + path, { ...options, headers });

  if (res.status === 401) clearSession();
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const t = await res.text();
      if (t) msg = t;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// <img> tags can't send Authorization headers, so image bytes are
// fetched with the token and turned into an object URL.
export async function imageObjectUrl(id) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/images/${id}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Could not load image");
  return URL.createObjectURL(await res.blob());
}
