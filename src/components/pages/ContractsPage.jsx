import { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { CONTRACTS } from "../../data/mockData.js";
import { TrackingTable } from "../shared/TrackingTable.jsx";
import { containsQuery } from "../../utils/helpers.js";

export function ContractsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => CONTRACTS.filter((r) => containsQuery(r, query)), [query]);

  return (
    <div>
      <div className="section-head">
        <h2>Contract tracking</h2>
        <button className="btn-primary btn-add">
          <Plus size={15} /> New contract
        </button>
      </div>
      <div className="toolbar">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by contract, customer, S/N, invoice..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <TrackingTable
        columns={[
          { key: "endCustomerName", label: "End customer" },
          { key: "customerDevicePartNumber", label: "Device part no." },
          { key: "serialNumber", label: "S/N" },
          { key: "contractNumber", label: "Contract no." },
          { key: "contractStartDate", label: "Contract start" },
          { key: "contractEndDate", label: "Contract end" },
          { key: "sla", label: "SLA" },
          { key: "address", label: "Address" },
          { key: "quotationNumber", label: "Quotation no." },
          { key: "poNumber", label: "PO no." },
          { key: "invoiceNumber", label: "Invoice no." },
          { key: "paymentStatus", label: "Payment status" },
        ]}
        rows={filtered}
      />
    </div>
  );
}
