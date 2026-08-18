import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { RENTALS, STATUS } from "../../data/mockData.js";
import { Dashboard } from "./Dashboard.jsx";
import { NewRentalModal } from "../modals/NewRentalModal.jsx";
import { AssetTag } from "../shared/AssetTag.jsx";

export function RentalsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [rentals, setRentals] = useState(RENTALS);

  function handleSave(form) {
    const lastId = rentals.reduce((max, r) => {
      const n = parseInt(r.id.replace("RNT-", ""), 10);
      return n > max ? n : max;
    }, 0);
    const newRental = {
      ...form,
      id: `RNT-${lastId + 1}`,
      devicePartNumber: form.partNumber,
      contractNumber: `CTR-${Math.floor(55000 + Math.random() * 1000)}`,
      contractStart: form.rentalStart,
      contractEnd: form.endDate,
      sla: "Next business day",
    };
    setRentals((prev) => [...prev, newRental]);
    setShowModal(false);
  }

  const filtered = useMemo(() => {
    return rentals.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!query) return true;
      const cust = rentals.find((rental) => rental.customerId)?.customerId ?? "";
      const hay = `${r.id} ${r.serialNumber} ${r.partNumber} ${cust}`.toLowerCase();
      return hay.includes(query.toLowerCase());
    });
  }, [query, filter, rentals]);

  return (
    <div>
      {showModal && <NewRentalModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      <Dashboard />

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

      <div className="tag-grid">
        {filtered.map((r) => (
          <AssetTag key={r.id} rental={r} />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">No rentals match this search.</div>
        )}
      </div>
    </div>
  );
}
