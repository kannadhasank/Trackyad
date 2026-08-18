import { RENTALS } from "../../data/mockData.js";

export function Dashboard() {
  const total = RENTALS.length;
  const active = RENTALS.filter((r) => r.status === "active").length;
  const overdue = RENTALS.filter((r) => r.status === "overdue").length;
  const endingSoon = RENTALS.filter((r) => r.status === "ending_soon").length;

  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-label">Total rentals</div>
        <div className="stat-value">{total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active</div>
        <div className="stat-value tone-active">{active}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Ending soon</div>
        <div className="stat-value tone-warn">{endingSoon}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Overdue</div>
        <div className="stat-value tone-overdue">{overdue}</div>
      </div>
    </div>
  );
}
