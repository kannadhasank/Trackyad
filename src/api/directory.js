import { request } from "./client.js";

export function listCustomers() {
  return request("/customers");
}

export function listPartners() {
  return request("/partners");
}
