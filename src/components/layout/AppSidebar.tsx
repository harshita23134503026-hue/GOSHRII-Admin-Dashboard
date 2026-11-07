import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Boxes,
  Layers,
  Tag,
  ShoppingBag,
  Bike,
  Users,
  Settings,
  X,
  Store,
  Car,
  Navigation,
  UserCheck,
  PackageSearch,
  Truck,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../features/auth/authContext';
import { AdminRole } from '../../types';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  /** Roles that can see this section. Omit to show to all roles. */
  allowedRoles?: AdminRole[];
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics & Reports', to: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'COMMERCE',
    isCollapsible: true,
    defaultExpanded: true,
    items: [
      { name: 'Products', to: '/products', icon: Package },
      { name: 'Inventory', to: '/inventory', icon: Boxes },
      { name: 'Categories', to: '/categories', icon: Layers },
      { name: 'Pricing & Offers', to: '/pricing', icon: Tag },
      { name: 'Grocery Orders', to: '/orders', icon: ShoppingBag },
    ],
  },
  {
    title: 'RIDE BOOKING',
    isCollapsible: true,
    defaultExpanded: true,
    allowedRoles: ['admin'],
    items: [
      { name: 'Ride Overview', to: '/rides', icon: Car },
      { name: 'Ride Bookings', to: '/rides/bookings', icon: Navigation },
      { name: 'Drivers & Vehicles', to: '/rides/drivers', icon: UserCheck },
    ],
  },
  {
    title: 'PARCEL DELIVERY',
    isCollapsible: true,
    defaultExpanded: true,
    allowedRoles: ['admin'],
    items: [
      { name: 'Parcel Overview', to: '/parcels', icon: PackageSearch },
      { name: 'Parcel Bookings', to: '/parcels/bookings', icon: Truck },
      { name: 'Parcel Tracking', to: '/parcels/tracking', icon: Compass },
    ],
  },
  {
    title: 'SHARED MANAGEMENT',
    allowedRoles: ['admin'],
    items: [
      { name: 'Customers', to: '/customers', icon: Users },
      { name: 'Delivery Partners', to: '/delivery-partners', icon: Bike },
      { name: 'Stores', to: '/stores', icon: Store },
    ],
  },
  {
    // Visible to all roles including st_admin
    title: 'ACCOUNT',
    items: [
      { name: 'Settings', to: '/settings', icon: Settings },
    ],
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose, isCollapsed = false }) => {
  const location = useLocation();
  const { admin } = useAuth();
  const role = admin?.role;

  // Keep track of collapsed/expanded state for collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Filter sections by role
  const visibleSections = navSections.filter((section) => {
    if (!section.allowedRoles) return true; // visible to all
    if (!role) return false;
    return section.allowedRoles.includes(role);
  });

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-primary/30 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-border-light flex flex-col transition-all duration-200 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-border-light flex items-center justify-between shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-xs group-hover:bg-brand-600 transition-colors">
              <Store className="w-5 h-5 stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-ink-primary tracking-tight leading-none">
                  GOSHRII
                </span>
                <span className="text-[10px] text-brand-700 font-semibold tracking-wider uppercase mt-0.5">
                  {role === 'store_manager' ? 'Store Console' : 'Ops Console'}
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-ink-muted hover:text-ink-primary lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Store Manager role badge */}
        {!isCollapsed && role === 'store_manager' && (
          <div className="mx-3 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-[11px] font-semibold text-amber-800">Store Manager Access</span>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {visibleSections.map((section) => {
            const isSectionCollapsed = Boolean(collapsedSections[section.title]);
            const hasActiveRoute = section.items.some((item) => location.pathname === item.to);

            return (
              <div key={section.title} className="space-y-1">
                {!isCollapsed && (
                  <div
                    onClick={() => section.isCollapsible && toggleSection(section.title)}
                    className={`flex items-center justify-between px-3 py-1 text-[11px] font-semibold text-ink-muted uppercase tracking-wider select-none ${
                      section.isCollapsible ? 'cursor-pointer hover:text-ink-primary' : ''
                    }`}
                  >
                    <span className={hasActiveRoute ? 'text-brand-700 font-bold' : ''}>
                      {section.title}
                    </span>
                    {section.isCollapsible && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isSectionCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                    )}
                  </div>
                )}

                {/* Section Items */}
                {(!isSectionCollapsed || isCollapsed) && (
                  <nav className="space-y-0.5 animate-in fade-in-50 duration-150">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/rides' || item.to === '/parcels' || item.to === '/dashboard'}
                          onClick={() => onClose()}
                          title={isCollapsed ? item.name : undefined}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                              isActive
                                ? 'bg-brand-50 text-brand-700 font-semibold border-r-2 border-brand-500 rounded-r-none'
                                : 'text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary'
                            } ${isCollapsed ? 'justify-center px-0' : ''}`
                          }
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </NavLink>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Hub Indicator */}
        {!isCollapsed && (
          <div className="p-3 border-t border-border-light bg-surface-secondary/40 shrink-0">
            <div className="p-2.5 rounded-lg bg-white border border-border-light text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Koramangala Hub — Active</span>
              </div>
              <p className="text-ink-secondary truncate">
                {role === 'store_manager' ? 'GOSHRII Commerce Store' : 'GOSHRII Multi-Service Core'}
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
