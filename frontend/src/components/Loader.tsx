import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading sales data...' }) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <Loader2 className="w-6 h-6 text-indigo-400 absolute top-3 left-3 animate-pulse" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
};
