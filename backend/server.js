import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { requireAuth } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { rentalsRouter } from "./routes/rentals.js";
import { customersRouter } from "./routes/customers.js";
import { partnersRouter } from "./routes/partners.js";
import { installationsRouter } from "./routes/installations.js";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);

// Everything below requires a valid token.
app.use("/api/rentals", requireAuth, rentalsRouter);
app.use("/api/customers", requireAuth, customersRouter);
app.use("/api/partners", requireAuth, partnersRouter);
app.use("/api/installations", requireAuth, installationsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Postgres constraint violations are client errors, not 500s.
app.use((err, _req, res, _next) => {
  // Infrastructure problems, not bugs — say so plainly instead of "Internal
  // server error", which sends people hunting through application code.
  const unreachable = {
    ECONNREFUSED: "Cannot reach PostgreSQL. Is the server running?",
    "28000": "PostgreSQL rejected the connection — the database role may not exist.",
    "28P01": "PostgreSQL authentication failed — check DATABASE_URL.",
    "3D000": "The database does not exist. Run: createdb trackyad_dev",
    "42P01": "Tables are missing. Run: npm run migrate",
  }[err.code];

  if (unreachable) {
    console.error(`Database unavailable (${err.code}): ${err.message}`);
    return res.status(503).json({ error: unreachable });
  }

  if (err.code === "23503") {
    return res.status(400).json({ error: "Referenced customer or partner does not exist" });
  }
  if (err.code === "23505") {
    return res.status(409).json({ error: "That record already exists" });
  }
  if (err.code === "23514") {
    return res.status(400).json({ error: "A field failed a database constraint" });
  }
  if (err.code === "22P02") {
    return res.status(400).json({ error: "Invalid value for one of the fields" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`Trackyad API listening on http://localhost:${config.port}`);
});
