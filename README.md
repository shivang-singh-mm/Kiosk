# Kiosk Pro — Project Overview

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
- **Validation & Docs**: Zod 3.23 & Swagger UI Express / Swagger JSDoc

### Database
- **Engine**: PostgreSQL 16

### Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server / Proxy**: Nginx (Frontend multi-stage container build)

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
- **Swagger Docs**: `http://localhost:8000/docs`
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

## 🔮 Future Scope

1. **PIN-Based Multi-Session Streams**:
   - **Idea**: Enable sales executives to generate a secure 4-digit PIN per presentation, isolating multiple concurrent sales rooms without session collisions.
   - **Implementation**: Store PIN-to-Session mappings in Redis/Socket.IO room namespaces and require PIN authentication during socket connection handshakes.

2. **FFmpeg Video Transcoding & Adaptive Bitrate Streaming**:
   - **Idea**: Integrate FFmpeg processing into video management for smooth, stutter-free playback across varying network conditions.

3. **Real-Time Sales Telemetry & Engagement Analytics**:
   - **Idea**: Track buyer interest metrics such as most-viewed units, image dwell times, and video completion rates during presentations.
   - **Implementation**: Send telemetry events over Socket.IO and aggregate engagement analytics in PostgreSQL analytics views.
