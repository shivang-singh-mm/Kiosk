import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { Building2, Image as ImageIcon, Video, QrCode, Users, Copy, Check, Settings2, WifiOff } from 'lucide-react';
import { ActivePage } from '../types';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    sessionId,
    connectedClients,
    toggleQRModal,
    togglePresentationManager,
    isOnline,
    pendingBookings,
    togglePendingSyncModal,
    addToast
  } = useKioskStore();

  const [copied, setCopied] = React.useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
    { id: 'inventory', label: 'Inventory Grid', icon: <Building2 className="w-4 h-4" /> },
    { id: 'gallery', label: 'Architectural Gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'videos', label: 'Video Showcase', icon: <Video className="w-4 h-4" /> },
  ];

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Session Link Copied',
      message: 'Share this link or scan QR code to pair device screens.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-2.5 md:py-0 md:h-16 gap-3 md:gap-0">
          
          {/* Top Row: Brand & Pairing Session Controls */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2">
            <div className="flex items-center space-x-2.5 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                    AURA REALTY
                  </h1>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                    KIOSK
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden lg:block">
                  Executive Sales Synchronization Suite
                </p>
              </div>
            </div>

            {/* Session Pairing & Status Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {/* Online / Offline Status Badge */}
              <div
                className={`flex items-center space-x-1 px-2 py-1 rounded-xl border text-[11px] font-semibold ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
              >
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-rose-400" />
                    <span className="hidden sm:inline">Offline</span>
                  </>
                )}
              </div>

              {/* Pending Sync Badge */}
              {pendingBookings.length > 0 && (
                <button
                  onClick={togglePendingSyncModal}
                  className="flex items-center space-x-1 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-bold transition-all animate-pulse"
                  title="View pending offline bookings"
                >
                  <span>Sync ({pendingBookings.length})</span>
                </button>
              )}

              {/* Presentation Manager Drawer Button */}
              <button
                onClick={togglePresentationManager}
                title="Open Presentation Manager"
                className="flex items-center space-x-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer group text-xs text-slate-300"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-white">{connectedClients}</span>
                <span className="text-slate-400 hidden lg:inline">clients</span>
                <Settings2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors hidden sm:block" />
              </button>

              {/* Copy Session Link Button */}
              <button
                onClick={handleCopyLink}
                title="Copy session link"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Pair Device QR Modal Button */}
              <button
                onClick={toggleQRModal}
                title="Open pairing QR code"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/40 transition-all shrink-0"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Pair Device</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Sub-Row */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-900/80 p-1 sm:p-1.5 rounded-xl border border-slate-800 w-full md:w-auto justify-center">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
};
