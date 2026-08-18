import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { SHIPMENTS } from "../../data/mockData.js";
import { NewShipmentModal } from "../modals/NewShipmentModal.jsx";
import { TrackingTable } from "../shared/TrackingTable.jsx";

export function ShipmentsPage() {
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [shipments, setShipments] = useState(SHIPMENTS);

  const filtered = useMemo(() => shipments.filter((s) => {
    if (!query) return true;
    const hay = `${s.id} ${s.awbNumber} ${s.carrier} ${s.customer}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  }), [query, shipments]);

  function handleSave(form) {
    const newShipment = {
      id: `SHP-${String(shipments.length + 1).padStart(3, "0")}`,
      ...form,
    };
    setShipments([...shipments, newShipment]);
    setShowModal(false);
  }

  return (
    <div>
      {showModal && <NewShipmentModal onClose={() => setShowModal(false)} onSave={handleSave} />}
      <div className="section-head">
        <h2>Shipment tracking</h2>
        <button className="btn-primary btn-add" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New shipment
        </button>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by shipment ID, AWB, carrier, customer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <TrackingTable
        columns={[
          { key: "id", label: "Shipment ID" },
          { key: "awbNumber", label: "AWB number" },
          { key: "carrier", label: "Carrier" },
          { key: "shipTo", label: "Ship to" },
          { key: "shippingDate", label: "Shipping date" },
          { key: "receivedDate", label: "Received date" },
          { key: "customer", label: "Customer" },
          { key: "receivedBy", label: "Received by" },
        ]}
        rows={filtered}
      />
    </div>
  );
}
