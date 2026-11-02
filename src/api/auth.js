import { request, setToken, getToken, isInfraError, isMockMode } from "./client.js";

// ── Dev mock credentials (mirrors backend/scripts/seed.js) ──────────────────
const MOCK_USER = {
  id: 1,
  username: "j.tan",
  displayName: "j.tan · Operations",
  role: "admin",
};
const MOCK_PASSWORD = "trackyad-dev";
const MOCK_TOKEN = "mock-dev-token";

export async function login(username, password) {
  // On GitHub Pages (or VITE_MOCK_MODE=true) there is no backend at all —
  // skip the fetch entirely to avoid a 405 Method Not Allowed.
  if (!isMockMode) {
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: { username, password },
        auth: false,
      });
      setToken(data.token);
      return data.user;
    } catch (err) {
      // If the backend exists but the DB is down, fall through to mock below.
      if (!isInfraError(err)) throw err;
    }
  }

  // ── Mock credential check (no backend / DB unavailable) ──────────────────
  if (username === MOCK_USER.username && password === MOCK_PASSWORD) {
    setToken(MOCK_TOKEN);
    return MOCK_USER;
  }
  throw new Error("Invalid username or password");
}

// Validates a token restored from localStorage on page load.
export async function fetchCurrentUser() {
  // If we stored the mock token (no backend / GitHub Pages / Vercel), restore directly.
  if (getToken() === MOCK_TOKEN || isMockMode) return MOCK_USER;

  const data = await request("/auth/me");
  return data.user;
}

export function logout() {
  setToken(null);
}
