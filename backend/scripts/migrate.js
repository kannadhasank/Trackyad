// Applies numbered .sql files from db/migrations in order, once each.
// Deliberately tiny — no migration library, so the SQL stays the source of truth.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool, withTransaction } from "../db/pool.js";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "../../db/migrations");

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await pool.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));

  const files = (await readdir(migrationsDir)).filter((f) => f.endsWith(".sql")).sort();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log(`Nothing to apply — ${files.length} migration(s) already up to date.`);
    return;
  }

  for (const file of pending) {
    const sql = await readFile(join(migrationsDir, file), "utf8");
    // Each migration is one transaction: a failure leaves nothing half-applied.
    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    });
    console.log(`applied ${file}`);
  }

  console.log(`Done — ${pending.length} migration(s) applied.`);
}

main()
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
