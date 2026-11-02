import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { query } from "../db/pool.js";
import { requireAuth, signToken } from "../middleware/auth.js";

export const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const { rows } = await query(
      "SELECT id, username, password_hash, display_name, role FROM users WHERE username = $1",
      [parsed.data.username]
    );
    const user = rows[0];

    // Same response whether the user is unknown or the password is wrong, so
    // the endpoint does not reveal which usernames exist.
    const ok = user && (await bcrypt.compare(parsed.data.password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      token: signToken(user),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Lets the client validate a token held in localStorage on page load.
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, username, display_name, role FROM users WHERE id = $1",
      [req.user.sub]
    );
    if (!rows[0]) return res.status(401).json({ error: "User no longer exists" });

    const user = rows[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});
