# GOSHRII — Multi-Service Operations Admin Platform

**GOSHRII** is a modern, high-density, production-style SaaS operations console for a multi-service consumer platform operating across Indian urban hubs. Built with React, TypeScript, Vite, Tailwind CSS, TanStack Query, and Recharts, GOSHRII provides unified administration across three core business domains:

1. **Quick-Commerce / Grocery Dark Store Operations**
2. **Ride Booking & Fleet Dispatch Administration**
3. **Local Point-to-Point Parcel Delivery Administration**

---

## 🌟 Architecture & Business Domains

### 🛒 Domain 1: Quick-Commerce / Dark Store Operations
- **Dashboard (`/dashboard`):** 4 primary KPIs, active alerts panel, revenue trend visualizations, and live dispatch manifest.
- **Products (`/products`):** Catalog management with quick-commerce card & table toggles, Zod validation, and soft-archive.
- **Inventory (`/inventory`):** Stock auditing with Available vs Reserved counts, adjustment drawer with signed reasons, and velocity metrics.
- **Categories (`/categories`):** Hierarchy management with direct product counts and visual category cards.
- **Pricing & Offers (`/pricing`):** Dual-tab manager for MRP validation and promotional discount campaigns.
- **Grocery Orders (`/orders`):** State machine lifecycle (`PLACED` → `CONFIRMED` → `PICKING` → `PACKED` → `OUT_FOR_DELIVERY` → `DELIVERED`) with itemized receipts.
- **Customers (`/customers`):** Directory with PII phone masking (`+91 98*** **421`), order history, and saved address logs.
- **Grocery Delivery Partners (`/delivery-partners`):** Fleet availability, vehicle allocation, and performance metrics.
- **Analytics & Reports (`/reports`):** Multi-tab analytics with date range presets, Recharts graphs, and dynamic CSV export.
- **Settings (`/settings`):** Store operator profile, system preferences, and 1-click **Reset Demo Data** tool.

### 🚗 Domain 2: Ride Booking Administration
- **Ride Overview (`/rides`):**
  - Live KPI cards: Active Trips, Completed Today, Gross Bookings (₹), and Fleet Utilization rate.
  - Operational dispatch attention banner for unassigned / searching requests.
  - Hourly trip demand & revenue bar charts and vehicle category distribution pie chart.
  - Real-time recent bookings manifest with one-click ride inspection.
- **Ride Bookings (`/rides/bookings`):**
  - High-density table with full-text search across Ride ID, passenger, driver, vehicle plate, and localities.
  - Dual filter controls by Ride Status (`REQUESTED`, `SEARCHING_DRIVER`, `DRIVER_ASSIGNED`, `DRIVER_ARRIVING`, `RIDE_STARTED`, `RIDE_COMPLETED`, `CANCELLED`) and Vehicle Category (`AUTO`, `HATCHBACK`, `SEDAN`, `PREMIER_SUV`).
  - **Ride Details Drawer:** Service tier, pickup/dropoff addresses, passenger & driver info, fare & platform fee breakdown, and chronological audit log.
  - Interactive **Assign Driver** modal (filtering available drivers) and **Cancel Ride** dialog with reason tracking.
- **Drivers & Vehicles (`/rides/drivers`):**
  - Fleet metrics: Total fleet, Available Now, On Trip, and Offline/Suspended.
  - Comprehensive driver directory with ratings, vehicle registration numbers, completed trips, and earnings.
  - **Driver Profile Drawer:** Detailed credentials, verification status, and assigned trip history.

### 📦 Domain 3: Local Point-to-Point Parcel Delivery
- **Parcel Overview (`/parcels`):**
  - Operational KPIs: Active Deliveries, Delivered, Revenue, and Available Couriers.
  - High-priority dispatch banners for pending courier assignments and delivery exceptions.
  - Daily booking volume bar chart and parcel category share breakdown.
  - Recent shipment manifest with tracking links.
- **Parcel Bookings (`/parcels/bookings`):**
  - Table-first point-to-point booking management with multi-attribute search and category/status filtering.
  - **New Parcel Booking Drawer (`AddParcelDrawer`):** 3-stage interactive booking wizard with sender details, recipient details, package specifications, deterministic fee calculation (₹80 base + ₹25/kg), review screen, and tracking ID generation (`GOSH-TRK-XXXX`).
  - **Parcel Details Drawer:** Tracking ID copy button, complete sender/recipient details, package specifications, courier assignment modal, and delivery timeline.
- **Parcel Tracking Console (`/parcels/tracking`):**
  - Dedicated tracking interface with URL parameter support (`/parcels/tracking?q=GOSH-TRK-7411`).
  - Quick-access demo tracking ID chips.
  - 2-column layout: Booking details card on left, visual chronological tracking timeline with milestone icons on right.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS with minimal SaaS color system:
  - Primary Background: `#FFFFFF`
  - Secondary Background: `#F8FAFC`
  - Borders: `#E5E7EB`
  - Accent Green: `#16845B`
- **Icons:** Lucide React
- **Routing:** React Router v7 (`createBrowserRouter`)
- **Server State:** TanStack Query v5
- **Forms & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts
- **HTTP Client:** Axios (centralized API client ready for JWT integration)
- **Data Persistence:** LocalStorage-persisted reactive mock database (`mockDb.ts`) with atomic updates and complete seed records for all three domains.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🔒 Future Backend Integration

Detailed RESTful API contracts, JWT authentication architecture, endpoint schemas for all 3 business domains, and mock adapter conversion patterns are documented in [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md).
