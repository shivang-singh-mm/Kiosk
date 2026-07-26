# Aura Realty Kiosk Pro — Frontend Documentation

React 18, TypeScript, and Vite single-page application providing real-time multi-device kiosk presentations, bi-directional screen mirroring, Presentation Manager controls, and offline-first media caching & booking synchronization via IndexedDB.

---

## 📂 Frontend Folder Structure

```
frontend/
├── Dockerfile                    # Multi-stage production build configuration using Nginx
├── nginx.conf                    # Nginx web server configuration and API/Socket proxy rules
├── package.json                  # Frontend dependencies, build configurations, and scripts
├── postcss.config.js             # PostCSS configuration for TailwindCSS
├── tailwind.config.js            # TailwindCSS theme, fonts, animations, and color palette
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build options, dev server host, and proxy settings
├── index.html                    # HTML document entry point
├── .env                          # Local environment variables (VITE_API_URL, VITE_SOCKET_URL)
└── src/                          # Application source code root
    ├── App.tsx                   # Root React component managing socket setup and global modals
    ├── main.tsx                  # React DOM entry point configuring QueryClientProvider
    ├── index.css                 # Global CSS styles, TailwindCSS directives, and glassmorphism utilities
    ├── components/               # Reusable UI component library
    │   ├── BookingModal.tsx      # Modal form for reserving property units (online or queued offline)
    │   ├── ErrorState.tsx        # Fallback error card with retry button
    │   ├── GalleryGrid.tsx       # Photo gallery grid with IndexedDB Blob caching & offline badges
    │   ├── ImageModal.tsx        # Full-screen image lightbox synchronized across room screens
    │   ├── InventoryGrid.tsx     # Interactive apartment grid with status tags and booking triggers
    │   ├── Loader.tsx            # Animated spinner loading indicator
    │   ├── Navbar.tsx            # Navigation header with room ID, client count, and online/offline badge
    │   ├── PendingSyncModal.tsx  # Modal displaying queued offline bookings with deletion support
    │   ├── PresentationManager.tsx # Executive drawer listing connected clients with Pause/Resume/Disconnect controls
    │   ├── QRModal.tsx           # Modal displaying pairing QR code and shareable session link
    │   ├── Toast.tsx             # Toast notification container and individual alert rendering
    │   ├── TowerSidebar.tsx      # Residential tower selection menu
    │   ├── UnitCard.tsx          # Card displaying unit details, pricing, and availability status
    │   └── VideoPlayer.tsx       # HD video player with real-time sync & IndexedDB Blob offline cache
    ├── pages/                    # View pages rendered based on active navigation state
    │   ├── GalleryPage.tsx       # Media gallery page with offline cache fallback
    │   ├── InventoryPage.tsx     # Inventory page embedding TowerSidebar, search filters, and InventoryGrid
    │   └── VideosPage.tsx        # Video showcase page with offline cache fallback
    ├── services/                 # External communication & storage services
    │   ├── api.ts                # Axios HTTP client methods (getGallery, getVideos, getInventory, bookUnit)
    │   ├── socket.ts             # Socket.IO client instance and persistent client identity helper
    │   └── indexeddb/            # Offline-first storage services
    │       ├── bookingQueue.service.ts # Service managing queued offline bookings in IndexedDB
    │       ├── db.ts             # IndexedDB schema definition and initialization using 'idb'
    │       └── media.service.ts  # Service managing gallery image and video Blob caching in IndexedDB
    ├── store/                    # Global state management
    │   └── useKioskStore.ts      # Zustand store managing UI state, Socket events, and FIFO offline sync
    └── types/                    # Shared TypeScript interfaces
        └── index.ts              # Type definitions (Unit, Tower, ConnectedClient, PendingBookingRecord, etc.)
```

---

## 🏛️ Frontend Architecture Summary

1. **State Management**:
   - **Zustand (`useKioskStore.ts`)**: Serves as the single source of truth for UI state, active page navigation, selected towers/units, connected client lists, online/offline network status, and queued offline bookings.
   - **React Query (`@tanstack/react-query`)**: Manages async server state fetching and caching for inventory, gallery, and video metadata.

2. **Routing & Navigation**:
   - Navigation is driven statefully via Zustand `activePage` (`'inventory' | 'gallery' | 'videos'`). Swaps main page views without full page reloads, allowing real-time WebSocket sync across paired screens.

3. **API & Socket Communication**:
   - **Axios (`services/api.ts`)**: Sends REST API requests to `/api/inventory`, `/api/gallery`, `/api/videos`, and `/api/book`.
   - **Socket.IO (`services/socket.ts`)**: Establishes bi-directional WebSockets passing persistent `clientId`, browser, and OS metadata. Syncs navigation, selection highlights, media modals, and presentation controls in under 15ms.

4. **Offline-First Storage & Background Sync**:
   - **IndexedDB (`services/indexeddb/`)**: Media Blobs are saved to `galleryCache` and `videoCache` stores using `idb`. Offline media is rendered dynamically via `URL.createObjectURL()`.
   - **Offline Queue**: When offline (`!isOnline`), unit reservations bypass API calls and append to the `pendingBookings` store.
   - **Automatic Sync**: Listens to `window.onLine` events. Upon network reconnection, `syncPendingBookings()` processes queued items in FIFO order via `POST /api/book` and refreshes inventory.
