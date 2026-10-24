// Base URL of the backend API, e.g. http://localhost:8000/api
// Set it in a .env file (see .env.example). If it is left empty the portal runs
// in demo mode and never contacts a backend.
//
// Avoid ports 6000 and 6665-6669: browsers block them (ERR_UNSAFE_PORT).
const BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

export const isBackendEnabled = BASE_URL !== "";

// Login token issued by the backend (kept for the signed-in session).
const TOKEN_KEY = "token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

async function request(path, { auth = false, headers = {}, ...options } = {}) {
  const authHeaders = auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {};

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...authHeaders },
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // Response had no JSON body.
  }

  if (!res.ok) {
    const error = new Error(data?.message || data?.error || `Request failed (${res.status}).`);
    error.status = res.status;
    throw error;
  }
  return data;
}

const postJson = (path, body) =>
  request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const registerUser = (name, email, password) =>
  postJson("/auth/register", { name, email, password });

export const loginUser = (email, password) =>
  postJson("/auth/login", { email, password });

export const getAttendance = (userId) => request(`/attendance/${userId}`, { auth: true });
