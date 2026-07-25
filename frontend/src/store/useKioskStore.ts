import { create } from 'zustand';
import { ActivePage, GalleryItem, VideoPlaybackState, ToastMessage, ConnectedClient } from '../types';
import { socketService, getPersistentClientId } from '../services/socket';

interface KioskState {
  sessionId: string;
  connectedClients: number;
  clientsList: ConnectedClient[];
  activePage: ActivePage;
  selectedTowerId: number;
  selectedUnitId: number | null;
  galleryPreview: GalleryItem | null;
  videoPlayback: VideoPlaybackState | null;
  bookingModalUnitId: number | null;
  searchQuery: string;
  statusFilter: 'ALL' | 'AVAILABLE' | 'BOOKED';
  toasts: ToastMessage[];
  qrModalOpen: boolean;
  presentationManagerOpen: boolean;
  isPaused: boolean;
  isDisconnectedByPresenter: boolean;
  currentClientId: string;

  // Sync actions
  setSessionId: (id: string) => void;
  setActivePage: (page: ActivePage, syncSocket?: boolean) => void;
  setSelectedTowerId: (id: number, syncSocket?: boolean) => void;
  setSelectedUnitId: (id: number | null, syncSocket?: boolean) => void;
  setGalleryPreview: (item: GalleryItem | null, syncSocket?: boolean) => void;
  setVideoPlayback: (playback: VideoPlaybackState | null, syncSocket?: boolean) => void;
  setBookingModalUnitId: (unitId: number | null, syncSocket?: boolean) => void;
  
  // Presentation actions
  togglePresentationManager: () => void;
  pauseClient: (clientId: string) => void;
  resumeClient: (clientId: string) => void;
  disconnectClient: (clientId: string) => void;

  // Local actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: 'ALL' | 'AVAILABLE' | 'BOOKED') => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleQRModal: () => void;
  initSocket: (sessionId: string, refreshInventoryCallback: () => void) => void;
}

export const useKioskStore = create<KioskState>((set, get) => ({
  sessionId: 'sales-room-101',
  connectedClients: 1,
  clientsList: [],
  activePage: 'inventory',
  selectedTowerId: 1,
  selectedUnitId: null,
  galleryPreview: null,
  videoPlayback: null,
  bookingModalUnitId: null,
  searchQuery: '',
  statusFilter: 'ALL',
  toasts: [],
  qrModalOpen: false,
  presentationManagerOpen: false,
  isPaused: false,
  isDisconnectedByPresenter: false,
  currentClientId: getPersistentClientId(),

  setSessionId: (id: string) => set({ sessionId: id }),

  setActivePage: (page: ActivePage, syncSocket = true) => {
    set({ activePage: page });
    if (syncSocket) {
      socketService.emit('sync_navigation', { activePage: page });
    }
  },

  setSelectedTowerId: (id: number, syncSocket = true) => {
    set({ selectedTowerId: id });
    if (syncSocket) {
      socketService.emit('sync_tower', { selectedTowerId: id });
    }
  },

  setSelectedUnitId: (id: number | null, syncSocket = true) => {
    set({ selectedUnitId: id });
    if (syncSocket) {
      socketService.emit('sync_unit', { selectedUnitId: id });
    }
  },

  setGalleryPreview: (item: GalleryItem | null, syncSocket = true) => {
    set({ galleryPreview: item });
    if (syncSocket) {
      socketService.emit('sync_gallery', { galleryPreview: item });
    }
  },

  setVideoPlayback: (playback: VideoPlaybackState | null, syncSocket = true) => {
    set({ videoPlayback: playback });
    if (syncSocket) {
      socketService.emit('sync_video', { videoPlayback: playback });
    }
  },

  setBookingModalUnitId: (unitId: number | null, syncSocket = true) => {
    set({ bookingModalUnitId: unitId });
    if (syncSocket) {
      socketService.emit('sync_booking_modal', { bookingModal: unitId });
    }
  },

  togglePresentationManager: () => set((state) => ({ presentationManagerOpen: !state.presentationManagerOpen })),

  pauseClient: (clientId: string) => {
    socketService.emit('client_pause', { clientId });
  },

  resumeClient: (clientId: string) => {
    socketService.emit('client_resume', { clientId });
  },

  disconnectClient: (clientId: string) => {
    socketService.emit('client_disconnect', { clientId });
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  toggleQRModal: () => set((state) => ({ qrModalOpen: !state.qrModalOpen })),

  initSocket: (sessionId: string, refreshInventoryCallback: () => void) => {
    const clientId = getPersistentClientId();
    set({ sessionId, currentClientId: clientId });
    
    socketService.connect(sessionId, (roomState) => {
      if (roomState) {
        set({
          activePage: roomState.activePage || 'inventory',
          selectedTowerId: roomState.selectedTowerId || 1,
          selectedUnitId: roomState.selectedUnitId || null,
          galleryPreview: roomState.galleryPreview || null,
          videoPlayback: roomState.videoPlayback || null,
          bookingModalUnitId: roomState.bookingModal || null,
          connectedClients: roomState.clientsCount || 1,
        });
      }
    });

    const socket = socketService.getSocket();
    if (!socket) return;

    // Listen to real-time events from room
    socket.off('sync_navigation');
    socket.on('sync_navigation', (data: any) => {
      if (data.activePage) set({ activePage: data.activePage });
    });

    socket.off('sync_tower');
    socket.on('sync_tower', (data: any) => {
      if (data.selectedTowerId) set({ selectedTowerId: data.selectedTowerId });
    });

    socket.off('sync_unit');
    socket.on('sync_unit', (data: any) => {
      set({ selectedUnitId: data.selectedUnitId });
    });

    socket.off('sync_gallery');
    socket.on('sync_gallery', (data: any) => {
      set({ galleryPreview: data.galleryPreview });
    });

    socket.off('sync_video');
    socket.on('sync_video', (data: any) => {
      set({ videoPlayback: data.videoPlayback });
    });

    socket.off('sync_booking_modal');
    socket.on('sync_booking_modal', (data: any) => {
      set({ bookingModalUnitId: data.bookingModal });
    });

    socket.off('room_clients_updated');
    socket.on('room_clients_updated', (data: any) => {
      set({ connectedClients: data.clientsCount || 1 });
    });

    socket.off('client:list_updated');
    socket.on('client:list_updated', (data: any) => {
      if (data.clients) {
        set({
          clientsList: data.clients,
          connectedClients: data.clientsCount || data.clients.length,
        });
      }
    });

    socket.off('mirror_status_changed');
    socket.on('mirror_status_changed', (data: any) => {
      set({ isPaused: !!data.isPaused });
      get().addToast({
        type: data.isPaused ? 'info' : 'success',
        title: 'Mirroring Status',
        message: data.isPaused
          ? 'Presenter has paused mirroring for your screen.'
          : 'Mirroring resumed by presenter. Synchronizing live state...',
      });
    });

    socket.off('client:disconnected_by_presenter');
    socket.on('client:disconnected_by_presenter', () => {
      set({ isDisconnectedByPresenter: true });
      socketService.disconnect();
    });

    socket.off('unit_booked');
    socket.on('unit_booked', (data: any) => {
      set({ bookingModalUnitId: null, selectedUnitId: null });
      get().addToast({
        type: 'info',
        title: 'Inventory Updated',
        message: `Unit #${data.unitId} was just reserved by ${data.customerName}!`,
      });
      refreshInventoryCallback();
    });

    socket.off('global_inventory_changed');
    socket.on('global_inventory_changed', () => {
      refreshInventoryCallback();
    });

    // Request initial client list
    socket.emit('client_list');
  },
}));
