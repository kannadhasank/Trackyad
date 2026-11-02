// Seeds dev data straight from the frontend's mock arrays, so the database
// matches what the UI showed before the API existed.
import bcrypt from "bcrypt";
import { pool, withTransaction } from "../db/pool.js";
import { PARTNERS, CUSTOMERS, RENTALS, INSTALLATIONS } from "../../src/data/mockData.js";

const SEED_USER = {
  username: process.env.SEED_USER ?? "j.tan",
  password: process.env.SEED_PASSWORD ?? "trackyad-dev",
  displayName: "j.tan · Operations",
};

async function main() {
  await withTransaction(async (client) => {
    // Idempotent: re-running refreshes rows rather than erroring on the PK.
    for (const p of PARTNERS) {
      await client.query(
        `INSERT INTO partners (id, name, address, city, country, email, contact)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city,
           country = EXCLUDED.country, email = EXCLUDED.email, contact = EXCLUDED.contact`,
        [p.id, p.name, p.address, p.city, p.country, p.email, p.contact]
      );
    }

    for (const c of CUSTOMERS) {
      await client.query(
        `INSERT INTO customers (id, company, address, contact, email)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO UPDATE SET
           company = EXCLUDED.company, address = EXCLUDED.address,
           contact = EXCLUDED.contact, email = EXCLUDED.email`,
        [c.id, c.company, c.address, c.contact, c.email]
      );
    }

    for (const r of RENTALS) {
      await client.query(
        `INSERT INTO rentals (
           id, customer_id, partner_id, part_number, device_part_number, serial_number,
           site_address, rental_start, end_date, contract_number, contract_start,
           contract_end, sla, invoice_number, payment_status, status
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (id) DO NOTHING`,
        [
          r.id, r.customerId, r.partnerId, r.partNumber, r.devicePartNumber,
          r.serialNumber, r.siteAddress, r.rentalStart, r.endDate, r.contractNumber,
          r.contractStart, r.contractEnd, r.sla, r.invoiceNumber, r.paymentStatus, r.status,
        ]
      );
    }

    // The mock installations name their customer as a plain string; the table
    // uses a FK, so map company name back to an id and skip any that don't match.
    const byCompany = new Map(CUSTOMERS.map((c) => [c.company, c.id]));
    for (const i of INSTALLATIONS) {
      const customerId = byCompany.get(i.customer);
      if (!customerId) {
        console.warn(`  skipping ${i.id}: no customer matching "${i.customer}"`);
        continue;
      }
      await client.query(
        `INSERT INTO installations (
           id, customer_id, installation_address, installation_date, installation_time,
           device_model, serial_number, start_time, end_time, location, country,
           assigned_engineer, quotation_number
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [
          i.id, customerId, i.installationAddress, i.installationDate, i.installationTime,
          i.deviceModel, i.serialNumber, i.startTime, i.endTime, i.location, i.country,
          i.assignedEngineer, i.quotationNumber,
        ]
      );
    }

    const hash = await bcrypt.hash(SEED_USER.password, 12);
    await client.query(
      `INSERT INTO users (username, password_hash, display_name)
       VALUES ($1,$2,$3)
       ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [SEED_USER.username, hash, SEED_USER.displayName]
    );
  });

  const counts = await pool.query(`
    SELECT
      (SELECT count(*) FROM partners)  AS partners,
      (SELECT count(*) FROM customers) AS customers,
      (SELECT count(*) FROM rentals)   AS rentals,
      (SELECT count(*) FROM installations) AS installations,
      (SELECT count(*) FROM users)     AS users
  `);
  console.log("Seeded:", counts.rows[0]);
  console.log(`Login with username "${SEED_USER.username}" / password "${SEED_USER.password}"`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
