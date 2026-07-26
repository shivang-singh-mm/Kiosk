import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKioskStore } from './store/useKioskStore';
import { Navbar } from './components/Navbar';
import { InventoryPage } from './pages/InventoryPage';
import { GalleryPage } from './pages/GalleryPage';
import { VideosPage } from './pages/VideosPage';
import { ToastContainer } from './components/Toast';
import { QRModal } from './components/QRModal';
import { PresentationManager } from './components/PresentationManager';
import { PendingSyncModal } from './components/PendingSyncModal';
import { UserX, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const queryClient = useQueryClient();
  const { activePage, initSocket, isDisconnectedByPresenter } = useKioskStore();

  useEffect(() => {
    // Extract session ID from URL search query parameter
    const params = new URLSearchParams(window.location.search);
    const sessionFromUrl = params.get('session') || 'sales-room-101';

    // Initialize Socket.IO connection & state listeners
    initSocket(sessionFromUrl, () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    });
  }, [initSocket, queryClient]);

  if (isDisconnectedByPresenter) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl space-y-5 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
            <UserX className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Disconnected from Session</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              You have been disconnected from this presentation by the presenter.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect to Presentation</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'inventory' && <InventoryPage />}
        {activePage === 'gallery' && <GalleryPage />}
        {activePage === 'videos' && <VideosPage />}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 AURA REALTY KIOSK PRO. Production-Grade Enterprise Architecture.</span>
          <span className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">WebSocket Room Synced</span>
          </span>
        </div>
      </footer>

      <ToastContainer />
      <QRModal />
      <PresentationManager />
      <PendingSyncModal />
    </div>
  );
};

export default App;
