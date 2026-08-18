import { MapPin, Mail, Phone } from "lucide-react";
import { Plus } from "lucide-react";
import { PARTNERS, RENTALS } from "../../data/mockData.js";
import { StatusChip } from "../shared/StatusChip.jsx";

export function PartnersPage() {
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
        {PARTNERS.map((p) => {
          const count = RENTALS.filter((r) => r.partnerId === p.id).length;
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
                <StatusChip tone="neutral">{count} units</StatusChip>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
