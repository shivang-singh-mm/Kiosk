# Aura Realty Kiosk Pro

Real-Time Multi-Device Presentation & Sales Suite built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Socket.IO**, **React (Vite)**, **IndexedDB**, **Zustand**, and **TailwindCSS**.

Designed for real estate sales galleries to mirror screens live across executive kiosks, customer tablets, and desktop browsers with offline support and atomic unit reservations.

---

## ✨ Features

- ⚡ **Real-Time Screen Mirroring**: Bi-directional Socket.IO room sync across paired devices (navigation, tower/unit selections, photo lightbox, video playback timestamps).
- 🎛️ **Presentation Manager**: Drawer UI tracking live clients (Browser, OS, Connection Time, Current Page) with controls to **Pause**, **Resume**, or **Disconnect** clients.
- 🆔 **Persistent Identity**: Tab-persistent UUID in `sessionStorage` preventing duplicate client entries on page refreshes.
- 💾 **IndexedDB Offline Support**:
  - **Media Cache**: Caches downloaded gallery images and video Blobs in IndexedDB with an `Available Offline` badge.
  - **Offline Booking Queue**: Queues unit reservations locally when offline and automatically syncs via FIFO order upon network reconnection.
- 🔒 **Atomic Unit Booking**: PostgreSQL transaction-level concurrency safety preventing double-bookings.
- 💓 **Keep-Alive Ping**: `/ping` endpoint for Render uptime monitors.

---

## 🛠️ Project Structure

```
sales-kiosk-app/
├── kiosk-backend/          # Node.js + Express + TypeScript + PostgreSQL
│   └── src/
│       ├── core/          # Database connection pool & Socket.IO initialization
│       ├── modules/       # Domain modules (gallery, video, inventory, booking, websocket)
│       ├── app.ts         # Express configuration
│       ├── server.ts      # Server entry point
│       └── seed.ts        # Database table setup & auto-seeding
├── frontend/              # React + TypeScript + Vite + TailwindCSS
│   └── src/
│       ├── components/    # UI components (Navbar, PresentationManager, PendingSyncModal, etc.)
│       ├── pages/         # InventoryPage, GalleryPage, VideosPage
│       ├── services/      # REST API, Socket.IO, IndexedDB services
│       └── store/         # Zustand global state & offline sync logic
├── docker-compose.yml     # Multi-container orchestration (PostgreSQL, Backend, Frontend)
└── README.md
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd kiosk-backend
npm install
npm run dev
```

*Runs on `http://localhost:8000` (tables & seed data automatically created on startup).*

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

*Runs on `http://localhost:5173`.*

---

## 🐳 Docker Deployment

Run the complete stack (PostgreSQL + Backend + Frontend) using Docker Compose:

```bash
docker-compose up --build -d
```

---

## 📡 API & Socket Contract

### REST Endpoints (`/api`)
- `GET /ping` — Server health check
- `GET /api/inventory` — Towers, units & availability stats
- `GET /api/gallery` — Photo gallery catalog
- `GET /api/videos` — Video showcase catalog
- `POST /api/book` — Reserve unit (`{ unitId, customerName, phone, sessionId }`)

### Socket.IO Events
- `join_session` — Join presentation room
- `sync_navigation` / `sync_tower` / `sync_unit` / `sync_gallery` / `sync_video` / `sync_booking_modal` — Live state sync
- `client_list` / `client_pause` / `client_resume` / `client_disconnect` — Presentation Manager controls
