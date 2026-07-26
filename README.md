# Sales Kiosk Application

Production-ready, feature-modular **Real-Time Sales Kiosk Application** designed for high-end real estate sales galleries. Built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Socket.IO**, **React**, **Vite**, **Zustand**, and **TailwindCSS**.

Designed for sales executives and client presentation suites to mirror screens live across devices (tablets, kiosks, desktop browsers) with real-time state sync, **Presentation Manager controls**, **persistent tab identity**, and **race-condition safe atomic unit reservations**.

---

## 📋 Table of Contents

- [🌟 Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Local Environment Setup](#-local-environment-setup)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (Node.js + TypeScript + PostgreSQL)](#1-backend-setup-nodejs--typescript--postgresql)
  - [Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
- [📡 API Endpoints Reference](#-api-endpoints-reference)
- [💻 Frontend Pages & Presentation Manager Reference](#-frontend-pages--presentation-manager-reference)
- [⚡ WebSocket Events Contract](#-websocket-events-contract)
- [🔒 Atomic Reservation & Concurrency Handling](#-atomic-reservation--concurrency-handling)
- [🧪 Real-Time Device Pairing & Presentation Manager Test Guide](#-real-time-device-pairing--presentation-manager-test-guide)
- [☁️ Cloud Deployment & Keep-Alive Ping](#️-cloud-deployment--keep-alive-ping)
- [🔧 Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Key Features

1. **Feature-Based Modular Architecture**:
   - Clean domain separation (`src/modules/gallery`, `src/modules/video`, `src/modules/inventory`, `src/modules/booking`, `src/modules/websocket`).
   - Layered enterprise pattern (`router.ts`, `service.ts`, `repository.ts`).
2. **Persistent Client Identity**:
   - Tab-persistent UUID stored in `sessionStorage`. Survives page reloads without creating duplicate client entries or inflating client counts.
3. **Executive Presentation Manager**:
   - Live client list drawer showing connected clients, browser, OS, connected time, current page, and live status badges (`Live`, `Mirroring Paused`, `Disconnected`).
   - Per-client presenter controls: **Pause Mirroring**, **Resume Mirroring** (instant state resync), and **Disconnect Client**.
4. **Atomic Race-Condition Safe Unit Booking**:
   - Database-level transaction safety via PostgreSQL conditional SQL updates: `UPDATE unit SET status='BOOKED' WHERE id=$1 AND status='AVAILABLE'`.
   - Prevents double-booking across simultaneous sales executive requests (returns `409 Conflict`).
5. **Real-Time Multi-Device Room Synchronization**:
   - Bi-directional Socket.IO room sync (`sales-room-101`).
   - Selective broadcasting ensures paused screens bypass live state updates until resumed.
6. **Render Deployment Keep-Alive**:
   - Keep-alive ping endpoint (`/ping` & `/api/ping`) returning `{ status: 'healthy', message: 'pong' }` for UptimeRobot / cron pings on Render.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client1[Kiosk Executive Screen] <-->|Socket.IO Events| SIO[Node.js + Socket.IO Server]
    Client2[Customer Tablet Screen] <-->|Socket.IO Events| SIO
    
    Client1 -->|REST API Requests| API[Express V1 REST Endpoints]
    Client2 -->|REST API Requests| API
    
    API --> Service[Domain Services]
    Service --> Repo[PostgreSQL Repositories]
    Repo --> DB[(PostgreSQL Database)]

    SIO --> RoomMgr[In-Memory Session Room Manager]
```

---

## 🚀 Local Environment Setup

### Prerequisites
- **Node.js**: `18.0+` (with `npm`)
- **PostgreSQL**: `14+` (or PostgreSQL connection URI)
- **Git**

---

### 1. Backend Setup (Node.js + TypeScript + PostgreSQL)

```bash
# 1. Navigate to kiosk-backend directory
cd kiosk-backend

# 2. Install NPM dependencies
npm install

# 3. Create or configure .env file
# Example .env:
# PORT=8000
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/kiosk_db

# 4. Start TypeScript development server
npm run dev
```

> 💡 **Note**: Database schema tables (`tower`, `unit`, `gallery`, `video`, `booking`) and seed data (3 Towers, 12 Units, 8 Gallery Images, 4 Videos) are automatically generated on server startup.

---

### 2. Frontend Setup (React + Vite)

Open a **new terminal window**:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install NPM dependencies
npm install

# 3. Create or configure .env file
# Example .env:
# VITE_API_URL=http://localhost:8000/api
# VITE_SOCKET_URL=http://localhost:8000

# 4. Start Vite local development server
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Base**: `http://localhost:8000/api`
- **Keep-Alive Ping Endpoint**: `http://localhost:8000/ping`

---

## 📡 API Endpoints Reference

All REST API endpoints are served under `/api` (or root health routes):

| HTTP Method | Endpoint | Description | Request Body / Query | Response Code | Tag |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` or `/ping` or `/api/ping` | Keep-alive health check & server status | None | `200 OK` | Health |
| **GET** | `/api/inventory` | Fetches all towers with nested units & availability stats | None | `200 OK` | Inventory |
| **GET** | `/api/gallery` | Fetches property gallery photo list | None | `200 OK` | Gallery |
| **GET** | `/api/videos` | Fetches promotional property video catalog | None | `200 OK` | Videos |
| **POST** | `/api/book` | Atomically reserves an available unit | `{ unitId, customerName, phone, sessionId }` | `201 Created` / `409 Conflict` / `404 Not Found` | Booking |

---

## 💻 Frontend Pages & Presentation Manager Reference

| View / Component | View Identifier | Key Components & Features | Description |
| :--- | :--- | :--- | :--- |
| **Inventory Grid** | `inventory` | `TowerSelector`, `UnitGrid`, `UnitCard`, `BookingModal` | Interactive inventory page displaying residential towers, unit floor plans, real-time availability tags, search, and direct unit booking modal. |
| **Media Gallery** | `gallery` | `ImageGrid`, `ImageModal` | High-definition image showcase featuring full-screen image lightbox sync. |
| **Video Theater** | `videos` | `VideoCard`, `CustomVideoPlayer` | Video showcase streaming HD project walkthroughs with synchronized play/pause/seek controls. |
| **Presentation Manager** | Side Drawer (Global) | `PresentationManager` | Clickable client badge opens live drawer listing connected clients, browser, OS, connected time, page, and controls (**Pause**, **Resume**, **Disconnect**). |
| **Device Pairing Header** | Navbar (Global) | `QRModal`, `SessionLinkBanner` | Displays pairing status, session room ID trigger, client count badge, and QR code modal for mobile/tablet pairing. |

---

## ⚡ WebSocket Events Contract

WebSocket connection endpoint: `http://localhost:8000/socket.io`

| Event Name | Direction | Payload Example | Purpose |
| :--- | :--- | :--- | :--- |
| `join_session` | Client ➔ Server | `{ "sessionId": "sales-room-101", "clientId": "uuid", "browser": "Chrome", "operatingSystem": "Windows" }` | Joins a synchronized presentation room with persistent client identity. |
| `sync_navigation` | Bi-directional | `{ "activePage": "gallery" }` | Syncs active tab across all paired devices. |
| `sync_tower` | Bi-directional | `{ "selectedTowerId": 2 }` | Syncs active tower selection. |
| `sync_unit` | Bi-directional | `{ "selectedUnitId": 5 }` | Syncs highlighted/selected property unit. |
| `sync_gallery` | Bi-directional | `{ "galleryPreview": { ... } }` | Syncs full-screen photo lightbox item. |
| `sync_video` | Bi-directional | `{ "videoPlayback": { "isPlaying": true, "currentTime": 12.5 } }` | Syncs video play state and timestamp. |
| `sync_booking_modal` | Bi-directional | `{ "bookingModal": 5 }` | Opens/closes booking dialog across screens. |
| `client_list` | Client ➔ Server | None | Requests current connected client list. |
| `client_pause` | Client ➔ Server | `{ "clientId": "target-uuid" }` | Pauses mirroring for a client screen. |
| `client_resume` | Client ➔ Server | `{ "clientId": "target-uuid" }` | Resumes mirroring and resyncs latest state. |
| `client_disconnect` | Client ➔ Server | `{ "clientId": "target-uuid" }` | Disconnects client and shows presenter disconnect overlay. |

---

## 🔒 Atomic Reservation & Concurrency Handling

In high-traffic real estate launches, multiple agents may click **"Book Now"** on the same unit simultaneously. 

To eliminate race conditions, the Node.js PostgreSQL backend uses **atomic SQL statements within a single transaction**:

```typescript
// Executed within an explicit PostgreSQL transaction
await client.query('BEGIN');

const updateRes = await client.query(
  "UPDATE unit SET status = 'BOOKED' WHERE id = $1 AND status = 'AVAILABLE'",
  [unitId]
);

if (updateRes.rowCount === 0) {
  await client.query('ROLLBACK');
  throw new CustomError('This unit has already been booked.', 409);
}

const insertRes = await client.query(
  'INSERT INTO booking ("unitId", "customerName", phone, "bookedAt") VALUES ($1, $2, $3, NOW()) RETURNING *',
  [unitId, customerName, phone]
);

await client.query('COMMIT');
```

- **Guarantees**: Zero race conditions, absolute ACID transaction safety, no duplicate bookings.

---

## 🧪 Real-Time Device Pairing & Presentation Manager Test Guide

To verify multi-screen synchronization & Presentation Manager controls locally:

1. Open `http://localhost:5173` in **Browser Tab 1** (e.g. Executive Kiosk).
2. Open `http://localhost:5173/?session=sales-room-101` in **Browser Tab 2** (Customer Screen).
3. Click the **Connected Clients badge** in Tab 1 navbar to open the **Presentation Manager**.
4. Observe both Tab 1 and Tab 2 listed with their detected Browser, OS, and Live status.
5. Click **Pause Mirroring** on Tab 2 from Tab 1:
   - Tab 2 status changes to `Mirroring Paused`.
   - Navigating on Tab 1 no longer affects Tab 2.
6. Click **Resume Mirroring** on Tab 2:
   - Tab 2 instantly resynchronizes to Tab 1's current screen and state.
7. Click **Disconnect Client** on Tab 2:
   - Tab 2 receives the disconnect notification and shows the *"Disconnected from presentation by presenter"* overlay.

---

## ☁️ Cloud Deployment & Keep-Alive Ping

When deploying `kiosk-backend` to free or starter web hosting platforms like **Render**:

- Render web services spin down after 15 minutes of inactivity.
- To keep your backend active 24/7, set up an automated cron or UptimeRobot monitor pinging:
  ```
  https://your-app-name.onrender.com/ping
  ```
- **Response**:
  ```json
  {
    "status": "healthy",
    "message": "pong",
    "app": "Aura Realty Kiosk Pro (Node.js + PostgreSQL)",
    "timestamp": "2026-07-26T01:10:00.000Z"
  }
  ```

---

## 🔧 Troubleshooting & FAQ

#### Q1: `error: relation "tower" does not exist`
**Solution**: Ensure your PostgreSQL database is running and `DATABASE_URL` in `kiosk-backend/.env` is correct. The server automatically creates tables on startup.

#### Q2: `Connection refused on localhost:5432`
**Solution**: Start your local PostgreSQL server or set `DATABASE_URL` to your remote PostgreSQL cloud URL (e.g., Supabase, Render Postgres, ElephantSQL).

#### Q3: Socket.IO connection failed or CORS blocked
**Solution**: Verify `VITE_SOCKET_URL` in `frontend/.env` matches your backend base URL (e.g., `http://localhost:8000`).

---

### 👨‍💻 Maintainer & Senior Engineering Notes
- Built using **Node.js, Express, TypeScript, and `pg`** for high request throughput and memory efficiency.
- Frontend uses **Zustand** central store for clean state decoupling between Socket.IO events and UI reactivity.
- Persistent client identity and selective broadcasting ensure scalable multi-screen session management.
