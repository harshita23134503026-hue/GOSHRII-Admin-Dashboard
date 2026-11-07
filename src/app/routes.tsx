import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { LoginPage } from '../features/auth/LoginPage';
// Commerce (Grocery) — existing
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProductsPage } from '../features/products/ProductsPage';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { CategoriesPage } from '../features/categories/CategoriesPage';
import { PricingPage } from '../features/pricing/PricingPage';
import { OrdersPage } from '../features/orders/OrdersPage';
import { CustomersPage } from '../features/customers/CustomersPage';
import { DeliveryPartnersPage } from '../features/delivery-partners/DeliveryPartnersPage';
import { StoresPage } from '../features/stores/StoresPage';
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
import { AdminRole } from '../types';

/** Roles that have full access to all modules */
const FULL_ACCESS: AdminRole[] = ['admin'];

export const router = createBrowserRouter([
  // ==========================================
  // AUTH — Public routes (no layout)
  // ==========================================
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ==========================================
  // PROTECTED — Requires authentication
  // ==========================================
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      // ==========================================
      // OVERVIEW — All roles
      // ==========================================
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      // ==========================================
      // COMMERCE — All roles (store_manager and admin)
      // ==========================================
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
      // ==========================================
      // SHARED MANAGEMENT — Full-access only
      // ==========================================
      {
        path: 'customers',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <CustomersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'delivery-partners',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <DeliveryPartnersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'stores',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <StoresPage />
          </ProtectedRoute>
        ),
      },
      // Settings — accessible to all roles
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      // ==========================================
      // RIDE BOOKING MODULE — Full-access only
      // ==========================================
      {
        path: 'rides',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <RideOverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'rides/bookings',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <RideBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'rides/drivers',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <DriversVehiclesPage />
          </ProtectedRoute>
        ),
      },
      // ==========================================
      // PARCEL DELIVERY MODULE — Full-access only
      // ==========================================
      {
        path: 'parcels',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <ParcelOverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'parcels/bookings',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <ParcelBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'parcels/tracking',
        element: (
          <ProtectedRoute allowedRoles={FULL_ACCESS}>
            <ParcelTrackingPage />
          </ProtectedRoute>
        ),
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
