import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// Rejects anything without a valid Bearer token. Applied to every route except login.
export function requireAuth(req, res, next) {
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    // Covers both a tampered signature and an expired token; the client
    // treats any 401 the same way — clear the token and return to login.
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
