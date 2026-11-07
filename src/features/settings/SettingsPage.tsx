import React, { useState } from 'react';
import {
  User,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Lock,
  Server,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/ui/PageHeader';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { initialPreferences } from '../../data/seedData';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../auth/authContext';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const { admin: adminUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Compute dynamic initials from logged-in admin name
  const adminInitials = adminUser?.name
    ? adminUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  // Local preferences state
  const [pageSize, setPageSize] = useState<number>(initialPreferences.tablePageSize);
  const [dateFormat, setDateFormat] = useState<string>(initialPreferences.dateFormat);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(initialPreferences.enableSoundAlerts);
  const [compactDensity, setCompactDensity] = useState<boolean>(initialPreferences.compactTableDensity);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      type: 'success',
      title: 'Preferences Saved',
      description: 'Your local console presentation settings have been updated.',
    });
  };

  const handleResetData = () => {
    adminService.resetDemoData();
    setIsResetDialogOpen(false);
    toast({
      type: 'success',
      title: 'Demo Data Restored',
      description: 'Reset all mock database records back to original seed dataset.',
    });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Store Console"
        description="Operator profile details, future enterprise security specifications, and presentation preferences."
      />

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-border-light space-x-6">
        <button
          type="button"
          onClick={() => setActiveSection('profile')}
          className={`pb-3 text-sm font-semibold transition-all flex items-center gap-1.5 ${
            activeSection === 'profile'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <User className="w-4 h-4" />
          Operator Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className={`pb-3 text-sm font-semibold transition-all flex items-center gap-1.5 ${
            activeSection === 'security'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Lock className="w-4 h-4" />
          Security & Backend Integration
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('preferences')}
          className={`pb-3 text-sm font-semibold transition-all flex items-center gap-1.5 ${
            activeSection === 'preferences'
              ? 'text-brand-700 border-b-2 border-brand-500'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Console Preferences
        </button>
      </div>

      {/* SECTION 1: OPERATOR PROFILE */}
      {activeSection === 'profile' && (
        <div className="max-w-2xl bg-white rounded-card border border-border-light p-6 shadow-card space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-800 font-bold text-xl flex items-center justify-center border-2 border-brand-200">
              {adminInitials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink-primary">{adminUser?.name ?? '—'}</h3>
              <p className="text-xs text-brand-700 font-semibold">{adminUser?.roleLabel || (adminUser?.role === 'admin' ? 'Admin' : 'Store Manager')}</p>
              <p className="text-xs text-ink-muted mt-0.5">{adminUser?.email ?? '—'}</p>
            </div>
          </div>

          <div className="divide-y divide-border-light/60 text-xs">
            <div className="py-3 flex justify-between">
              <span className="text-ink-muted">Assigned Operating Hub:</span>
              <span className="font-semibold text-ink-primary">{adminUser?.hubLocation}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-ink-muted">Console Access Level:</span>
              <span className="font-semibold text-emerald-700">
                {adminUser?.role === 'admin' ? 'Admin (Full Platform Access)' : 'Store Manager (Commerce Only)'}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-ink-muted">Current Session Initialized:</span>
              <span className="text-ink-secondary">{adminUser?.lastLogin}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-ink-muted">Demo Operational Store ID:</span>
              <span className="font-mono text-ink-secondary">BLR-KRM-104</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SECURITY & BACKEND INTEGRATION */}
      {activeSection === 'security' && (
        <div className="max-w-3xl space-y-5">
          <div className="bg-white rounded-card border border-blue-200 p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2.5 text-blue-900 font-bold text-base">
              <Server className="w-5 h-5 text-blue-600" />
              <span>Production Backend Integration Architecture</span>
            </div>

            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              In this frontend-first prototype, all authentication mechanisms are deliberately deferred.
              The application communicates through a centralized typed mock service adapter with atomic
              local state persistence.
            </p>

            <div className="p-4 bg-surface-secondary rounded-lg border border-border-light space-y-3 text-xs">
              <h4 className="font-bold text-ink-primary uppercase tracking-wider">
                Eventual Backend Integration Specifications
              </h4>
              <ul className="space-y-2 text-ink-secondary list-disc pl-4">
                <li>
                  <strong>Authentication Protocol:</strong> Standard OAuth2 / JWT Bearer token via HTTP Authorization headers.
                </li>
                <li>
                  <strong>Central API Client:</strong> Pre-wired with Axios in <code className="font-mono text-brand-700">src/services/apiClient.ts</code>, pointing to configurable <code className="font-mono text-brand-700">VITE_API_BASE_URL</code>.
                </li>
                <li>
                  <strong>Protected Route Boundary:</strong> React Router tree is cleanly decoupled so an <code className="font-mono text-brand-700">&lt;AuthGuard&gt;</code> wrapper can be added without restructuring routes.
                </li>
                <li>
                  <strong>No Mock Credentials:</strong> Fake JWTs, simulated passwords, and pseudo-logins have been omitted to prevent false security illusions.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50/70 rounded-card border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Administrative Security Compliance</p>
              <p className="mt-0.5 text-amber-800">
                Customer passwords, raw credit card tokens, and dark store secret keys are never handled or persisted by the frontend.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PREFERENCES */}
      {activeSection === 'preferences' && (
        <div className="max-w-2xl space-y-6">
          <form
            onSubmit={handleSavePreferences}
            className="bg-white rounded-card border border-border-light p-6 shadow-card space-y-5"
          >
            <h3 className="text-base font-semibold text-ink-primary">Display & Table Settings</h3>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Default Table Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value={10}>10 rows per page</option>
                <option value={25}>25 rows per page</option>
                <option value={50}>50 rows per page</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-primary mb-1">
                Date Display Format
              </label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="MMM DD, YYYY">MMM DD, YYYY (e.g. Oct 09, 2026)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 09/10/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="soundToggle"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-border-light focus:ring-brand-500"
                />
                <label htmlFor="soundToggle" className="text-xs font-medium text-ink-primary">
                  Enable audible tone for high-priority operational exceptions
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="densityToggle"
                  checked={compactDensity}
                  onChange={(e) => setCompactDensity(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-border-light focus:ring-brand-500"
                />
                <label htmlFor="densityToggle" className="text-xs font-medium text-ink-primary">
                  Use compact high-density spacing for wide data tables
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-border-light flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Reset Demo Data Panel */}
          <div className="bg-white rounded-card border border-red-200 p-5 shadow-card">
            <h4 className="text-sm font-semibold text-red-900 mb-1">Emergency Prototype Reset</h4>
            <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
              Wipes all locally modified inventory counts, newly created products, price revisions and orders, restoring the default seed dataset.
            </p>
            <button
              type="button"
              onClick={() => setIsResetDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data to Initial Seed
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleResetData}
        title="Reset Demo Data to Initial Seed?"
        description="This will clear all changes stored in local storage and restore original Indian grocery products, stock quantities, orders, and pricing. This cannot be undone."
        confirmLabel="Reset Data"
        cancelLabel="Keep Current State"
        variant="warning"
      />
    </div>
  );
};
