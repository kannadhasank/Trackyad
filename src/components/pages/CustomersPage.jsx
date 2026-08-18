import { MapPin, Mail, Phone, Plus } from "lucide-react";
import { CUSTOMERS, RENTALS } from "../../data/mockData.js";
import { StatusChip } from "../shared/StatusChip.jsx";

export function CustomersPage() {
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
        {CUSTOMERS.map((c) => {
          const count = RENTALS.filter((r) => r.customerId === c.id).length;
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
                <StatusChip tone="neutral">{count} active</StatusChip>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
