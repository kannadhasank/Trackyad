import { Router } from "express";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { query } from "../db/pool.js";
import {
  createInstallationSchema,
  updateInstallationSchema,
} from "../schemas/installation.js";
import { UPLOAD_DIR, uploadDocument } from "../middleware/upload.js";

export const installationsRouter = Router();

const SELECT_INSTALLATION = `
  SELECT
    i.id, i.customer_id AS "customerId",
    i.installation_address AS "installationAddress",
    to_char(i.installation_date, 'YYYY-MM-DD') AS "installationDate",
    to_char(i.installation_time, 'HH24:MI')    AS "installationTime",
    i.device_model AS "deviceModel", i.serial_number AS "serialNumber",
    to_char(i.start_time, 'HH24:MI') AS "startTime",
    to_char(i.end_time,   'HH24:MI') AS "endTime",
    i.location, i.country, i.assigned_engineer AS "assignedEngineer",
    i.quotation_number AS "quotationNumber", i.po_number AS "poNumber",
    i.document_original AS "documentName",
    i.document_size     AS "documentSize",
    (i.document_filename IS NOT NULL) AS "hasDocument",
    jsonb_build_object('id', c.id, 'company', c.company) AS customer
  FROM installations i
  JOIN customers c ON c.id = i.customer_id
`;

// Multer runs before the handler and reports its own failures (size, type)
// through this wrapper, so they become 400s rather than crashing the request.
function withUpload(req, res, next) {
  uploadDocument(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File is larger than the 10 MB limit" });
    }
    if (err.name === "UploadTypeError") {
      return res.status(400).json({ error: `${err.message}. Allowed: PDF, JPEG, PNG, WebP, HEIC` });
    }
    next(err);
  });
}

// Removes an orphaned upload when the insert that should have referenced it fails.
async function discard(file) {
  if (file) await unlink(file.path).catch(() => {});
}

installationsRouter.get("/", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const params = [];
    let where = "";

    if (q) {
      params.push(`%${q}%`);
      where = `WHERE (
        i.id ILIKE $1 OR i.serial_number ILIKE $1 OR i.device_model ILIKE $1
        OR i.assigned_engineer ILIKE $1 OR i.installation_address ILIKE $1
        OR i.quotation_number ILIKE $1 OR i.po_number ILIKE $1 OR c.company ILIKE $1
      )`;
    }

    const { rows } = await query(
      `${SELECT_INSTALLATION} ${where} ORDER BY i.installation_date DESC, i.id DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

installationsRouter.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await query(`${SELECT_INSTALLATION} WHERE i.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Installation not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Streams the attached file back. Behind requireAuth like everything else —
// uploads are not served as static files, so they cannot be fetched by URL alone.
installationsRouter.get("/:id/document", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT document_filename, document_original, document_mimetype
       FROM installations WHERE id = $1`,
      [req.params.id]
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "Installation not found" });
    if (!row.document_filename) {
      return res.status(404).json({ error: "No document attached to this installation" });
    }

    res.type(row.document_mimetype ?? "application/octet-stream");
    res.sendFile(join(UPLOAD_DIR, row.document_filename), (err) => {
      if (err && !res.headersSent) {
        res.status(410).json({ error: "The stored file is missing from disk" });
      }
    });
  } catch (err) {
    next(err);
  }
});

// Accepts multipart/form-data: the fields plus an optional "document" file.
installationsRouter.post("/", withUpload, async (req, res, next) => {
  try {
    const parsed = createInstallationSchema.safeParse(req.body);
    if (!parsed.success) {
      await discard(req.file);
      return res
        .status(400)
        .json({ error: "Invalid installation", details: parsed.error.flatten() });
    }
    const v = parsed.data;
    const f = req.file;

    const { rows } = await query(
      `INSERT INTO installations (
         customer_id, installation_address, installation_date, installation_time,
         device_model, serial_number, start_time, end_time, location, country,
         assigned_engineer, quotation_number, po_number,
         document_filename, document_original, document_mimetype, document_size,
         document_uploaded_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
                 CASE WHEN $14::text IS NULL THEN NULL ELSE now() END)
       RETURNING id`,
      [
        v.customerId, v.installationAddress, v.installationDate, v.installationTime,
        v.deviceModel, v.serialNumber, v.startTime, v.endTime, v.location, v.country,
        v.assignedEngineer, v.quotationNumber, v.poNumber,
        f?.filename ?? null, f?.originalname ?? null, f?.mimetype ?? null, f?.size ?? null,
      ]
    );

    const created = await query(`${SELECT_INSTALLATION} WHERE i.id = $1`, [rows[0].id]);
    res.status(201).json(created.rows[0]);
  } catch (err) {
    // The row was never written, so the uploaded file would be orphaned.
    await discard(req.file);
    next(err);
  }
});

const UPDATABLE = {
  customerId: "customer_id",
  installationAddress: "installation_address",
  installationDate: "installation_date",
  installationTime: "installation_time",
  deviceModel: "device_model",
  serialNumber: "serial_number",
  startTime: "start_time",
  endTime: "end_time",
  location: "location",
  country: "country",
  assignedEngineer: "assigned_engineer",
  quotationNumber: "quotation_number",
  poNumber: "po_number",
};

installationsRouter.patch("/:id", withUpload, async (req, res, next) => {
  try {
    const parsed = updateInstallationSchema.safeParse(req.body);
    if (!parsed.success) {
      await discard(req.file);
      return res
        .status(400)
        .json({ error: "Invalid installation", details: parsed.error.flatten() });
    }

    const params = [req.params.id];
    const sets = [];

    for (const [key, value] of Object.entries(parsed.data)) {
      if (!(key in UPDATABLE)) continue;
      params.push(value);
      sets.push(`${UPDATABLE[key]} = $${params.length}`);
    }

    // Replacing the file: remember the old name so it can be deleted after.
    let previous = null;
    if (req.file) {
      const existing = await query(
        "SELECT document_filename FROM installations WHERE id = $1",
        [req.params.id]
      );
      previous = existing.rows[0]?.document_filename ?? null;

      for (const [col, val] of [
        ["document_filename", req.file.filename],
        ["document_original", req.file.originalname],
        ["document_mimetype", req.file.mimetype],
        ["document_size", req.file.size],
      ]) {
        params.push(val);
        sets.push(`${col} = $${params.length}`);
      }
      sets.push("document_uploaded_at = now()");
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: "No updatable fields supplied" });
    }

    const { rowCount } = await query(
      `UPDATE installations SET ${sets.join(", ")} WHERE id = $1`,
      params
    );
    if (rowCount === 0) {
      await discard(req.file);
      return res.status(404).json({ error: "Installation not found" });
    }

    if (previous) await unlink(join(UPLOAD_DIR, previous)).catch(() => {});

    const { rows } = await query(`${SELECT_INSTALLATION} WHERE i.id = $1`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    await discard(req.file);
    next(err);
  }
});

installationsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await query(
      "DELETE FROM installations WHERE id = $1 RETURNING document_filename",
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Installation not found" });

    // Don't leave the file behind once its row is gone.
    if (rows[0].document_filename) {
      await unlink(join(UPLOAD_DIR, rows[0].document_filename)).catch(() => {});
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
