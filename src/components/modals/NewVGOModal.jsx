import { useState } from "react";
import { X, Building2, Package, Hash, MapPin, Calendar, FileText } from "lucide-react";

const EMPTY_FORM = {
  customerName: "",
  partNumber: "",
  rentalSiteAddress: "",
  deviceNumber: "",
  serialNumber: "",
  rentalStartDate: "",
  endDate: "",
  invoiceNumber: "",
  paymentStatus: "pending",
  doNumber: "",
  podSN: "",
};

export function NewVGOModal({ onClose, onSave }) {
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
          <div className="modal-title" id="modal-title">New VGO item</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <label className="field">
              <span className="field-label"><Building2 size={13} /> Customer name</span>
              <input
                required
                placeholder="e.g. Altair Manufacturing Co."
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
              />
            </label>

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
              <span className="field-label"><MapPin size={13} /> Rental site address</span>
              <input
                required
                placeholder="e.g. 88 Jurong East Ave 1, Bay 4"
                value={form.rentalSiteAddress}
                onChange={(e) => set("rentalSiteAddress", e.target.value)}
              />
            </label>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Hash size={13} /> Device number</span>
                <input
                  required
                  placeholder="e.g. DEV-2201"
                  value={form.deviceNumber}
                  onChange={(e) => set("deviceNumber", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Hash size={13} /> DO number</span>
                <input
                  required
                  placeholder="e.g. DO-5521"
                  value={form.doNumber}
                  onChange={(e) => set("doNumber", e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Rental start date</span>
                <input
                  type="date"
                  required
                  value={form.rentalStartDate}
                  onChange={(e) => set("rentalStartDate", e.target.value)}
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
                  placeholder="e.g. INV-30981"
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
              <span className="field-label"><FileText size={13} /> POD S/N</span>
              <input
                placeholder="e.g. POD-8821-A"
                value={form.podSN}
                onChange={(e) => set("podSN", e.target.value)}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create VGO item</button>
          </div>
        </form>
      </div>
    </div>
  );
}
