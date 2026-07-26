import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { X, Clock, Trash2, WifiOff, AlertCircle, Loader2 } from 'lucide-react';

export const PendingSyncModal: React.FC = () => {
  const {
    pendingSyncModalOpen,
    togglePendingSyncModal,
    pendingBookings,
    removePendingBooking,
  } = useKioskStore();

  if (!pendingSyncModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 glass-panel flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Pending Bookings Queue</h2>
              <p className="text-xs text-slate-400">
                {pendingBookings.length} booking{pendingBookings.length === 1 ? '' : 's'} waiting for internet sync
              </p>
            </div>
          </div>
          <button
            onClick={togglePendingSyncModal}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            These reservations were saved locally while offline. They will automatically sync with the server once connection returns.
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No pending offline bookings.
            </div>
          ) : (
            pendingBookings.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">Unit #{item.unitNumber}</span>
                    {item.towerName && (
                      <span className="text-xs text-indigo-400 font-medium">({item.towerName})</span>
                    )}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        item.status === 'SYNCING'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {item.status === 'SYNCING' ? (
                        <span className="flex items-center space-x-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Syncing</span>
                        </span>
                      ) : (
                        'Pending'
                      )}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Customer: <span className="font-medium text-white">{item.customerName}</span> ({item.phone})
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Saved: {new Date(item.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {item.status !== 'SYNCING' && item.id !== undefined && (
                  <button
                    onClick={() => removePendingBooking(item.id!)}
                    title="Remove pending booking"
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
