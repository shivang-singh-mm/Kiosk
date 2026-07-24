import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKioskStore } from './store/useKioskStore';
import { Navbar } from './components/Navbar';
import { InventoryPage } from './pages/InventoryPage';
import { GalleryPage } from './pages/GalleryPage';
import { VideosPage } from './pages/VideosPage';
import { ToastContainer } from './components/Toast';
import { QRModal } from './components/QRModal';

export const App: React.FC = () => {
  const queryClient = useQueryClient();
  const { activePage, initSocket } = useKioskStore();

  useEffect(() => {
    // Extract session ID from URL search query parameter
    const params = new URLSearchParams(window.location.search);
    const sessionFromUrl = params.get('session') || 'sales-room-101';

    // Initialize Socket.IO connection & state listeners
    initSocket(sessionFromUrl, () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    });
  }, [initSocket, queryClient]);

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
    </div>
  );
};

export default App;
