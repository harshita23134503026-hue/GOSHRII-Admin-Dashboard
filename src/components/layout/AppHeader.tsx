import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  User,
  Search,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { NotificationItem } from '../ui/NotificationItem';
import { useAuth } from '../../features/auth/authContext';

interface AppHeaderProps {
  onToggleSidebar: () => void;
  pageTitle?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, pageTitle }) => {
  const navigate = useNavigate();
  const { logout, admin: adminUser } = useAuth();
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch operational alerts
  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => adminService.getAlerts(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => adminService.getProducts(),
  });

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  // Filter global search results across catalog & orders
  const matchingProducts = globalSearch.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(globalSearch.toLowerCase()) ||
            p.brand.toLowerCase().includes(globalSearch.toLowerCase())
        )
        .slice(0, 4)
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismissAlert = async (id: string) => {
    await adminService.markAlertAsRead(id);
    refetchAlerts();
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-border-light px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Left: Mobile hamburger & title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {pageTitle && (
            <h2 className="text-base font-semibold text-ink-primary tracking-tight hidden sm:block">
              {pageTitle}
            </h2>
          )}
        </div>

        {/* Center: Functional Global Search */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="Search products, SKUs, or orders..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface-secondary border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-ink-primary placeholder:text-ink-muted transition-colors"
            />
          </div>

          {/* Quick Search Dropdown */}
          {isSearchFocused && globalSearch.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg border border-border-light shadow-dropdown p-2 z-50 animate-in fade-in zoom-in-95">
              <p className="text-[11px] font-semibold text-ink-muted px-2 py-1 uppercase tracking-wider">
                Matching Catalog Items
              </p>
              {matchingProducts.length > 0 ? (
                <div className="space-y-1">
                  {matchingProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={() => {
                        navigate(`/products?search=${encodeURIComponent(p.name)}`);
                        setGlobalSearch('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-surface-secondary flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink-primary truncate">{p.name}</p>
                        <p className="text-[10px] text-ink-muted font-mono">{p.sku}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-ink-muted shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink-secondary px-2 py-2">No matching products found.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions, Demo Pill, Notifications, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Operational Alerts Bell */}
          <div className="relative" ref={alertsRef}>
            <button
              type="button"
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              aria-label="View Operational Alerts"
              className="relative p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown */}
            {isAlertsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-border-light shadow-dropdown p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-border-light mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-ink-primary">Store Operational Alerts</h4>
                    <p className="text-[11px] text-ink-muted">Issues needing dark store attention</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-secondary text-ink-secondary font-medium">
                    {alerts.length} total
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <NotificationItem
                        key={alert.id}
                        alert={alert}
                        onDismiss={handleDismissAlert}
                      />
                    ))
                  ) : (
                    <p className="text-xs text-ink-secondary text-center py-4">
                      No pending operational alerts.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-secondary transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-semibold text-xs flex items-center justify-center border border-brand-200">
                {adminUser?.name
                  ? adminUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : '?'}
              </div>
              <div className="hidden xl:block text-left">
                <p className="text-xs font-semibold text-ink-primary leading-tight">
                  {adminUser?.name ?? '—'}
                </p>
                <p className="text-[11px] text-ink-muted leading-tight">{adminUser?.roleLabel ?? ''}</p>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-border-light shadow-dropdown p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2 py-2 border-b border-border-light mb-2">
                  <p className="text-xs font-semibold text-ink-primary">{adminUser?.name}</p>
                  <p className="text-[11px] text-ink-muted truncate">{adminUser?.email}</p>
                  <p className="text-[10px] text-brand-700 font-medium mt-1">
                    {adminUser?.hubLocation}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-surface-secondary text-xs text-ink-primary flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5 text-ink-secondary" />
                  Account & Store Settings
                </button>

                <div className="border-t border-border-light mt-1 pt-1">
                  <button
                    id="header-logout-button"
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      navigate('/login', { replace: true });
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-red-50 text-xs text-red-600 flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

    </>
  );
};
