import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-surface-subtle border border-border-light flex items-center justify-center text-brand-600 mb-4">
        <span className="text-2xl font-bold font-mono">404</span>
      </div>
      <h1 className="text-2xl font-semibold text-ink-primary mb-2">Page Not Found</h1>
      <p className="text-sm text-ink-secondary max-w-md mb-6 leading-relaxed">
        The operations module or administrative screen you are trying to reach does not exist or has been relocated.
      </p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-border-light rounded-lg hover:bg-surface-subtle transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard Overview
        </Link>
      </div>
    </div>
  );
};
