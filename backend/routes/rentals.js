import { Router } from "express";
import { query } from "../db/pool.js";
import {
  createRentalSchema,
  rentalQuerySchema,
  updateRentalSchema,
} from "../schemas/rental.js";

export const rentalsRouter = Router();

// Customer and partner are embedded here so the client never has to join.
// This is what replaces customerFor()/partnerFor() in src/utils/helpers.js.
const SELECT_RENTAL = `
  SELECT
    r.id, r.customer_id AS "customerId", r.partner_id AS "partnerId",
    r.part_number AS "partNumber", r.device_part_number AS "devicePartNumber",
    r.serial_number AS "serialNumber", r.site_address AS "siteAddress",
    to_char(r.rental_start,   'YYYY-MM-DD') AS "rentalStart",
    to_char(r.end_date,       'YYYY-MM-DD') AS "endDate",
    r.contract_number AS "contractNumber",
    to_char(r.contract_start, 'YYYY-MM-DD') AS "contractStart",
    to_char(r.contract_end,   'YYYY-MM-DD') AS "contractEnd",
    r.sla, r.invoice_number AS "invoiceNumber",
    r.payment_status AS "paymentStatus", r.status,
    jsonb_build_object('id', c.id, 'company', c.company) AS customer,
    jsonb_build_object('id', p.id, 'name',    p.name)    AS partner
  FROM rentals r
  JOIN customers c ON c.id = r.customer_id
  JOIN partners  p ON p.id = r.partner_id
`;

rentalsRouter.get("/", async (req, res, next) => {
  try {
    const parsed = rentalQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid filter", details: parsed.error.flatten() });
    }
    const { status, q } = parsed.data;

    const where = [];
    const params = [];

    if (status && status !== "all") {
      params.push(status);
      where.push(`r.status = $${params.length}`);
    }

    // Searches the customer company too — the client-side version of this
    // (RentalsPage.jsx) was broken and never matched a company name.
    if (q) {
      params.push(`%${q}%`);
      const i = params.length;
      where.push(`(
        r.id ILIKE $${i} OR r.serial_number ILIKE $${i} OR r.part_number ILIKE $${i}
        OR r.invoice_number ILIKE $${i} OR r.site_address ILIKE $${i}
        OR c.company ILIKE $${i} OR p.name ILIKE $${i}
      )`);
    }

    const sql = `${SELECT_RENTAL}
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY r.created_at DESC, r.id DESC`;

    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Must be declared before "/:id", or "stats" is swallowed as an id.
rentalsRouter.get("/stats", async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT
        count(*)                                        AS total,
        count(*) FILTER (WHERE status = 'active')       AS active,
        count(*) FILTER (WHERE status = 'ending_soon')  AS "endingSoon",
        count(*) FILTER (WHERE status = 'overdue')      AS overdue,
        count(*) FILTER (WHERE status = 'returned')     AS returned
      FROM rentals
    `);
    // Postgres count() comes back as a string; the UI wants numbers.
    res.json(Object.fromEntries(Object.entries(rows[0]).map(([k, v]) => [k, Number(v)])));
  } catch (err) {
    next(err);
  }
});

rentalsRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query(`${SELECT_RENTAL} WHERE r.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Rental not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

rentalsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createRentalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid rental", details: parsed.error.flatten() });
    }
    const r = parsed.data;

    // Derived server-side — this logic used to live in RentalsPage.handleSave,
    // where the contract number came from Math.random().
    const contractNumber = `CTR-${Date.now().toString().slice(-6)}`;

    const { rows } = await query(
      `INSERT INTO rentals (
         customer_id, partner_id, part_number, device_part_number, serial_number,
         site_address, rental_start, end_date, contract_number, contract_start,
         contract_end, sla, invoice_number, payment_status, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$7,$8,$10,$11,$12,$13)
       RETURNING id`,
      [
        r.customerId, r.partnerId, r.partNumber, r.partNumber, r.serialNumber,
        r.siteAddress, r.rentalStart, r.endDate, contractNumber,
        r.sla ?? "Next business day", r.invoiceNumber, r.paymentStatus, r.status,
      ]
    );

    const created = await query(`${SELECT_RENTAL} WHERE r.id = $1`, [rows[0].id]);
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

const UPDATABLE = {
  customerId: "customer_id",
  partnerId: "partner_id",
  partNumber: "part_number",
  serialNumber: "serial_number",
  siteAddress: "site_address",
  rentalStart: "rental_start",
  endDate: "end_date",
  invoiceNumber: "invoice_number",
  paymentStatus: "payment_status",
  status: "status",
  sla: "sla",
};

rentalsRouter.patch("/:id", async (req, res, next) => {
  try {
    const parsed = updateRentalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid rental", details: parsed.error.flatten() });
    }

    const entries = Object.entries(parsed.data).filter(([k]) => k in UPDATABLE);
    if (entries.length === 0) {
      return res.status(400).json({ error: "No updatable fields supplied" });
    }

    const params = [req.params.id];
    const sets = entries.map(([key, value]) => {
      params.push(value);
      return `${UPDATABLE[key]} = $${params.length}`;
    });

    const { rowCount } = await query(
      `UPDATE rentals SET ${sets.join(", ")} WHERE id = $1`,
      params
    );
    if (rowCount === 0) return res.status(404).json({ error: "Rental not found" });

    const { rows } = await query(`${SELECT_RENTAL} WHERE r.id = $1`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

rentalsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await query("DELETE FROM rentals WHERE id = $1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: "Rental not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
