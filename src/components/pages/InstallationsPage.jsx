import { useCallback, useEffect, useState } from "react";
import { Search, Plus, Download } from "lucide-react";
import { TrackingTable } from "../shared/TrackingTable.jsx";
import { NewInstallationModal } from "../modals/NewInstallationModal.jsx";
import {
  createInstallation,
  listInstallations,
  openInstallationDocument,
} from "../../api/installations.js";
import { listCustomers } from "../../api/directory.js";

export function InstallationsPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      listInstallations(query)
        .then((data) => {
          if (cancelled) return;
          setRows(data);
          setError(null);
        })
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, query ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, reloadKey]);

  const handleSave = useCallback(async (form, file) => {
    await createInstallation(form, file);
    setShowModal(false);
    setReloadKey((k) => k + 1);
  }, []);

  async function handleDownload(row) {
    try {
      await openInstallationDocument(row.id, row.documentName);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {showModal && (
        <NewInstallationModal
          customers={customers}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}

      <div className="section-head">
        <h2>Installation tracking</h2>
        <button className="btn-primary btn-add" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New installation
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by customer, model, engineer, S/N..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="empty-state">{error}</div>}

      {!error && (
        <TrackingTable
          columns={[
            { key: "customer", label: "Customer", render: (r) => r.customer?.company },
            { key: "installationAddress", label: "Installation address" },
            { key: "installationDate", label: "Date" },
            { key: "deviceModel", label: "Device model" },
            { key: "serialNumber", label: "Serial no." },
            { key: "startTime", label: "Start Time" },
            { key: "endTime", label: "End Time" },
            { key: "assignedEngineer", label: "Assigned engineer" },
            { key: "country", label: "Country" },
            { key: "quotationNumber", label: "Quotation no." },
            { key: "poNumber", label: "PO no." },
            {
              key: "document",
              label: "Document",
              render: (r) =>
                r.hasDocument ? (
                  <button
                    className="link-btn"
                    onClick={() => handleDownload(r)}
                    title={`${r.documentName} · ${(r.documentSize / 1024).toFixed(0)} KB`}
                  >
                    <Download size={13} /> {r.documentName}
                  </button>
                ) : (
                  <span className="cell-muted">—</span>
                ),
            },
          ]}
          rows={loading && rows.length === 0 ? [] : rows}
        />
      )}
    </div>
  );
}
