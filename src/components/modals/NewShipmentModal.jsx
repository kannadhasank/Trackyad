import { useState } from "react";
import { X, FileText, Truck, Building2, Calendar, User } from "lucide-react";
import { CUSTOMERS } from "../../data/mockData.js";

const EMPTY_FORM = {
  awbNumber: "",
  carrier: "",
  shipTo: "",
  shippingDate: "",
  receivedDate: "",
  items: [],
  customer: "",
  receivedBy: "",
  podSignUrl: null,
};

export function NewShipmentModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div className="modal-title" id="modal-title">New shipment</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <label className="field">
                <span className="field-label"><FileText size={13} /> AWB number</span>
                <input
                  required
                  placeholder="e.g. 1Z999AA10123456784"
                  value={form.awbNumber}
                  onChange={(e) => set("awbNumber", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Truck size={13} /> Carrier</span>
                <select
                  required
                  value={form.carrier}
                  onChange={(e) => set("carrier", e.target.value)}
                >
                  <option value="">Select carrier…</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Building2 size={13} /> Ship to</span>
                <input
                  required
                  placeholder="e.g. Altair Manufacturing Co."
                  value={form.shipTo}
                  onChange={(e) => set("shipTo", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Building2 size={13} /> Customer</span>
                <select
                  required
                  value={form.customer}
                  onChange={(e) => set("customer", e.target.value)}
                >
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.company}>{c.company}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Shipping date</span>
                <input
                  type="date"
                  required
                  value={form.shippingDate}
                  onChange={(e) => set("shippingDate", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Received date</span>
                <input
                  type="date"
                  value={form.receivedDate}
                  onChange={(e) => set("receivedDate", e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label"><User size={13} /> Received by</span>
              <input
                placeholder="e.g. John Tan"
                value={form.receivedBy}
                onChange={(e) => set("receivedBy", e.target.value)}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create shipment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
