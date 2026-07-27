# Aura Realty Kiosk Pro — Frontend Documentation

React 18, TypeScript, and Vite single-page application providing real-time multi-device kiosk presentations, bi-directional screen mirroring, Presentation Manager controls, and offline-first media caching & booking synchronization via IndexedDB.

---

## 📂 Frontend Folder Structure

```
frontend/
├── Dockerfile
├── nginx.conf
├── package.json
├── index.html
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── components/
    ├── pages/
    ├── services/
    │   └── indexeddb/
    ├── store/
    └── types/
```

- **`components/`**: Reusable UI presentation components (modals, grids, drawers, status badges).
- **`pages/`**: Main view pages (`InventoryPage`, `GalleryPage`, `VideosPage`).
- **`services/`**: REST API client (Axios), Socket.IO client, and IndexedDB media/booking queue services.
- **`store/`**: Central Zustand store managing reactive state, Socket events, and offline background sync logic.
- **`types/`**: Shared TypeScript type definitions and interfaces.

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
