import React from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { Building2, Image as ImageIcon, Video, QrCode, Users, Copy, Check } from 'lucide-react';
import { ActivePage } from '../types';

export const Navbar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    sessionId,
    connectedClients,
    toggleQRModal,
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
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                  AURA REALTY
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  KIOSK PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Executive Sales Synchronization Suite
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* Session Sync Badge & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-indigo-400">Room:</span>
                <span className="font-mono text-slate-200">{sessionId}</span>
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200">{connectedClients}</span>
                <span>paired</span>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              title="Copy session link"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleQRModal}
              title="Open pairing QR code"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/40 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Pair Device</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
