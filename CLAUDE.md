# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Trackyad** is an asset tracking and rental management application built with React + Vite. It provides a dashboard for tracking rentals, installations, contracts, shipments, and inventory across partners and customers. The app features a responsive design with mobile support and a modular component architecture.

## Architecture

### Core Structure

```
src/
├── App.jsx              (Root component - handles auth state & page routing)
├── main.jsx             (Entry point)
├── index.css            (Global styles + responsive breakpoints)
├── components/
│   ├── pages/           (Page/view components - one per major feature)
│   ├── modals/          (Form/dialog modals for creating records)
│   ├── shared/          (Reusable UI components - StatusChip, AssetTag, TrackingTable)
│   └── auth/            (LoginScreen)
├── data/
│   └── mockData.js      (All mock data - PARTNERS, CUSTOMERS, RENTALS, etc.)
└── utils/
    └── helpers.js       (Shared utility functions - fmtDate, customerFor, etc.)
```

### Routing & State Management

**Important**: Routing is **state-based, not React Router URL-based**. The `App.jsx` component:
- Manages `loggedIn` and `currentPage` state
- Dynamically renders page components based on `currentPage` string value
- Uses `PAGE_COMPONENTS` and `PAGE_TITLES` objects for mapping

Mobile menu state is also managed in `App.jsx` via `mobileMenuOpen`, with close handlers in page components.

### Page Components

Each page is a self-contained component in `src/components/pages/`:
- `RentalsPage` - Shows rental cards with filtering
- `PartnersPage`, `CustomersPage` - Directory tables
- `InstallationsPage`, `ContractsPage`, `ShipmentsPage`, `VGOPage` - Tracking tables
- `Dashboard` - Stats cards (used within RentalsPage)

Pages are responsible for their own state (search, filters, modals) and don't share state across pages.

### Responsive Design Approach

Three breakpoints in `src/index.css`:
- **Desktop** (>768px): Vertical sidebar, full-width layout
- **Tablet** (≤768px): Left-side slide-out menu with hamburger toggle, fixed topbar
- **Mobile** (≤480px): Same as tablet, but compressed spacing/sizing

Key CSS classes for mobile: `.mobile-menu-toggle`, `.mobile-overlay`, `.mobile-menu-open` (applied to `.sidebar`). The menu uses `transform: translateX(-100%)` animation.

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (Vite hot reload at http://localhost:5173/Trackyad/) |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm install` | Install dependencies (includes react-router-dom for future use) |

## Key Technical Decisions

### Mock Data Strategy
All mock data is centralized in `src/data/mockData.js` (not imported individually). This makes it easy to swap with real API calls later by updating just this file and the data layer.

### Component Naming
- **Page components** end in "Page" (`RentalsPage.jsx`)
- **Modal components** start with "New" (`NewRentalModal.jsx`)
- **Shared components** are generic (`StatusChip.jsx`, `TrackingTable.jsx`)

### Styling & Spacing
Dark theme with CSS variables defined in `:root` (`--ink`, `--panel`, `--amber`, etc.). Uses consistent spacing (12px gaps, 16px padding). No CSS-in-JS or Tailwind—plain CSS with media queries for responsive behavior.

### Mobile Menu Closing
Mobile menu closes automatically when:
1. User selects a navigation item (handled in `App.jsx` via `handlePageChange()`)
2. User clicks the semi-transparent overlay
3. User clicks the hamburger toggle button

The `onClick` handler in overlay is in the render, and nav item clicks call `setMobileMenuOpen(false)`.

## Common Workflows

**Adding a new page:**
1. Create `src/components/pages/NewPageName.jsx`
2. Add to `PAGE_COMPONENTS` and `PAGE_TITLES` objects in `App.jsx`
3. Add nav item to `NAV` array in `App.jsx`

**Adding a new modal:**
1. Create `src/components/modals/NewFooModal.jsx` with form logic
2. Import and use in the relevant page component
3. Pass `onSave` handler to trigger data update

**Styling changes:**
- Mobile-first: define base styles, then override in media queries
- Use CSS custom properties for colors/spacing to maintain consistency

## Deployment

App deployed to GitHub Pages (gh-pages branch). Vite config has `base: "/Trackyad/"` to handle the subdirectory. GitHub Actions workflow handles automated builds and deployment on push to gh-pages.
