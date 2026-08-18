import { Hash, Building2, MapPin, Users, ChevronRight, FileText } from "lucide-react";
import { customerFor, partnerFor, fmtDate, daysUntil } from "../../utils/helpers.js";
import { STATUS, PAYMENT_STATUS } from "../../data/mockData.js";
import { StatusChip } from "./StatusChip.jsx";

export function AssetTag({ rental }) {
  const cust = customerFor(rental.customerId);
  const partner = partnerFor(rental.partnerId);
  const st = STATUS[rental.status];
  const pay = PAYMENT_STATUS[rental.paymentStatus];
  const left = daysUntil(rental.endDate);

  return (
    <div className="tag">
      <div className="tag-perf tag-perf-left" />
      <div className="tag-perf tag-perf-right" />
      <div className="tag-body">
        <div className="tag-top">
          <div className="tag-id">
            <Hash size={12} strokeWidth={2.5} />
            {rental.id}
          </div>
          <StatusChip tone={st.tone}>{st.label}</StatusChip>
        </div>

        <div className="tag-serial">S/N {rental.serialNumber}</div>
        <div className="tag-part">{rental.partNumber}</div>

        <div className="tag-divider" />

        <div className="tag-row">
          <Building2 size={13} />
          <span>{cust?.company}</span>
        </div>
        <div className="tag-row">
          <MapPin size={13} />
          <span>{rental.siteAddress}</span>
        </div>
        <div className="tag-row">
          <Users size={13} />
          <span>{partner?.name}</span>
        </div>

        <div className="tag-divider" />

        <div className="tag-dates">
          <div>
            <div className="tag-label">Start</div>
            <div className="tag-value">{fmtDate(rental.rentalStart)}</div>
          </div>
          <ChevronRight size={14} className="tag-arrow" />
          <div>
            <div className="tag-label">End</div>
            <div className="tag-value">{fmtDate(rental.endDate)}</div>
          </div>
        </div>

        {rental.status !== "returned" && (
          <div className={`tag-countdown ${left < 0 ? "is-late" : left <= 14 ? "is-soon" : ""}`}>
            {left < 0
              ? `${Math.abs(left)} days overdue`
              : `${left} days remaining`}
          </div>
        )}

        <div className="tag-divider" />

        <div className="tag-footer">
          <div className="tag-invoice">
            <FileText size={13} />
            <span>{rental.invoiceNumber}</span>
          </div>
          <StatusChip tone={pay.tone}>{pay.label}</StatusChip>
        </div>
      </div>
    </div>
  );
}
