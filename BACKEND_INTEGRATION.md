# GOSHRII Admin Console — Backend Integration Guide

## 1. Executive Summary & Objective

**GOSHRII** is an administrative operations console managing three major business domains:
1. Quick-Commerce / Dark Store Grocery Operations
2. Ride Booking & Fleet Dispatch Administration
3. Local Point-to-Point Parcel Delivery Administration

Authentication and live production databases have been intentionally decoupled so that the frontend can be thoroughly audited, reviewed, and demonstrated with realistic local mock data and instant state updates via `src/services/mockDb.ts` and `src/services/adminService.ts`.

This document serves as the formal specification for transitioning from the local mock service adapter to the production backend APIs.

---

## 2. Central API Client Architecture

A centralized Axios instance is already preconfigured in [`src/services/apiClient.ts`](./src/services/apiClient.ts).

### Environment Configuration
- Create a `.env.production` file:
  ```env
  VITE_API_BASE_URL=https://api.goshrii.internal/v1
  ```
- The Axios instance automatically reads `import.meta.env.VITE_API_BASE_URL`.

### JWT Bearer Authentication Interceptor
When live JWT authentication is activated:
```ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('goshrii_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 3. Service Modules and REST Endpoints Mapping

### Domain 1: Quick-Commerce / Grocery
| Module | Mock Adapter Method (`adminService`) | Target Backend REST Endpoint | HTTP Method | Required Authorization / RBAC |
|---|---|---|---|---|
| **Products** | `getProducts()` | `/api/v1/commerce/products` | `GET` | `CATALOG_VIEWER`, `STORE_LEAD` |
| | `createProduct(data)` | `/api/v1/commerce/products` | `POST` | `CATALOG_MANAGER`, `ADMIN` |
| | `updateProduct(id, updates)` | `/api/v1/commerce/products/:id` | `PATCH` | `CATALOG_MANAGER`, `ADMIN` |
| | `archiveProduct(id, flag)` | `/api/v1/commerce/products/:id/archive` | `POST` | `CATALOG_MANAGER`, `ADMIN` |
| **Inventory** | `adjustStock(params)` | `/api/v1/commerce/inventory/adjust` | `POST` | `DARK_STORE_LEAD`, `INVENTORY_AUDITOR` |
| | `getStockAdjustments()` | `/api/v1/commerce/inventory/adjustments` | `GET` | `STORE_LEAD`, `AUDIT_COMPLIANCE` |
| **Categories**| `getCategories()` | `/api/v1/commerce/categories` | `GET` | `CATALOG_VIEWER`, `STORE_LEAD` |
| | `createCategory(data)` | `/api/v1/commerce/categories` | `POST` | `CATALOG_MANAGER`, `ADMIN` |
| | `updateCategory(id, updates)` | `/api/v1/commerce/categories/:id` | `PATCH` | `CATALOG_MANAGER`, `ADMIN` |
| | `archiveCategory(id, flag)` | `/api/v1/commerce/categories/:id/archive` | `POST` | `CATALOG_MANAGER`, `ADMIN` |
| **Pricing** | `updatePrice(params)` | `/api/v1/commerce/pricing/update` | `POST` | `COMMERCIAL_PRICING_LEAD` |
| | `getPriceHistories()` | `/api/v1/commerce/pricing/history` | `GET` | `COMMERCIAL_PRICING_LEAD`, `STORE_LEAD` |
| **Offers** | `getOffers()` | `/api/v1/commerce/promotions` | `GET` | `MARKETING_LEAD`, `STORE_LEAD` |
| | `createOffer(offer)` | `/api/v1/commerce/promotions` | `POST` | `MARKETING_LEAD`, `ADMIN` |
| | `updateOffer(id, updates)` | `/api/v1/commerce/promotions/:id` | `PATCH` | `MARKETING_LEAD`, `ADMIN` |
| **Grocery Orders** | `getOrders()` | `/api/v1/commerce/orders` | `GET` | `DISPATCH_OPERATOR`, `STORE_LEAD` |
| | `updateOrderStatus(id, status)`| `/api/v1/commerce/orders/:id/lifecycle` | `POST` | `DISPATCH_OPERATOR`, `PICKER_SUPERVISOR` |
| **Customers** | `getCustomers()` | `/api/v1/customers` | `GET` | `CUSTOMER_SUPPORT_LEAD` (Masked PII) |
| **Grocery Riders** | `getDeliveryPartners()` | `/api/v1/commerce/fleet/riders` | `GET` | `FLEET_MANAGER`, `DISPATCHER` |

### Domain 2: Ride Booking Administration
| Module | Mock Adapter Method (`adminService`) | Target Backend REST Endpoint | HTTP Method | Required Authorization / RBAC |
|---|---|---|---|---|
| **Rides** | `getRides()` | `/api/v1/rides` | `GET` | `RIDE_DISPATCHER`, `OPS_LEAD` |
| | `getRideById(id)` | `/api/v1/rides/:id` | `GET` | `RIDE_DISPATCHER`, `OPS_LEAD` |
| | `assignRideDriver(rideId, driverId)` | `/api/v1/rides/:id/assign-driver` | `POST` | `RIDE_DISPATCHER`, `OPS_LEAD` |
| | `cancelRide(rideId, reason)` | `/api/v1/rides/:id/cancel` | `POST` | `RIDE_DISPATCHER`, `SUPPORT_SUPERVISOR` |
| **Ride Drivers**| `getRideDrivers()` | `/api/v1/rides/drivers` | `GET` | `FLEET_MANAGER`, `OPS_LEAD` |
| | `getRideDriverById(id)` | `/api/v1/rides/drivers/:id` | `GET` | `FLEET_MANAGER`, `OPS_LEAD` |

### Domain 3: Local Point-to-Point Parcel Delivery
| Module | Mock Adapter Method (`adminService`) | Target Backend REST Endpoint | HTTP Method | Required Authorization / RBAC |
|---|---|---|---|---|
| **Parcels** | `getParcels()` | `/api/v1/parcels` | `GET` | `PARCEL_DISPATCHER`, `OPS_LEAD` |
| | `getParcelById(id)` | `/api/v1/parcels/:id` | `GET` | `PARCEL_DISPATCHER`, `OPS_LEAD` |
| | `getParcelByTrackingId(q)` | `/api/v1/parcels/track/:trackingId` | `GET` | `PARCEL_DISPATCHER`, `SUPPORT_AGENT` |
| | `createParcelBooking(data)` | `/api/v1/parcels` | `POST` | `PARCEL_DISPATCHER`, `OPS_LEAD` |
| | `assignParcelCourier(parcelId, courierId)` | `/api/v1/parcels/:id/assign-courier` | `POST` | `PARCEL_DISPATCHER`, `OPS_LEAD` |
| **Couriers** | `getParcelCouriers()` | `/api/v1/parcels/couriers` | `GET` | `FLEET_MANAGER`, `OPS_LEAD` |
| | `getParcelCourierById(id)` | `/api/v1/parcels/couriers/:id` | `GET` | `FLEET_MANAGER`, `OPS_LEAD` |

---

## 4. Migration Steps from Mock to Live Backend

1. **Keep Component Interfaces Unchanged:**
   Features consume methods via `adminService` and TanStack Query keys.
2. **Implement Production API Adapters:**
   Replace internal `mockDb.*` calls inside `adminService.ts` with typed `apiClient.get()`, `apiClient.post()`, etc.
3. **Activate Error Handling Interceptor:**
   Global toasts and 401 unauthenticated redirect handlers are plugged into `apiClient.interceptors.response`.
