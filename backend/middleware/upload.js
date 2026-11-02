import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

export const UPLOAD_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../uploads");

if (!existsSync(UPLOAD_DIR)) mkdirSync(UPLOAD_DIR, { recursive: true });

// Site reports and signed checklists — PDFs and photos of paperwork.
const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Never trust the client's filename on disk — it can contain path
    // separators or collide with an existing file. The original is kept
    // in the database for display instead.
    const ext = extname(file.originalname).slice(0, 10).replace(/[^.\w]/g, "");
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new UploadTypeError(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
}).single("document");

export class UploadTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = "UploadTypeError";
  }
}
