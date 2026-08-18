import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { VGO_ITEMS } from "../../data/mockData.js";
import { NewVGOModal } from "../modals/NewVGOModal.jsx";
import { TrackingTable } from "../shared/TrackingTable.jsx";

export function VGOPage() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState(VGO_ITEMS);

  const filtered = useMemo(() => items.filter((item) => {
    if (!query) return true;
    const hay = `${item.id} ${item.customerName} ${item.partNumber} ${item.serialNumber}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  }), [query, items]);

  function handleSave(form) {
    const newItem = {
      id: `VGO-${String(items.length + 1).padStart(3, "0")}`,
      ...form,
    };
    setItems([...items, newItem]);
    setShowModal(false);
  }

  return (
    <div>
      {showModal && <NewVGOModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      <div className="section-head">
        <h2>VGO inventory tracking</h2>
        <button className="btn-primary btn-add" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New VGO item
        </button>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by ID, customer, part number, S/N..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <TrackingTable
        columns={[
          { key: "id", label: "VGO ID" },
          { key: "customerName", label: "Customer name" },
          { key: "partNumber", label: "Part number" },
          { key: "serialNumber", label: "S/N" },
          { key: "rentalSiteAddress", label: "Rental site address" },
          { key: "deviceNumber", label: "Device number" },
          { key: "doNumber", label: "DO number" },
          { key: "rentalStartDate", label: "Rental start" },
          { key: "endDate", label: "End date" },
          { key: "invoiceNumber", label: "Invoice no." },
          { key: "paymentStatus", label: "Payment status" },
          { key: "podSN", label: "POD S/N" },
        ]}
        rows={filtered}
      />
    </div>
  );
}
