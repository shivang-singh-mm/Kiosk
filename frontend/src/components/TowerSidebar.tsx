import React from 'react';
import { Tower } from '../types';
import { useKioskStore } from '../store/useKioskStore';
import { Building, CheckCircle2, XCircle } from 'lucide-react';

interface TowerSidebarProps {
  towers: Tower[];
}

export const TowerSidebar: React.FC<TowerSidebarProps> = ({ towers }) => {
  const { selectedTowerId, setSelectedTowerId } = useKioskStore();

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 glass-card shadow-xl">
      <div className="flex items-center space-x-2 mb-4 px-2">
        <Building className="w-5 h-5 text-indigo-400" />
        <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">
          Residential Towers
        </h2>
      </div>

      <div className="space-y-3">
        {towers.map((tower) => {
          const isSelected = selectedTowerId === tower.id;
          const totalUnits = tower.units.length;
          const availableUnits = tower.units.filter((u) => u.status === 'AVAILABLE').length;
          const bookedUnits = totalUnits - availableUnits;
          const occupancyPercent = totalUnits > 0 ? Math.round((bookedUnits / totalUnits) * 100) : 0;

          return (
            <button
              key={tower.id}
              onClick={() => setSelectedTowerId(tower.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 border relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-900/50 via-slate-900 to-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-400 hover:border-slate-700'
              }`}
            >
              {/* Highlight accent bar */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
              )}

              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {tower.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {totalUnits} Units
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{availableUnits} Free</span>
                </div>
                <div className="flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{bookedUnits} Booked</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
