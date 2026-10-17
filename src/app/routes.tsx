import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
// Commerce (Grocery) — existing
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProductsPage } from '../features/products/ProductsPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { CategoriesPage } from '../features/categories/CategoriesPage';
import { PricingPage } from '../features/pricing/PricingPage';
import { OrdersPage } from '../features/orders/OrdersPage';
import { CustomersPage } from '../features/customers/CustomersPage';
import { DeliveryPartnersPage } from '../features/delivery-partners/DeliveryPartnersPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { NotFoundPage } from '../features/not-found/NotFoundPage';
// Ride Booking — new
import { RideOverviewPage } from '../features/rides/RideOverviewPage';
import { RideBookingsPage } from '../features/rides/RideBookingsPage';
import { DriversVehiclesPage } from '../features/rides/DriversVehiclesPage';
// Parcel Delivery — new
import { ParcelOverviewPage } from '../features/parcels/ParcelOverviewPage';
import { ParcelBookingsPage } from '../features/parcels/ParcelBookingsPage';
import { ParcelTrackingPage } from '../features/parcels/ParcelTrackingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // ==========================================
      // COMMERCE — Quick Commerce / Grocery
      // ==========================================
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'categories',
        element: <CategoriesPage />,
      },
      {
        path: 'pricing',
        element: <PricingPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: 'delivery-partners',
        element: <DeliveryPartnersPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      // ==========================================
      // RIDE BOOKING MODULE
      // ==========================================
      {
        path: 'rides',
        element: <RideOverviewPage />,
      },
      {
        path: 'rides/bookings',
        element: <RideBookingsPage />,
      },
      {
        path: 'rides/drivers',
        element: <DriversVehiclesPage />,
      },
      // ==========================================
      // PARCEL DELIVERY MODULE
      // ==========================================
      {
        path: 'parcels',
        element: <ParcelOverviewPage />,
      },
      {
        path: 'parcels/bookings',
        element: <ParcelBookingsPage />,
      },
      {
        path: 'parcels/tracking',
        element: <ParcelTrackingPage />,
      },
      // ==========================================
      // CATCH-ALL
      // ==========================================
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
