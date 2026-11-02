import { request, isInfraError } from "./client.js";
import { CUSTOMERS, PARTNERS, RENTALS } from "../data/mockData.js";

export async function listCustomers() {
  try {
    return await request("/customers");
  } catch (err) {
    if (!isInfraError(err)) throw err;
    return CUSTOMERS.map((c) => ({
      ...c,
      rentalCount: RENTALS.filter((r) => r.customerId === c.id && r.status === "active").length,
    }));
  }
}

export async function listPartners() {
  try {
    return await request("/partners");
  } catch (err) {
    if (!isInfraError(err)) throw err;
    return PARTNERS.map((p) => ({
      ...p,
      rentalCount: RENTALS.filter((r) => r.partnerId === p.id && r.status === "active").length,
    }));
  }
}
