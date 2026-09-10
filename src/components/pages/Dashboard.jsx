import { useEffect, useState } from "react";
import { getRentalStats } from "../../api/rentals.js";

// reloadKey lets RentalsPage refresh these counts after a create. Previously
// this component counted a static import, so the cards never changed.
export function Dashboard({ reloadKey = 0 }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRentalStats()
      .then((s) => !cancelled && setStats(s))
      .catch(() => !cancelled && setStats(null));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const show = (n) => (stats ? n : "—");

  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-label">Total rentals</div>
        <div className="stat-value">{show(stats?.total)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active</div>
        <div className="stat-value tone-active">{show(stats?.active)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Ending soon</div>
        <div className="stat-value tone-warn">{show(stats?.endingSoon)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Overdue</div>
        <div className="stat-value tone-overdue">{show(stats?.overdue)}</div>
      </div>
    </div>
  );
}
