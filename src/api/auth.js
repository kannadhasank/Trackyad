import { request, setToken } from "./client.js";

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
  setToken(data.token);
  return data.user;
}

// Validates a token restored from localStorage on page load.
export async function fetchCurrentUser() {
  const data = await request("/auth/me");
  return data.user;
}

export function logout() {
  setToken(null);
}
