import { useRef, useState } from "react";
import {
  X, Building2, MapPin, Calendar, Clock, Package, Hash,
  Globe, User, FileText, Upload, Paperclip,
} from "lucide-react";

const EMPTY_FORM = {
  customerId: "",
  installationAddress: "",
  installationDate: "",
  installationTime: "",
  deviceModel: "",
  serialNumber: "",
  startTime: "",
  endTime: "",
  location: "Local",
  country: "",
  assignedEngineer: "",
  quotationNumber: "",
  poNumber: "",
};

const MAX_MB = 10;
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.heic";

export function NewInstallationModal({ customers = [], onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef(null);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFile(e) {
    const picked = e.target.files?.[0] ?? null;
    // Checked here too so the user finds out before uploading 10 MB.
    if (picked && picked.size > MAX_MB * 1024 * 1024) {
      setError(`"${picked.name}" is larger than the ${MAX_MB} MB limit.`);
      e.target.value = "";
      return;
    }
    setError(null);
    setFile(picked);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSave(form, file);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="install-modal-title">
        <div className="modal-header">
          <div className="modal-title" id="install-modal-title">New installation</div>
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
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.company}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field-label"><Globe size={13} /> Location</span>
                <select value={form.location} onChange={(e) => set("location", e.target.value)}>
                  <option value="Local">Local</option>
                  <option value="Overseas">Overseas</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span className="field-label"><MapPin size={13} /> Installation address</span>
              <input
                required
                placeholder="e.g. 88 Jurong East Ave 1, Bay 4"
                value={form.installationAddress}
                onChange={(e) => set("installationAddress", e.target.value)}
              />
            </label>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Package size={13} /> Device model</span>
                <input
                  required
                  placeholder="e.g. AX-220 Air Dryer"
                  value={form.deviceModel}
                  onChange={(e) => set("deviceModel", e.target.value)}
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

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Installation date</span>
                <input
                  type="date"
                  required
                  value={form.installationDate}
                  onChange={(e) => set("installationDate", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Clock size={13} /> Scheduled time</span>
                <input
                  type="time"
                  value={form.installationTime}
                  onChange={(e) => set("installationTime", e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Clock size={13} /> Start time</span>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Clock size={13} /> End time</span>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><User size={13} /> Assigned engineer</span>
                <input
                  placeholder="e.g. Haris"
                  value={form.assignedEngineer}
                  onChange={(e) => set("assignedEngineer", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Globe size={13} /> Country</span>
                <input
                  placeholder="e.g. Singapore"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><FileText size={13} /> Quotation number</span>
                <input
                  placeholder="e.g. QTN-44091"
                  value={form.quotationNumber}
                  onChange={(e) => set("quotationNumber", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><FileText size={13} /> PO number</span>
                <input
                  placeholder="e.g. PO-87021"
                  value={form.poNumber}
                  onChange={(e) => set("poNumber", e.target.value)}
                />
              </label>
            </div>

            <div className="field">
              <span className="field-label"><Paperclip size={13} /> Document (optional)</span>
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPT}
                onChange={handleFile}
                style={{ display: "none" }}
              />
              <div className="file-picker">
                <button
                  type="button"
                  className="btn-ghost file-picker-btn"
                  onClick={() => fileInput.current?.click()}
                >
                  <Upload size={14} /> Choose file
                </button>
                {file ? (
                  <span className="file-picker-name">
                    {file.name} · {(file.size / 1024).toFixed(0)} KB
                    <button
                      type="button"
                      className="file-picker-clear"
                      onClick={() => {
                        setFile(null);
                        if (fileInput.current) fileInput.current.value = "";
                      }}
                      aria-label="Remove file"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ) : (
                  <span className="file-picker-hint">
                    PDF or image, up to {MAX_MB} MB
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Creating…" : "Create installation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
