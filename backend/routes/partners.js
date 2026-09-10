import { Router } from "express";
import { query } from "../db/pool.js";

export const partnersRouter = Router();

partnersRouter.get("/", async (_req, res, next) => {
  try {
    // rentalCount replaces the per-row RENTALS.filter() in PartnersPage.jsx.
    const { rows } = await query(`
      SELECT
        p.id, p.name, p.address, p.city, p.country, p.email, p.contact,
        count(r.id)::int AS "rentalCount"
      FROM partners p
      LEFT JOIN rentals r ON r.partner_id = p.id
      GROUP BY p.id
      ORDER BY p.name
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

partnersRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, name, address, city, country, email, contact FROM partners WHERE id = $1",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Partner not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
