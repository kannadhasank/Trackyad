import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { INSTALLATIONS } from "../../data/mockData.js";
import { TrackingTable } from "../shared/TrackingTable.jsx";
import { containsQuery } from "../../utils/helpers.js";

export function InstallationsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => INSTALLATIONS.filter((r) => containsQuery(r, query)), [query]);

  return (
    <div>
      <div className="section-head">
        <h2>Installation tracking</h2>
        <button className="btn-primary btn-add">
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
      <TrackingTable
        columns={[
          { key: "customer", label: "Customer" },
          { key: "installationAddress", label: "Installation address" },
          { key: "installationDate", label: "Date" },
          { key: "installationTime", label: "Time" },
          { key: "deviceModel", label: "Device model" },
          { key: "startTime", label: "Start" },
          { key: "endTime", label: "End" },
          { key: "location", label: "Local/overseas" },
          { key: "country", label: "Country" },
          { key: "assignedEngineer", label: "Assigned engineer" },
          { key: "quotationNumber", label: "Quotation no." },
          { key: "serialNumber", label: "Serial no." },
          { key: "document", label: "Upload document" },
        ]}
        rows={filtered}
      />
    </div>
  );
}
