import { useState } from "react";
import { X, Building2, Users, Package, Hash, MapPin, Calendar, FileText } from "lucide-react";
import { CUSTOMERS, PARTNERS } from "../../data/mockData.js";

const EMPTY_FORM = {
  customerId: "",
  partnerId: "",
  partNumber: "",
  serialNumber: "",
  siteAddress: "",
  rentalStart: "",
  endDate: "",
  invoiceNumber: "",
  paymentStatus: "pending",
  status: "active",
};

export function NewRentalModal({ onClose, onSave }) {
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
          <div className="modal-title" id="modal-title">New rental</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <label className="field">
                <span className="field-label"><Building2 size={13} /> Customer</span>
                <select
                  required
                  value={form.customerId}
                  onChange={(e) => set("customerId", e.target.value)}
                >
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.id}>{c.company}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label"><Users size={13} /> Partner</span>
                <select
                  required
                  value={form.partnerId}
                  onChange={(e) => set("partnerId", e.target.value)}
                >
                  <option value="">Select partner…</option>
                  {PARTNERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Package size={13} /> Part number</span>
                <input
                  required
                  placeholder="e.g. FLT-8820-XR"
                  value={form.partNumber}
                  onChange={(e) => set("partNumber", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Hash size={13} /> Serial number</span>
                <input
                  required
                  placeholder="e.g. SN-88214-A"
                  value={form.serialNumber}
                  onChange={(e) => set("serialNumber", e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label"><MapPin size={13} /> Site address</span>
              <input
                required
                placeholder="e.g. 88 Jurong East Ave 1, Bay 4"
                value={form.siteAddress}
                onChange={(e) => set("siteAddress", e.target.value)}
              />
            </label>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Rental start</span>
                <input
                  type="date"
                  required
                  value={form.rentalStart}
                  onChange={(e) => set("rentalStart", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Calendar size={13} /> End date</span>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><FileText size={13} /> Invoice number</span>
                <input
                  required
                  placeholder="e.g. INV-31100"
                  value={form.invoiceNumber}
                  onChange={(e) => set("invoiceNumber", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Payment status</span>
                <select
                  value={form.paymentStatus}
                  onChange={(e) => set("paymentStatus", e.target.value)}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span className="field-label">Rental status</span>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="ending_soon">Ending soon</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create rental</button>
          </div>
        </form>
      </div>
    </div>
  );
}
