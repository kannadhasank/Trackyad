---
name: architecture-summary
description: Summarize the Trackyad application architecture and structure
---

# Trackyad Architecture Summary

## 🏗️ High-Level Architecture

**Trackyad** is a React + Vite asset tracking application with a clean, modular component structure. It uses state-based routing (not URL-based) and emphasizes separation of concerns through dedicated component folders.

```
App (Root)
├── State: loggedIn, currentPage, mobileMenuOpen
├── Pages (rendered based on currentPage)
│   ├── RentalsPage
│   ├── PartnersPage
│   ├── CustomersPage
│   ├── InstallationsPage
│   ├── ContractsPage
│   ├── ShipmentsPage
│   └── VGOPage
└── Layout
    ├── Sidebar (navigation - collapses to mobile menu ≤768px)
    ├── Topbar (header - fixed on mobile)
    └── Content Area
```

## 📁 Folder Organization

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `src/components/pages/` | Feature pages | RentalsPage, PartnersPage, etc. |
| `src/components/shared/` | Reusable UI | StatusChip, AssetTag, TrackingTable |
| `src/components/modals/` | Forms/dialogs | NewRentalModal, NewShipmentModal |
| `src/components/auth/` | Authentication | LoginScreen |
| `src/data/` | Mock data | mockData.js (PARTNERS, CUSTOMERS, RENTALS, etc.) |
| `src/utils/` | Helpers | helpers.js (fmtDate, customerFor, etc.) |

## 🔄 Data Flow

1. **Mock Data** → `src/data/mockData.js` (centralized, easy to swap with API)
2. **Pages** → Import data directly, manage local state for filtering/modals
3. **Shared Components** → Receive data via props, no state management
4. **Modals** → Collect form input, call `onSave` callback to parent page

No global state management (Redux/Context) — each page owns its data/UI state.

## 📱 Responsive Design

**Three breakpoints in CSS:**

- **Desktop** (>768px): Vertical sidebar + main content
- **Tablet/Mobile** (≤768px): Hamburger menu, sidebar slides in from left, fixed topbar
- **Small Mobile** (≤480px): Same layout, compressed spacing

**Mobile Menu Implementation:**
- `.mobile-menu-toggle` button in topbar (hamburger icon)
- Sidebar uses `transform: translateX(-100%)` animation
- `.mobile-overlay` semi-transparent backdrop closes menu on click
- Menu auto-closes when page is selected

## 🎨 Styling

- **No CSS-in-JS or Tailwind** — plain CSS in `src/index.css`
- **CSS Custom Properties** — Define colors/spacing in `:root` (--ink, --panel, --amber, etc.)
- **Mobile-First Media Queries** — Base styles for desktop, override at breakpoints
- **Responsive Grid/Flex** — Tables and cards adapt to screen size

## 🔑 Key Technical Decisions

| Decision | Why |
|----------|-----|
| **State-based routing** | Simpler than React Router for this app; can add URL routing later if needed |
| **Centralized mock data** | Easy to transition to real API—just update mockData.js and data layer |
| **Component per page** | Clear separation; each page manages its own state/modals |
| **Shared utility functions** | `fmtDate()`, `customerFor()` used across multiple components |
| **Fixed topbar on mobile** | Keeps header accessible while content scrolls |

## 🚀 Development Workflow

**To add a new page:**
1. Create `src/components/pages/NewPageName.jsx`
2. Add to `PAGE_COMPONENTS` object in App.jsx
3. Add nav item to `NAV` array in App.jsx
4. Page component manages its own state, modals, filtering

**To add a modal:**
1. Create form component in `src/components/modals/`
2. Import into page component
3. Pass `onSave` callback to update page state

**To modify styles:**
- Edit `src/index.css` (desktop-first rules, then media queries)
- Mobile breakpoints: 768px (tablet), 480px (small mobile)

## 📦 Dependencies

- **React 18.3.1** — UI framework
- **Vite 5.4.0** — Build tool, dev server
- **lucide-react** — Icons (Package, Users, Menu, X, etc.)
- **react-router-dom 7.18.2** — Installed for future routing migration

## 🌐 Deployment

- **Target**: GitHub Pages (gh-pages branch)
- **Base URL**: `/Trackyad/` (configured in vite.config.js)
- **CI/CD**: GitHub Actions workflow handles auto-build on push
- **Build output**: `dist/` folder

## 💡 Common Tasks

- **Search/filter**: Each page has its own search state + filtering logic
- **Add/edit records**: Use modals that collect form input, call parent `onSave`
- **Style changes**: Modify `src/index.css`, test at breakpoints (768px, 480px)
- **Mobile testing**: Resize browser or use DevTools device emulation
