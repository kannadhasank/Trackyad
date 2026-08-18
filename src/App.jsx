import { useState } from "react";
import { LayoutGrid, Package, Users, Building2, Wrench, ClipboardList, Truck, LogOut, Menu, X } from "lucide-react";
import xsysLogo from "../assets/XSYS network logo.avif";
import { LoginScreen } from "./components/auth/LoginScreen.jsx";
import { RentalsPage } from "./components/pages/RentalsPage.jsx";
import { PartnersPage } from "./components/pages/PartnersPage.jsx";
import { CustomersPage } from "./components/pages/CustomersPage.jsx";
import { InstallationsPage } from "./components/pages/InstallationsPage.jsx";
import { ContractsPage } from "./components/pages/ContractsPage.jsx";
import { ShipmentsPage } from "./components/pages/ShipmentsPage.jsx";
import { VGOPage } from "./components/pages/VGOPage.jsx";

const NAV = [
  { key: "installations", label: "Installations", icon: Wrench },
  { key: "rentals", label: "Rentals", icon: Package },
  { key: "contracts", label: "Contracts", icon: ClipboardList },
  { key: "shipments", label: "Shipments", icon: Truck },
  { key: "vgo", label: "VGO", icon: LayoutGrid },
  { key: "partners", label: "Partners", icon: Users },
  { key: "customers", label: "Customers", icon: Building2 },
];

const PAGE_TITLES = {
  installations: "Installation tracking",
  rentals: "Rental tracking",
  contracts: "Contract tracking",
  shipments: "Shipment tracking",
  vgo: "VGO inventory tracking",
  partners: "Partners",
  customers: "Customers",
};

const PAGE_COMPONENTS = {
  installations: InstallationsPage,
  rentals: RentalsPage,
  contracts: ContractsPage,
  shipments: ShipmentsPage,
  vgo: VGOPage,
  partners: PartnersPage,
  customers: CustomersPage,
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("rentals");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const navItem = NAV.find((item) => item.key === currentPage) ?? NAV[0];
  const CurrentPageIcon = navItem.icon;
  const CurrentPageComponent = PAGE_COMPONENTS[currentPage];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-menu-open" : ""}`}>
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
                className={`nav-item ${currentPage === item.key ? "nav-item-active" : ""}`}
                onClick={() => handlePageChange(item.key)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="topbar-title">
              <div className="topbar-icon">
                <CurrentPageIcon size={14} />
              </div>
              {PAGE_TITLES[currentPage]}
            </div>
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
          <CurrentPageComponent />
        </div>
      </main>

      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </div>
  );
}
