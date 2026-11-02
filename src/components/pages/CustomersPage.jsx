import { useEffect, useState } from "react";
import { MapPin, Mail, Phone, Plus } from "lucide-react";
import { StatusChip } from "../shared/StatusChip.jsx";
import { listCustomers } from "../../api/directory.js";

export function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    listCustomers()
      .then((data) => !cancelled && setCustomers(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="section-head">
        <h2>Customer directory</h2>
        <button className="btn-primary btn-add">
          <Plus size={15} /> New customer
        </button>
      </div>
      <div className="ledger">
        <div className="ledger-head">
          <span>Customer</span>
          <span>Address</span>
          <span>Contact</span>
          <span>Rentals</span>
        </div>
        {customers.map((c) => {
          return (
            <div className="ledger-row" key={c.id}>
              <div className="ledger-main">
                <div className="ledger-avatar">{c.company.charAt(0)}</div>
                <div>
                  <div className="ledger-name">{c.company}</div>
                  <div className="ledger-sub">{c.id}</div>
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <MapPin size={12} /> {c.address}
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <Mail size={12} /> {c.email}
                </div>
                <div className="ledger-line">
                  <Phone size={12} /> {c.contact}
                </div>
              </div>
              <div className="ledger-cell">
                <StatusChip tone="neutral">{c.rentalCount} active</StatusChip>
              </div>
            </div>
          );
        })}
        {loading && <div className="empty-state">Loading customers…</div>}
        {error && <div className="empty-state">{error}</div>}
        {!loading && !error && customers.length === 0 && (
          <div className="empty-state">No customers yet.</div>
        )}
      </div>
    </div>
  );
}
