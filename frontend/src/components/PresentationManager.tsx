import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import {
  X,
  Monitor,
  Laptop,
  PauseCircle,
  PlayCircle,
  UserX,
  Clock,
  Radio,
  AlertCircle,
  Globe,
  Compass,
} from 'lucide-react';

export const PresentationManager: React.FC = () => {
  const {
    presentationManagerOpen,
    togglePresentationManager,
    sessionId,
    clientsList,
    currentClientId,
    pauseClient,
    resumeClient,
    disconnectClient,
    isPaused,
  } = useKioskStore();

  if (!presentationManagerOpen) return null;

  const liveCount = clientsList.filter((c) => c.status === 'Live').length;
  const pausedCount = clientsList.filter((c) => c.status === 'Mirroring Paused').length;
  const disconnectedCount = clientsList.filter((c) => c.status === 'Disconnected').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-md transition-all duration-300 animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Presentation Manager</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Session: {sessionId}</p>
                </div>
              </div>
              <button
                onClick={togglePresentationManager}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Presentation Manager"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-center">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-sm font-semibold text-emerald-400">{liveCount}</div>
                <div className="text-[10px] text-emerald-300/70 uppercase tracking-wider font-medium">Live</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="text-sm font-semibold text-amber-400">{pausedCount}</div>
                <div className="text-[10px] text-amber-300/70 uppercase tracking-wider font-medium">Paused</div>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <div className="text-sm font-semibold text-rose-400">{disconnectedCount}</div>
                <div className="text-[10px] text-rose-300/70 uppercase tracking-wider font-medium">Disconnected</div>
              </div>
            </div>

            {isPaused && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center space-x-2 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Your screen mirroring is currently <strong>Paused</strong> by presenter.</span>
              </div>
            )}
          </div>

          {/* Client List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {clientsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Radio className="w-10 h-10 mx-auto mb-3 opacity-40 animate-pulse text-amber-400" />
                <p className="text-sm font-medium">No clients detected in this session</p>
              </div>
            ) : (
              clientsList.map((client) => {
                const isCurrent = client.clientId === currentClientId;
                const isClientPaused = client.isPaused || client.status === 'Mirroring Paused';
                const isDisconnected = client.status === 'Disconnected';

                return (
                  <div
                    key={client.clientId}
                    className={`rounded-xl p-4 border transition-all duration-200 ${
                      isCurrent
                        ? 'bg-slate-800/80 border-amber-500/40 ring-1 ring-amber-500/20'
                        : isDisconnected
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white">{client.name}</span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            You
                          </span>
                        )}
                      </div>

                      {/* Status Badge */}
                      {client.status === 'Live' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Live</span>
                        </span>
                      )}
                      {client.status === 'Mirroring Paused' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>Paused</span>
                        </span>
                      )}
                      {client.status === 'Disconnected' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Disconnected</span>
                        </span>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2 my-3 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="flex items-center space-x-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.browser}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.operatingSystem}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{client.connectedAt || 'Just now'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Compass className="w-3.5 h-3.5 text-slate-500" />
                        <span className="capitalize">{client.currentPage || 'Inventory'}</span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    {!isDisconnected && (
                      <div className="flex items-center space-x-2 pt-1">
                        {isClientPaused ? (
                          <button
                            onClick={() => resumeClient(client.clientId)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Resume Mirroring</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => pauseClient(client.clientId)}
                            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>Pause Mirroring</span>
                          </button>
                        )}

                        <button
                          onClick={() => disconnectClient(client.clientId)}
                          className="py-1.5 px-3 rounded-lg text-xs font-medium bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors flex items-center justify-center space-x-1.5"
                          title="Disconnect Client"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Disconnect</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer info */}
          <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
            Click client controls to pause sync or manage session participation.
          </div>
        </div>
      </div>
    </div>
  );
};
