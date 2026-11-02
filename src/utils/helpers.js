export function fmtDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(d) {
  const diff = new Date(d + "T00:00:00") - new Date(new Date().toDateString());
  return Math.round(diff / 86400000);
}

export function containsQuery(obj, query) {
  if (!query) return true;
  const hay = Object.values(obj).join(" ").toLowerCase();
  return hay.includes(query.toLowerCase());
}
