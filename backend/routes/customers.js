import { Router } from "express";
import { query } from "../db/pool.js";

export const customersRouter = Router();

customersRouter.get("/", async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        c.id, c.company, c.address, c.contact, c.email,
        count(r.id)::int AS "rentalCount"
      FROM customers c
      LEFT JOIN rentals r ON r.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.company
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

customersRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, company, address, contact, email FROM customers WHERE id = $1",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Customer not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
