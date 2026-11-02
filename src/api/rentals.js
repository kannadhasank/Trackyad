import { request, isInfraError } from "./client.js";
import { RENTALS, CUSTOMERS, PARTNERS } from "../data/mockData.js";

// Enrich a mock rental with nested customer/partner objects (mirrors the API shape).
function enrichRental(r) {
  return {
    ...r,
    customer: CUSTOMERS.find((c) => c.id === r.customerId) ?? null,
    partner: PARTNERS.find((p) => p.id === r.partnerId) ?? null,
  };
}

// ── API functions with mock fallbacks ─────────────────────────────────────────
export async function listRentals({ status, q } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  try {
    return await request(`/rentals${qs ? `?${qs}` : ""}`);
  } catch (err) {
    if (!isInfraError(err)) throw err;
    // Filter mock data exactly as the backend would
    let data = RENTALS.map(enrichRental);
    if (status && status !== "all") data = data.filter((r) => r.status === status);
    if (q) {
      const lower = q.toLowerCase();
      data = data.filter(
        (r) =>
          r.id.toLowerCase().includes(lower) ||
          r.serialNumber?.toLowerCase().includes(lower) ||
          r.partNumber?.toLowerCase().includes(lower) ||
          r.customer?.company?.toLowerCase().includes(lower)
      );
    }
    return data;
  }
}

export async function getRentalStats() {
  try {
    return await request("/rentals/stats");
  } catch (err) {
    if (!isInfraError(err)) throw err;
    const active = RENTALS.filter((r) => r.status === "active").length;
    const endingSoon = RENTALS.filter((r) => r.status === "ending_soon").length;
    const overdue = RENTALS.filter((r) => r.status === "overdue").length;
    return { total: RENTALS.length, active, endingSoon, overdue };
  }
}

export async function createRental(form) {
  try {
    return await request("/rentals", { method: "POST", body: form });
  } catch (err) {
    if (!isInfraError(err)) throw err;
    // In mock mode just return a fabricated record so the UI doesn't crash.
    const newRental = { id: `RNT-MOCK-${Date.now()}`, ...form, status: "active" };
    RENTALS.push(newRental);
    return enrichRental(newRental);
  }
}

export async function updateRental(id, changes) {
  try {
    return await request(`/rentals/${id}`, { method: "PATCH", body: changes });
  } catch (err) {
    if (!isInfraError(err)) throw err;
    const idx = RENTALS.findIndex((r) => r.id === id);
    if (idx !== -1) Object.assign(RENTALS[idx], changes);
    return enrichRental(RENTALS[idx]);
  }
}

export async function deleteRental(id) {
  try {
    return await request(`/rentals/${id}`, { method: "DELETE" });
  } catch (err) {
    if (!isInfraError(err)) throw err;
    const idx = RENTALS.findIndex((r) => r.id === id);
    if (idx !== -1) RENTALS.splice(idx, 1);
    return null;
  }
}
