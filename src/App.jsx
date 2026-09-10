import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
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
import { fetchCurrentUser, logout } from "./api/auth.js";
import { getToken, setUnauthorizedHandler } from "./api/client.js";

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

function AppLayout({ user, onSignOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const currentPage = pathname.split("/").filter(Boolean).pop();
  const navItem = NAV.find((item) => item.key === currentPage) ?? NAV[0];
  const CurrentPageIcon = navItem.icon;

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
              <NavLink
                key={item.key}
                to={item.key}
                className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
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
              {PAGE_TITLES[navItem.key]}
            </div>
          </div>

          <div className="topbar-actions">
            <div className="topbar-user">{user?.displayName ?? user?.username}</div>
            <button className="header-signout" onClick={onSignOut}>
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>

      {mobileMenuOpen && <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  // Undefined until we know: prevents the login screen flashing on reload
  // while the stored token is being validated.
  const [restoring, setRestoring] = useState(() => Boolean(getToken()));

  useEffect(() => {
    // Any 401 from anywhere in the app drops back to the login screen.
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;
    fetchCurrentUser()
      .then((u) => !cancelled && setUser(u))
      .catch(() => {}) // client.js already cleared the bad token
      .finally(() => !cancelled && setRestoring(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSignOut() {
    logout();
    setUser(null);
  }

  if (restoring) return <div className="app-loading">Restoring session…</div>;
  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <Routes>
      <Route element={<AppLayout user={user} onSignOut={handleSignOut} />}>
        <Route index element={<Navigate to="rentals" replace />} />
        <Route path="installations" element={<InstallationsPage />} />
        <Route path="rentals" element={<RentalsPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="shipments" element={<ShipmentsPage />} />
        <Route path="vgo" element={<VGOPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="*" element={<Navigate to="rentals" replace />} />
      </Route>
    </Routes>
  );
}
