import React from 'react';
import { InventoryData } from '../types';
import { UnitCard } from './UnitCard';
import { useKioskStore } from '../store/useKioskStore';
import { Search, Filter, Building2, CheckCircle2, Lock, PieChart } from 'lucide-react';

interface InventoryGridProps {
  data: InventoryData;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ data }) => {
  const {
    selectedTowerId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = useKioskStore();

  const currentTower = data.towers.find((t) => t.id === selectedTowerId) || data.towers[0];

  // Filter units
  const filteredUnits = (currentTower?.units || []).filter((unit) => {
    const matchesSearch = unit.number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'AVAILABLE'
        ? unit.status === 'AVAILABLE'
        : unit.status === 'BOOKED';
    return matchesSearch && matchesFilter;
  });

  const occupancyRate = data.totalUnits > 0 ? Math.round((data.bookedUnits / data.totalUnits) * 100) : 0;

  return (
    <div className="flex-1 space-y-6">
      {/* Top Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl glass-card flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Portfolio</p>
            <p className="text-xl font-extrabold text-white">{data.totalUnits} Units</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl glass-card flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Available Units</p>
            <p className="text-xl font-extrabold text-emerald-400">{data.availableUnits}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl glass-card flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Reserved Units</p>
            <p className="text-xl font-extrabold text-rose-400">{data.bookedUnits}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl glass-card flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <PieChart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Occupancy Rate</p>
            <p className="text-xl font-extrabold text-teal-300">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search unit by number (e.g. A-101)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(['ALL', 'AVAILABLE', 'BOOKED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Header & Units Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white tracking-tight">
            {currentTower?.name || 'All Units'}
          </h3>
          <span className="text-xs text-slate-400">
            Showing {filteredUnits.length} of {currentTower?.units.length || 0} units
          </span>
        </div>

        {filteredUnits.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium text-sm">No units found matching criteria</p>
            <p className="text-slate-500 text-xs mt-1">Try resetting search or filter options</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                towerName={currentTower?.name || 'Tower'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
