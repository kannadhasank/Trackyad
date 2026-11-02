import { useEffect, useState } from "react";
import { MapPin, Mail, Phone } from "lucide-react";
import { Plus } from "lucide-react";
import { StatusChip } from "../shared/StatusChip.jsx";
import { listPartners } from "../../api/directory.js";

export function PartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listPartners()
      .then((data) => !cancelled && setPartners(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="section-head">
        <h2>Partner directory</h2>
        <button className="btn-primary btn-add">
          <Plus size={15} /> New partner
        </button>
      </div>
      <div className="ledger">
        <div className="ledger-head">
          <span>Partner</span>
          <span>Location</span>
          <span>Contact</span>
          <span>Fleet</span>
        </div>
        {partners.map((p) => {
          return (
            <div className="ledger-row" key={p.id}>
              <div className="ledger-main">
                <div className="ledger-avatar">{p.name.charAt(0)}</div>
                <div>
                  <div className="ledger-name">{p.name}</div>
                  <div className="ledger-sub">{p.id}</div>
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <MapPin size={12} /> {p.address}
                </div>
                <div className="ledger-line ledger-dim">
                  {p.city}, {p.country}
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <Mail size={12} /> {p.email}
                </div>
                <div className="ledger-line">
                  <Phone size={12} /> {p.contact}
                </div>
              </div>
              <div className="ledger-cell">
                <StatusChip tone="neutral">{p.rentalCount} units</StatusChip>
              </div>
            </div>
          );
        })}
        {loading && <div className="empty-state">Loading partners…</div>}
        {error && <div className="empty-state">{error}</div>}
        {!loading && !error && partners.length === 0 && (
          <div className="empty-state">No partners yet.</div>
        )}
      </div>
    </div>
  );
}
