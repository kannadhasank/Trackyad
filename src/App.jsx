import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Package,
  Users,
  Building2,
  Wrench,
  ClipboardList,
  Truck,
  Search,
  Plus,
  X,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Hash,
  FileText,
  ChevronRight,
  Lock,
  User,
  LogOut,
} from "lucide-react";
import xsysLogo from "../assets/XSYS network logo.avif";

// ---------------------------------------------------------------------------
// MOCK DATA
// ---------------------------------------------------------------------------

const PARTNERS = [
  {
    id: "PTR-001",
    name: "Meridian Logistics Pte Ltd",
    address: "12 Shenton Way, #08-01",
    country: "Singapore",
    city: "Singapore",
    email: "ops@meridianlog.sg",
    contact: "+65 6215 4402",
  },
  {
    id: "PTR-002",
    name: "Northfield Industrial Supply",
    address: "4400 Distribution Pkwy",
    country: "United States",
    city: "Dallas, TX",
    email: "accounts@northfieldsupply.com",
    contact: "+1 214 555 0199",
  },
  {
    id: "PTR-003",
    name: "Ravensbourne Tech Hire",
    address: "Unit 6, Kestrel Business Park",
    country: "United Kingdom",
    city: "Manchester",
    email: "hello@ravensbournetech.co.uk",
    contact: "+44 161 496 0022",
  },
];

const CUSTOMERS = [
  {
    id: "CUS-1001",
    company: "Altair Manufacturing Co.",
    address: "88 Jurong East Ave 1",
    contact: "+65 9123 4567",
    email: "procurement@altairmfg.com",
  },
  {
    id: "CUS-1002",
    company: "Blue Harbor Cold Storage",
    address: "220 Harborview Dr",
    contact: "+1 415 555 0134",
    email: "facilities@blueharbor.com",
  },
  {
    id: "CUS-1003",
    company: "Pinegrove Data Centres",
    address: "17 Innovation Rd",
    contact: "+44 121 555 0091",
    email: "it-ops@pinegrovedc.co.uk",
  },
  {
    id: "CUS-1004",
    company: "Sundown Beverages Ltd",
    address: "9 Coastal Rd, Bay 3",
    contact: "+65 8899 2210",
    email: "warehouse@sundownbev.com",
  },
];

const STATUS = {
  active: { label: "Active", tone: "active" },
  overdue: { label: "Overdue", tone: "overdue" },
  ending_soon: { label: "Ending soon", tone: "warn" },
  returned: { label: "Returned", tone: "neutral" },
};

const PAYMENT_STATUS = {
  paid: { label: "Paid", tone: "active" },
  pending: { label: "Pending", tone: "warn" },
  overdue: { label: "Overdue", tone: "overdue" },
};

const RENTALS = [
  {
    id: "RNT-20441",
    customerId: "CUS-1001",
    partnerId: "PTR-002",
    partNumber: "FLT-8820-XR",
    devicePartNumber: "CMP-2200-H",
    serialNumber: "SN-88214-A",
    siteAddress: "88 Jurong East Ave 1, Bay 4",
    rentalStart: "2026-03-01",
    endDate: "2026-09-01",
    contractNumber: "CTR-55210",
    contractStart: "2026-03-01",
    contractEnd: "2026-09-01",
    sla: "Next business day",
    invoiceNumber: "INV-30981",
    paymentStatus: "paid",
    status: "active",
  },
  {
    id: "RNT-20442",
    customerId: "CUS-1002",
    partnerId: "PTR-002",
    partNumber: "CHL-4410-B",
    devicePartNumber: "CHL-4410-B",
    serialNumber: "SN-44107-C",
    siteAddress: "220 Harborview Dr, Dock 2",
    rentalStart: "2025-11-15",
    endDate: "2026-07-15",
    contractNumber: "CTR-55190",
    contractStart: "2025-11-15",
    contractEnd: "2026-07-15",
    sla: "4-hour response",
    invoiceNumber: "INV-30822",
    paymentStatus: "pending",
    status: "ending_soon",
  },
  {
    id: "RNT-20443",
    customerId: "CUS-1003",
    partnerId: "PTR-003",
    partNumber: "RCK-1190-U",
    devicePartNumber: "RCK-1190-U",
    serialNumber: "SN-11904-D",
    siteAddress: "17 Innovation Rd, Server Hall B",
    rentalStart: "2026-01-10",
    endDate: "2026-06-10",
    contractNumber: "CTR-54987",
    contractStart: "2026-01-10",
    contractEnd: "2026-06-10",
    sla: "Same day",
    invoiceNumber: "INV-30755",
    paymentStatus: "overdue",
    status: "overdue",
  },
  {
    id: "RNT-20444",
    customerId: "CUS-1004",
    partnerId: "PTR-001",
    partNumber: "GEN-7720-P",
    devicePartNumber: "GEN-7720-P",
    serialNumber: "SN-77201-E",
    siteAddress: "9 Coastal Rd, Bay 3",
    rentalStart: "2026-05-20",
    endDate: "2026-11-20",
    contractNumber: "CTR-55340",
    contractStart: "2026-05-20",
    contractEnd: "2026-11-20",
    sla: "Next business day",
    invoiceNumber: "INV-31020",
    paymentStatus: "paid",
    status: "active",
  },
  {
    id: "RNT-20445",
    customerId: "CUS-1001",
    partnerId: "PTR-003",
    partNumber: "PMP-3301-K",
    devicePartNumber: "PMP-3301-K",
    serialNumber: "SN-33015-F",
    siteAddress: "88 Jurong East Ave 1, Bay 1",
    rentalStart: "2025-08-01",
    endDate: "2026-02-01",
    contractNumber: "CTR-54610",
    contractStart: "2025-08-01",
    contractEnd: "2026-02-01",
    sla: "Next business day",
    invoiceNumber: "INV-29944",
    paymentStatus: "paid",
    status: "returned",
  },
  {
    id: "RNT-20446",
    customerId: "CUS-1002",
    partnerId: "PTR-001",
    partNumber: "COM-2255-S",
    devicePartNumber: "COM-2255-S",
    serialNumber: "SN-22551-G",
    siteAddress: "220 Harborview Dr, Dock 5",
    rentalStart: "2026-06-01",
    endDate: "2027-06-01",
    contractNumber: "CTR-55402",
    contractStart: "2026-06-01",
    contractEnd: "2027-06-01",
    sla: "4-hour response",
    invoiceNumber: "INV-31088",
    paymentStatus: "pending",
    status: "active",
  },
];

const INSTALLATIONS = [
  {
    id: "INS-1101",
    customer: "Altair Manufacturing Co.",
    installationAddress: "88 Jurong East Ave 1, Bay 4",
    installationDate: "2026-07-10",
    installationTime: "09:00",
    deviceModel: "AX-220 Air Dryer",
    startTime: "09:15",
    endTime: "12:40",
    location: "Local",
    country: "Singapore",
    assignedEngineer: "Haris",
    quotationNumber: "QTN-44091",
    serialNumber: "SN-88214-A",
    document: "ins-1101-report.pdf",
  },
  {
    id: "INS-1102",
    customer: "Blue Harbor Cold Storage",
    installationAddress: "220 Harborview Dr, Dock 2",
    installationDate: "2026-07-14",
    installationTime: "13:00",
    deviceModel: "CHL-4410-B",
    startTime: "13:20",
    endTime: "16:55",
    location: "Overseas",
    country: "Malaysia",
    assignedEngineer: "Kavin",
    quotationNumber: "QTN-44107",
    serialNumber: "SN-44107-C",
    document: "ins-1102-checklist.pdf",
  },
];

const CONTRACTS = [
  {
    id: "CTR-9011",
    endCustomerName: "Altair Manufacturing Co.",
    customerDevicePartNumber: "CMP-2200-H",
    serialNumber: "SN-88214-A",
    contractNumber: "CON-55210",
    contractStartDate: "2026-03-01",
    contractEndDate: "2026-09-01",
    sla: "Next business day",
    address: "88 Jurong East Ave 1, Bay 4",
    quotationNumber: "QTN-44091",
    poNumber: "PO-87021",
    invoiceNumber: "INV-30981",
    paymentStatus: "Paid",
  },
  {
    id: "CTR-9012",
    endCustomerName: "Blue Harbor Cold Storage",
    customerDevicePartNumber: "CHL-4410-B",
    serialNumber: "SN-44107-C",
    contractNumber: "CON-55190",
    contractStartDate: "2025-11-15",
    contractEndDate: "2026-07-15",
    sla: "4-hour response",
    address: "220 Harborview Dr, Dock 2",
    quotationNumber: "QTN-44107",
    poNumber: "PO-87055",
    invoiceNumber: "INV-30822",
    paymentStatus: "Pending",
  },
];

const SHIPMENTS = [
  {
    id: "SHP-001",
    awbNumber: "1Z999AA10123456784",
    carrier: "FedEx",
    shipTo: "Altair Manufacturing Co.",
    shippingDate: "2026-08-10",
    receivedDate: "2026-08-13",
    items: [
      { description: "Industrial Pump", qty: 2 },
      { description: "Control Module", qty: 1 },
    ],
    customer: "Altair Manufacturing Co.",
    receivedBy: "John Tan",
    podSignUrl: null,
  },
  {
    id: "SHP-002",
    awbNumber: "1Z999AA10123456785",
    carrier: "UPS",
    shipTo: "Blue Harbor Cold Storage",
    shippingDate: "2026-08-09",
    receivedDate: null,
    items: [
      { description: "Compressor Unit", qty: 1 },
      { description: "Sensor Array", qty: 4 },
    ],
    customer: "Blue Harbor Cold Storage",
    receivedBy: null,
    podSignUrl: null,
  },
  {
    id: "SHP-003",
    awbNumber: "1Z999AA10123456786",
    carrier: "DHL",
    shipTo: "Pinegrove Data Centres",
    shippingDate: "2026-08-08",
    receivedDate: "2026-08-11",
    items: [
      { description: "Server Rack", qty: 1 },
      { description: "Cable Management Kit", qty: 2 },
    ],
    customer: "Pinegrove Data Centres",
    receivedBy: "Sarah Chen",
    podSignUrl: null,
  },
];

const VGO_ITEMS = [
  {
    id: "VGO-001",
    customerName: "Altair Manufacturing Co.",
    partNumber: "FLT-8820-XR",
    rentalSiteAddress: "88 Jurong East Ave 1, Bay 4",
    deviceNumber: "DEV-2201",
    serialNumber: "SN-88214-A",
    rentalStartDate: "2026-03-01",
    endDate: "2026-09-01",
    invoiceNumber: "INV-30981",
    paymentStatus: "Paid",
    doNumber: "DO-5521",
    podSN: "POD-8821-A",
  },
  {
    id: "VGO-002",
    customerName: "Blue Harbor Cold Storage",
    partNumber: "CHL-4410-B",
    rentalSiteAddress: "220 Harborview Dr, Dock 2",
    deviceNumber: "DEV-2202",
    serialNumber: "SN-44107-C",
    rentalStartDate: "2025-11-15",
    endDate: "2026-07-15",
    invoiceNumber: "INV-30822",
    paymentStatus: "Pending",
    doNumber: "DO-5522",
    podSN: "POD-4410-C",
  },
  {
    id: "VGO-003",
    customerName: "Pinegrove Data Centres",
    partNumber: "SRV-7720-P",
    rentalSiteAddress: "17 Innovation Rd, Server Hall B",
    deviceNumber: "DEV-2203",
    serialNumber: "SN-77201-E",
    rentalStartDate: "2026-01-10",
    endDate: "2026-06-10",
    invoiceNumber: "INV-30755",
    paymentStatus: "Overdue",
    doNumber: "DO-5523",
    podSN: "POD-7720-E",
  },
];

function customerFor(id) {
  return CUSTOMERS.find((c) => c.id === id);
}
function partnerFor(id) {
  return PARTNERS.find((p) => p.id === id);
}
function fmtDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function daysUntil(d) {
  const diff = new Date(d + "T00:00:00") - new Date(new Date().toDateString());
  return Math.round(diff / 86400000);
}

function containsQuery(obj, query) {
  if (!query) return true;
  const hay = Object.values(obj).join(" ").toLowerCase();
  return hay.includes(query.toLowerCase());
}

// ---------------------------------------------------------------------------
// SHARED UI BITS
// ---------------------------------------------------------------------------

function StatusChip({ tone, children }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}

function AssetTag({ rental }) {
  const cust = customerFor(rental.customerId);
  const partner = partnerFor(rental.partnerId);
  const st = STATUS[rental.status];
  const pay = PAYMENT_STATUS[rental.paymentStatus];
  const left = daysUntil(rental.endDate);

  return (
    <div className="tag">
      <div className="tag-perf tag-perf-left" />
      <div className="tag-perf tag-perf-right" />
      <div className="tag-body">
        <div className="tag-top">
          <div className="tag-id">
            <Hash size={12} strokeWidth={2.5} />
            {rental.id}
          </div>
          <StatusChip tone={st.tone}>{st.label}</StatusChip>
        </div>

        <div className="tag-serial">S/N {rental.serialNumber}</div>
        <div className="tag-part">{rental.partNumber}</div>

        <div className="tag-divider" />

        <div className="tag-row">
          <Building2 size={13} />
          <span>{cust?.company}</span>
        </div>
        <div className="tag-row">
          <MapPin size={13} />
          <span>{rental.siteAddress}</span>
        </div>
        <div className="tag-row">
          <Users size={13} />
          <span>{partner?.name}</span>
        </div>

        <div className="tag-divider" />

        <div className="tag-dates">
          <div>
            <div className="tag-label">Start</div>
            <div className="tag-value">{fmtDate(rental.rentalStart)}</div>
          </div>
          <ChevronRight size={14} className="tag-arrow" />
          <div>
            <div className="tag-label">End</div>
            <div className="tag-value">{fmtDate(rental.endDate)}</div>
          </div>
        </div>

        {rental.status !== "returned" && (
          <div className={`tag-countdown ${left < 0 ? "is-late" : left <= 14 ? "is-soon" : ""}`}>
            {left < 0
              ? `${Math.abs(left)} days overdue`
              : `${left} days remaining`}
          </div>
        )}

        <div className="tag-divider" />

        <div className="tag-footer">
          <div className="tag-invoice">
            <FileText size={13} />
            <span>{rental.invoiceNumber}</span>
          </div>
          <StatusChip tone={pay.tone}>{pay.label}</StatusChip>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LOGIN SCREEN
// ---------------------------------------------------------------------------

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-screen">
      <div className="login-grid" />
      <div className="login-card">
        <div className="login-mark">
          <Package size={22} strokeWidth={2} />
        </div>
        <div className="login-eyebrow">Asset Tracking Console</div>
        <h1 className="login-title">Sign in to Trackyard</h1>
        <p className="login-sub">Track rentals, partners &amp; customers in one register.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          <label className="field">
            <span className="field-label">
              <User size={13} /> User name
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="j.tan"
              autoFocus
            />
          </label>

          <label className="field">
            <span className="field-label">
              <Lock size={13} /> Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <button type="submit" className="btn-primary login-btn">
            Sign in
          </button>
        </form>

        <div className="login-foot">Demo mode — any credentials work</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------------

function Dashboard() {
  const total = RENTALS.length;
  const active = RENTALS.filter((r) => r.status === "active").length;
  const overdue = RENTALS.filter((r) => r.status === "overdue").length;
  const endingSoon = RENTALS.filter((r) => r.status === "ending_soon").length;

  return (
    <div className="stat-row">
      <div className="stat-card">
        <div className="stat-label">Total rentals</div>
        <div className="stat-value">{total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active</div>
        <div className="stat-value tone-active">{active}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Ending soon</div>
        <div className="stat-value tone-warn">{endingSoon}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Overdue</div>
        <div className="stat-value tone-overdue">{overdue}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NEW RENTAL MODAL
// ---------------------------------------------------------------------------

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

const EMPTY_SHIPMENT_FORM = {
  awbNumber: "",
  carrier: "",
  shipTo: "",
  shippingDate: "",
  receivedDate: "",
  items: [],
  customer: "",
  receivedBy: "",
  podSignUrl: null,
};

const EMPTY_VGO_FORM = {
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

function NewRentalModal({ onClose, onSave }) {
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

function NewShipmentModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_SHIPMENT_FORM);

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
          <div className="modal-title" id="modal-title">New shipment</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <label className="field">
                <span className="field-label"><FileText size={13} /> AWB number</span>
                <input
                  required
                  placeholder="e.g. 1Z999AA10123456784"
                  value={form.awbNumber}
                  onChange={(e) => set("awbNumber", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Truck size={13} /> Carrier</span>
                <select
                  required
                  value={form.carrier}
                  onChange={(e) => set("carrier", e.target.value)}
                >
                  <option value="">Select carrier…</option>
                  <option value="FedEx">FedEx</option>
                  <option value="UPS">UPS</option>
                  <option value="DHL">DHL</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Building2 size={13} /> Ship to</span>
                <input
                  required
                  placeholder="e.g. Altair Manufacturing Co."
                  value={form.shipTo}
                  onChange={(e) => set("shipTo", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Building2 size={13} /> Customer</span>
                <select
                  required
                  value={form.customer}
                  onChange={(e) => set("customer", e.target.value)}
                >
                  <option value="">Select customer…</option>
                  {CUSTOMERS.map((c) => (
                    <option key={c.id} value={c.company}>{c.company}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-row">
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Shipping date</span>
                <input
                  type="date"
                  required
                  value={form.shippingDate}
                  onChange={(e) => set("shippingDate", e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label"><Calendar size={13} /> Received date</span>
                <input
                  type="date"
                  value={form.receivedDate}
                  onChange={(e) => set("receivedDate", e.target.value)}
                />
              </label>
            </div>

            <label className="field">
              <span className="field-label"><User size={13} /> Received by</span>
              <input
                placeholder="e.g. John Tan"
                value={form.receivedBy}
                onChange={(e) => set("receivedBy", e.target.value)}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Create shipment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RentalsView() {
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
      const cust = customerFor(r.customerId)?.company ?? "";
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

function PartnersView() {
  return (
    <div>
      <div className="section-head">
        <h2>Partner directory</h2>
        <button className="btn-primary btn-add">
          <Plus size={15} /> New partner
        </button>
      </div>
      <div className="ledger">
        <div className="ledger-head">
          <span>Partner</span>
          <span>Location</span>
          <span>Contact</span>
          <span>Fleet</span>
        </div>
        {PARTNERS.map((p) => {
          const count = RENTALS.filter((r) => r.partnerId === p.id).length;
          return (
            <div className="ledger-row" key={p.id}>
              <div className="ledger-main">
                <div className="ledger-avatar">{p.name.charAt(0)}</div>
                <div>
                  <div className="ledger-name">{p.name}</div>
                  <div className="ledger-sub">{p.id}</div>
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <MapPin size={12} /> {p.address}
                </div>
                <div className="ledger-line ledger-dim">
                  {p.city}, {p.country}
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <Mail size={12} /> {p.email}
                </div>
                <div className="ledger-line">
                  <Phone size={12} /> {p.contact}
                </div>
              </div>
              <div className="ledger-cell">
                <StatusChip tone="neutral">{count} units</StatusChip>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomersView() {
  return (
    <div>
      <div className="section-head">
        <h2>Customer directory</h2>
        <button className="btn-primary btn-add">
          <Plus size={15} /> New customer
        </button>
      </div>
      <div className="ledger">
        <div className="ledger-head">
          <span>Customer</span>
          <span>Address</span>
          <span>Contact</span>
          <span>Rentals</span>
        </div>
        {CUSTOMERS.map((c) => {
          const count = RENTALS.filter((r) => r.customerId === c.id).length;
          return (
            <div className="ledger-row" key={c.id}>
              <div className="ledger-main">
                <div className="ledger-avatar">{c.company.charAt(0)}</div>
                <div>
                  <div className="ledger-name">{c.company}</div>
                  <div className="ledger-sub">{c.id}</div>
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <MapPin size={12} /> {c.address}
                </div>
              </div>
              <div className="ledger-cell">
                <div className="ledger-line">
                  <Mail size={12} /> {c.email}
                </div>
                <div className="ledger-line">
                  <Phone size={12} /> {c.contact}
                </div>
              </div>
              <div className="ledger-cell">
                <StatusChip tone="neutral">{count} active</StatusChip>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrackingTable({ columns, rows }) {
  return (
    <div className="tracking-table-wrap">
      <table className="tracking-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty-state">No records match this search.</div>}
    </div>
  );
}

function InstallationsView() {
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

function ContractsView() {
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

function ShipmentsView() {
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

function NewVGOModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_VGO_FORM);

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

function VGOView() {
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

// ---------------------------------------------------------------------------
// APP SHELL
// ---------------------------------------------------------------------------

const NAV = [
  { key: "installations", label: "Installations", icon: Wrench },
  { key: "rentals", label: "Rentals", icon: Package },
  { key: "contracts", label: "Contracts", icon: ClipboardList },
  { key: "shipments", label: "Shipments", icon: Truck },
  { key: "vgo", label: "VGO", icon: LayoutGrid },
  { key: "partners", label: "Partners", icon: Users },
  { key: "customers", label: "Customers", icon: Building2 },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("rentals");

  const currentNavItem = NAV.find((item) => item.key === tab) ?? NAV[0];
  const CurrentTabIcon = currentNavItem.icon;

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <img src={xsysLogo} alt="XSYS" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <div className="brand-name">Trackyard</div>
        </div>

        <nav className="nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={`nav-item ${tab === item.key ? "nav-item-active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <div className="topbar-icon">
              <CurrentTabIcon size={14} />
            </div>
            {tab === "installations" && "Installation tracking"}
            {tab === "rentals" && "Rental tracking"}
            {tab === "contracts" && "Contract tracking"}
            {tab === "shipments" && "Shipment tracking"}
            {tab === "vgo" && "VGO inventory tracking"}
            {tab === "partners" && "Partners"}
            {tab === "customers" && "Customers"}
          </div>

          <div className="topbar-actions">
            <div className="topbar-user">j.tan · Operations</div>
            <button className="header-signout" onClick={() => setLoggedIn(false)}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <div className="content">
          {tab === "installations" && <InstallationsView />}
          {tab === "rentals" && <RentalsView />}
          {tab === "contracts" && <ContractsView />}
          {tab === "shipments" && <ShipmentsView />}
          {tab === "vgo" && <VGOView />}
          {tab === "partners" && <PartnersView />}
          {tab === "customers" && <CustomersView />}
        </div>
      </main>
    </div>
  );
}
