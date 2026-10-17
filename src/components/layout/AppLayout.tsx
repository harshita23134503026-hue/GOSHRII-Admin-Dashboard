import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Operations Dashboard',
  '/products': 'Product Catalog',
  '/inventory': 'Inventory & Stock Management',
  '/categories': 'Categories & Taxonomy',
  '/pricing': 'Pricing & Promotional Offers',
  '/orders': 'Grocery Order Fulfillment',
  '/rides': 'Ride Operations Overview',
  '/rides/bookings': 'Ride Bookings Management',
  '/rides/drivers': 'Drivers & Fleet Vehicles',
  '/parcels': 'Parcel Operations Overview',
  '/parcels/bookings': 'Point-to-Point Parcel Bookings',
  '/parcels/tracking': 'Parcel Tracking Console',
  '/customers': 'Customer Directory',
  '/delivery-partners': 'Grocery Delivery Fleet',
  '/reports': 'Analytics & Business Reports',
  '/settings': 'Platform Settings',
};

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const currentTitle = routeTitleMap[location.pathname] || 'GOSHRII Operations Platform';

  return (
    <div className="min-h-screen bg-surface-secondary flex text-ink-primary font-sans antialiased overflow-x-hidden">
      {/* Left Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          pageTitle={currentTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
