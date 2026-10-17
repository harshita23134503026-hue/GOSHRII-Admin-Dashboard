import React from 'react';

export const LoadingSkeleton: React.FC<{
  type?: 'table' | 'card' | 'stats' | 'chart';
  count?: number;
}> = ({ type = 'card', count = 3 }) => {
  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-card border border-border-light p-5 animate-pulse">
            <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-card border border-border-light overflow-hidden animate-pulse">
        <div className="h-12 bg-slate-100 border-b border-border-light" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 border-b border-border-light/60 flex items-center px-4 gap-4">
            <div className="h-4 w-12 bg-slate-200 rounded" />
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded hidden sm:block" />
            <div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-card border border-border-light p-5 animate-pulse h-80 flex flex-col justify-between">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-48 w-full bg-slate-100 rounded" />
        <div className="h-3 w-64 bg-slate-100 rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-border-light p-4 animate-pulse">
          <div className="h-40 bg-slate-200 rounded-lg mb-3" />
          <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-1/2 bg-slate-100 rounded mb-4" />
          <div className="h-5 w-1/3 bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
};
