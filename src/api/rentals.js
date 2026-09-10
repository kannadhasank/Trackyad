import { request } from "./client.js";

export function listRentals({ status, q } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  return request(`/rentals${qs ? `?${qs}` : ""}`);
}

export function getRentalStats() {
  return request("/rentals/stats");
}

export function createRental(form) {
  return request("/rentals", { method: "POST", body: form });
}

export function updateRental(id, changes) {
  return request(`/rentals/${id}`, { method: "PATCH", body: changes });
}

export function deleteRental(id) {
  return request(`/rentals/${id}`, { method: "DELETE" });
}
