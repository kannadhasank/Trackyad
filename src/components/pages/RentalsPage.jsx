import { useCallback, useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { STATUS } from "../../data/mockData.js";
import { Dashboard } from "./Dashboard.jsx";
import { NewRentalModal } from "../modals/NewRentalModal.jsx";
import { AssetTag } from "../shared/AssetTag.jsx";
import { createRental, listRentals } from "../../api/rentals.js";
import { listCustomers, listPartners } from "../../api/directory.js";

export function RentalsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [rentals, setRentals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bumped after a create, to re-run the fetch below.
  const [reloadKey, setReloadKey] = useState(0);

  // The modal's dropdowns need these; fetched once.
  useEffect(() => {
    Promise.all([listCustomers(), listPartners()])
      .then(([c, p]) => {
        setCustomers(c);
        setPartners(p);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Filtering and search happen server-side, so this re-runs when either changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Debounce so typing does not fire a request per keystroke.
    const timer = setTimeout(() => {
      listRentals({ status: filter, q: query })
        .then((data) => {
          if (cancelled) return;
          setRentals(data);
          setError(null);
        })
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => !cancelled && setLoading(false));
    }, query ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, filter, reloadKey]);

  const handleSave = useCallback(async (form) => {
    // id, contract fields and sla are derived by the API now.
    await createRental(form);
    setShowModal(false);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <div>
      {showModal && (
        <NewRentalModal
          customers={customers}
          partners={partners}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
      <Dashboard reloadKey={reloadKey} />

      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by rental ID, S/N, part number, customer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {["all", "active", "ending_soon", "overdue", "returned"].map((f) => (
            <button
              key={f}
              className={`pill ${filter === f ? "pill-active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : STATUS[f].label}
            </button>
          ))}
        </div>
        <button className="btn-primary btn-add" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New rental
        </button>
      </div>

      {error && <div className="empty-state">{error}</div>}

      {!error && (
        <div className="tag-grid">
          {rentals.map((r) => (
            <AssetTag key={r.id} rental={r} />
          ))}
          {loading && rentals.length === 0 && (
            <div className="empty-state">Loading rentals…</div>
          )}
          {!loading && rentals.length === 0 && (
            <div className="empty-state">No rentals match this search.</div>
          )}
        </div>
      )}
    </div>
  );
}
