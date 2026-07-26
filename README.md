# Aura Realty Kiosk Pro — Project Overview

A production-grade, feature-rich **Real-Time Sales Kiosk Application** engineered for luxury real estate galleries and executive presentation suites. Built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Socket.IO**, **React 18**, **Vite**, **Zustand**, and **TailwindCSS**.

The system enables sales executives and clients to synchronize presentation screens live across devices (tablets, kiosks, desktop browsers) with **bi-directional screen mirroring**, **Presentation Manager controls**, **persistent tab identity**, **offline-first IndexedDB media caching & booking queues**, and **race-condition safe atomic unit reservations**.

---

## 🏗️ Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        ExecKiosk[Executive Kiosk / Tablet]
        CustTab[Customer Presentation Tablet]
    end

    subgraph Frontend Application [React 18 + Vite + Zustand]
        UI[UI Components & Pages]
        Store[Zustand Global Store]
        IDB[(IndexedDB Storage)]
        IDB_Media[galleryCache & videoCache]
        IDB_Queue[pendingBookings Queue]
        IDB --- IDB_Media
        IDB --- IDB_Queue
    end

    subgraph Backend Application [Node.js + Express + Socket.IO]
        HTTP[Express REST API /api]
        WS[Socket.IO Server]
        RoomMgr[Session Room Manager]
        Seed[Auto-Schema & Seed Script]
    end

    subgraph Data Layer
        DB[(PostgreSQL Database)]
    end

    ExecKiosk <-->|WebSocket Events| WS
    CustTab <-->|WebSocket Events| WS

    ExecKiosk -->|HTTP REST| HTTP
    CustTab -->|HTTP REST| HTTP

    UI --> Store
    Store <-->|idb Library| IDB
    HTTP --> DB
    RoomMgr <--> WS
```

---

## 🌟 Implemented Features

| Feature | Type | Description |
| :--- | :--- | :--- |
| **Real-Time Screen Mirroring** | WebSockets | Bi-directional Socket.IO room synchronization (`sales-room-101`) for page navigation, tower selection, unit highlights, photo lightbox, and video playback timestamps. |
| **Executive Presentation Manager** | Real-Time Control | Interactive drawer displaying connected session clients with live metadata (Browser, OS, Connection Time, Current Page) and per-client controls (**Pause Mirroring**, **Resume Mirroring**, **Disconnect Client**). |
| **Persistent Client Identity** | Client Identity | Tab-persistent UUID generated and saved in `sessionStorage`. Reconnecting/refreshing a tab replaces active socket mappings without creating duplicate client list entries or inflating client counts. |
| **Offline Media Caching** | Offline Storage | Stores downloaded gallery image and video Blobs in IndexedDB (`galleryCache` & `videoCache` stores using `idb`). Cached items display an `Available Offline` badge and render via Blob Object URLs (`URL.createObjectURL()`) when offline. |
| **Offline Booking Queue** | Offline Resilience | When offline, unit reservations bypass HTTP requests and queue into IndexedDB (`pendingBookings` store). Notifies user with local save confirmation toast. |
| **Automatic Background FIFO Sync** | Offline Sync | Automatically listens to `window.onLine` events, reading queued offline bookings in FIFO order and sending `POST /api/book`. Handles 409 conflict errors gracefully without halting remaining queue items. |
| **Atomic Unit Reservation** | Database Concurrency | Executes atomic PostgreSQL transactions (`UPDATE unit SET status='BOOKED' WHERE id=$1 AND status='AVAILABLE'`) returning `409 Conflict` if claimed simultaneously. |
| **Inventory Search & Filter** | Inventory Management | Real-time text search by unit number and status filters (`ALL`, `AVAILABLE`, `BOOKED`). |
| **Device Pairing QR Modal** | Presentation UX | Generates an instant pairing QR code and shareable session URL to quickly link tablets and secondary screens. |
| **Render Keep-Alive Ping** | Cloud Maintenance | `/ping` & `/api/ping` endpoints returning healthy status and pong message for external uptime monitoring. |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2 (TypeScript)
- **Build Tool**: Vite 5.1
- **State Management**: Zustand 4.5 & React Query 5.28 (@tanstack/react-query)
- **HTTP & Sockets**: Axios 1.6 & Socket.IO Client 4.7
- **Offline Storage**: IndexedDB via `idb` 8.0
- **Styling**: TailwindCSS 3.4 & Lucide React 0.359

### Backend
- **Runtime**: Node.js 20 (TypeScript 5.4)
- **Web Framework**: Express 4.19
- **WebSockets**: Socket.IO 4.7
- **Database Driver**: `pg` 8.11 (PostgreSQL Connection Pool)
- **Development Tooling**: `ts-node-dev` & `dotenv`

### Database
- **Engine**: PostgreSQL 16

### Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server / Proxy**: Nginx (Frontend multi-stage container build)

---

## 📂 Project Structure

```
sales-kiosk-app/
├── docker-compose.yml            # Multi-container orchestration (PostgreSQL, Backend, Frontend)
├── .gitignore                    # Workspace ignore rules
├── README.md                     # Root project documentation
├── kiosk-backend/                # Node.js + Express + TypeScript + PostgreSQL Backend
│   ├── Dockerfile                # Multi-stage production Docker build
│   ├── package.json              # Backend dependencies & scripts
│   ├── tsconfig.json             # TypeScript compiler settings
│   ├── .env                      # Environment configuration
│   ├── README.md                 # Backend-specific documentation
│   └── src/
│       ├── app.ts                # Express application & middleware configuration
│       ├── server.ts             # HTTP & Socket.IO server setup & router mounting
│       ├── seed.ts               # PostgreSQL table creation & seed execution
│       ├── core/                 # Environment config, DB pool, Socket instance
│       └── modules/              # Domain modules (booking, gallery, inventory, video, websocket)
└── frontend/                     # React 18 + Vite + TailwindCSS Frontend
    ├── Dockerfile                # Multi-stage Nginx build
    ├── nginx.conf                # Nginx proxy configuration
    ├── package.json              # Frontend dependencies & scripts
    ├── vite.config.ts            # Vite build & dev server config
    ├── README.md                 # Frontend-specific documentation
    └── src/
        ├── App.tsx               # Root component with Socket & Network listeners
        ├── main.tsx              # React entry point with React Query Provider
        ├── components/           # 14 Reusable UI components
        ├── pages/                # InventoryPage, GalleryPage, VideosPage
        ├── services/             # REST API, Socket.IO, and IndexedDB services
        ├── store/                # Zustand global state store & offline sync logic
        └── types/                # Shared TypeScript type definitions
```

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: `v18.0+`
- **PostgreSQL**: `v14+` (or PostgreSQL connection URI)
- **Docker & Docker Compose** (Optional, for containerized execution)

---

### 1. Backend Setup (`kiosk-backend`)

```bash
# Navigate to backend directory
cd kiosk-backend

# Install NPM dependencies
npm install

# Start local development server
npm run dev
```

#### Environment Variables (`kiosk-backend/.env`)
```env
PORT=8000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/kiosk_db
NODE_ENV=development
```

> 💡 **Database Auto-Seeding**: PostgreSQL tables (`tower`, `unit`, `gallery`, `video`, `booking`) and initial data are created automatically when the backend starts.

---

### 2. Frontend Setup (`frontend`)

```bash
# Navigate to frontend directory
cd frontend

# Install NPM dependencies
npm install

# Start Vite development server
npm run dev
```

#### Environment Variables (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000/api`
- **Keep-Alive Ping**: `http://localhost:8000/ping`

---

## 🐳 Docker Setup

To launch the complete containerized stack (PostgreSQL 16, Node.js Backend, Nginx Frontend) with Docker Compose:

```bash
# Build and launch all services in detached mode
docker-compose up --build -d
```

### Services Summary

| Service | Container Name | Internal Port | Mapped Host Port | Dockerfile |
| :--- | :--- | :--- | :--- | :--- |
| **postgres** | `kiosk-postgres` | `5432` | `5432` | `postgres:16-alpine` |
| **backend** | `kiosk-backend` | `8000` | `8000` | `kiosk-backend/Dockerfile` |
| **frontend** | `kiosk-frontend` | `80` | `5173` | `frontend/Dockerfile` |

To stop and remove containers & volumes:
```bash
docker-compose down -v
```

---

## 📜 Available Scripts

### Backend (`kiosk-backend/package.json`)

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `ts-node-dev --respawn --transpile-only src/server.ts` | Starts backend development server with auto-reload. |
| `npm run build` | `tsc` | Compiles TypeScript source files to `dist/`. |
| `npm run start` | `node dist/server.js` | Runs compiled production JavaScript build. |

### Frontend (`frontend/package.json`)

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts Vite local development server. |
| `npm run build` | `tsc && vite build` | Type-checks code and compiles production bundle to `dist/`. |
| `npm run lint` | `eslint . --ext ts,tsx ...` | Runs ESLint analysis across TypeScript & TSX files. |
| `npm run preview` | `vite preview` | Serves production build locally for previewing. |

---

## 🎨 Coding Style & Conventions

- **Modular Architecture**: Feature domains (`booking`, `gallery`, `inventory`, `video`, `websocket`) strictly isolated.
- **Layered Enterprise Pattern**: Separation of concerns across `router.ts` (HTTP layer), `service.ts` (business logic), and `repository.ts` (database access).
- **Naming Conventions**:
  - Components: `PascalCase` (e.g., `PresentationManager.tsx`, `BookingModal.tsx`).
  - Functions & Variables: `camelCase` (e.g., `syncPendingBookings`, `getPersistentClientId`).
  - Interfaces & Types: `PascalCase` (e.g., `ConnectedClient`, `GalleryCacheRecord`).
  - CSS Styling: Utility-first TailwindCSS classes with glassmorphism overlays and Dark Mode default palette.
- **TypeScript**: Strict type mode enabled (`"strict": true` in `tsconfig.json`) across both frontend and backend codebases.
