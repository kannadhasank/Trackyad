import pg from "pg";
import { config } from "../config.js";

// Single shared pool for the process. Every query in the app goes through this.
export const pool = new pg.Pool({ connectionString: config.databaseUrl });

pool.on("error", (err) => {
  console.error("Unexpected error on idle postgres client:", err);
});

export function query(text, params) {
  return pool.query(text, params);
}

// Runs fn inside a transaction, releasing the client either way.
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
