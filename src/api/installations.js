import { ApiError, getToken, request, isInfraError } from "./client.js";
import { INSTALLATIONS, CUSTOMERS } from "../data/mockData.js";

const BASE = import.meta.env.VITE_API_URL ?? "";

export async function listInstallations(q) {
  try {
    return await request(`/installations${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  } catch (err) {
    if (!isInfraError(err)) throw err;
    // Enrich customer string → object to match the API shape
    let data = INSTALLATIONS.map((i) => ({
      ...i,
      customer: CUSTOMERS.find((c) => c.company === i.customer) ?? { company: i.customer },
      hasDocument: Boolean(i.document),
      documentName: i.document ?? null,
    }));
    if (q) {
      const lower = q.toLowerCase();
      data = data.filter(
        (i) =>
          i.customer?.company?.toLowerCase().includes(lower) ||
          i.deviceModel?.toLowerCase().includes(lower) ||
          i.assignedEngineer?.toLowerCase().includes(lower) ||
          i.serialNumber?.toLowerCase().includes(lower)
      );
    }
    return data;
  }
}

// Sent as multipart/form-data so the document rides along with the fields.
// Content-Type is deliberately not set — the browser adds the boundary.
export async function createInstallation(form, file) {
  const body = new FormData();
  for (const [key, value] of Object.entries(form)) {
    if (value !== null && value !== undefined) body.append(key, value);
  }
  if (file) body.append("document", file);

  const token = getToken();
  const res = await fetch(`${BASE}/api/installations`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status);
  }
  return data;
}

// The document endpoint needs the auth header, so it cannot just be an <a href>.
// Fetch it as a blob and hand that to a temporary object URL instead.
export async function openInstallationDocument(id, filename) {
  const token = getToken();
  const res = await fetch(`${BASE}/api/installations/${id}/document`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.error ?? "Could not open the document", res.status);
  }

  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "document";
  a.click();
  URL.revokeObjectURL(url);
}
