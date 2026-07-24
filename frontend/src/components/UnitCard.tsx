import React from 'react';
import { Unit } from '../types';
import { useKioskStore } from '../store/useKioskStore';
import { CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface UnitCardProps {
  unit: Unit;
  towerName: string;
}

export const UnitCard: React.FC<UnitCardProps> = ({ unit, towerName }) => {
  const {
    selectedUnitId,
    setSelectedUnitId,
    setBookingModalUnitId
  } = useKioskStore();

  const isSelected = selectedUnitId === unit.id;
  const isBooked = unit.status === 'BOOKED';

  const handleCardClick = () => {
    setSelectedUnitId(unit.id);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBooked) {
      setSelectedUnitId(unit.id);
      setBookingModalUnitId(unit.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative rounded-2xl p-5 border transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-500/40 scale-[1.02]'
          : isBooked
          ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 opacity-80'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850 shadow-md'
      }`}
    >
      {/* Background glow for available units */}
      {!isBooked && (
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {towerName}
        </span>
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isBooked
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {isBooked ? (
            <>
              <Lock className="w-3 h-3 mr-1" />
              <span>Booked</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              <span>Available</span>
            </>
          )}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
          Unit {unit.number}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {isBooked ? 'Reserved by client' : 'Ready for immediate booking'}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          Status Code: <span className="font-mono text-slate-300">#UT-{unit.id}</span>
        </span>

        <button
          disabled={isBooked}
          onClick={handleBookClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all duration-200 ${
            isBooked
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-900/30 active:scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isBooked ? 'Unavailable' : 'Book Unit'}</span>
        </button>
      </div>
    </div>
  );
};
