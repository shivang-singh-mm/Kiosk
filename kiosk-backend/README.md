# Aura Realty Kiosk Pro — Backend Documentation

Node.js, Express, TypeScript, and PostgreSQL backend service providing REST API endpoints and real-time Socket.IO WebSockets for multi-device kiosk presentation synchronization and atomic unit reservations.

---

## 📂 Backend Folder Structure

```
kiosk-backend/
├── Dockerfile                    # Multi-stage production Docker build configuration
├── package.json                  # Backend dependencies, engine specs, and NPM scripts
├── tsconfig.json                 # TypeScript compiler configuration (ES2022 / CommonJS)
├── .env                          # Environment variables configuration (PORT, DATABASE_URL)
└── src/                          # TypeScript source code root
    ├── app.ts                    # Express app initialization, CORS middleware, and health ping routes
    ├── server.ts                 # HTTP & Socket.IO server startup, database seeding trigger, and route mounting
    ├── seed.ts                   # PostgreSQL schema creation and automatic seed data execution
    ├── core/                     # Application core infrastructure
    │   ├── config.ts             # Environment variable parser and application configuration defaults
    │   ├── database.ts           # PostgreSQL connection pool instance using 'pg'
    │   └── socket.ts             # Socket.IO server instance initialization and getter
    └── modules/                  # Feature domain modules
        ├── booking/              # Unit reservation domain
        │   ├── models.py         # [DEPRECATED] Legacy model file from initial setup
        │   ├── repository.ts     # Atomic PostgreSQL reservation transaction database access
        │   ├── router.ts         # POST /api/book endpoint definition and payload validation
        │   └── service.ts        # Booking business logic and Socket.IO unit_booked broadcast trigger
        ├── gallery/              # Architectural photo gallery domain
        │   ├── repository.ts     # SELECT query for gallery photo items
        │   ├── router.ts         # GET /api/gallery endpoint definition
        │   └── service.ts        # Gallery business logic layer
        ├── inventory/            # Apartment inventory domain
        │   ├── repository.ts     # PostgreSQL queries joining towers and nested units
        │   ├── router.ts         # GET /api/inventory endpoint definition
        │   └── service.ts        # Computes total, available, and booked inventory metrics
        ├── video/                # Property video showcase domain
        │   ├── repository.ts     # SELECT query for video showcase items
        │   ├── router.ts         # GET /api/videos endpoint definition
        │   └── service.ts        # Video business logic layer
        └── websocket/            # Real-time WebSocket domain
            ├── events.ts         # Socket.IO event handlers (join_session, sync_*, client_*)
            └── manager.ts        # SessionRoomManager tracking client states and selective broadcasting
```

---

## 🏛️ Backend Architecture Summary

The backend follows a layered domain-driven architecture:

1. **HTTP Request Flow**:
   - **Incoming Request** ➔ `app.ts` / `server.ts` (Express Router)
   - **Validation & Routing** ➔ `router.ts` (Validates payload structure and parameters)
   - **Business Logic** ➔ `service.ts` (Orchestrates database operations and triggers real-time events)
   - **Database Access** ➔ `repository.ts` (Executes SQL queries via PostgreSQL `pg` pool)
   - **Data Store** ➔ PostgreSQL 16 Database

2. **WebSocket Flow**:
   - **Client Connection** ➔ `core/socket.ts` (Socket.IO instance)
   - **Event Listening** ➔ `modules/websocket/events.ts` (Handles `join_session`, `sync_*`, `client_*`)
   - **Session State Management** ➔ `modules/websocket/manager.ts` (`SessionRoomManager` maintains in-memory client identity, room state, paused states, and selective broadcasting)

3. **Atomic Concurrency Flow**:
   - Reservations use explicit PostgreSQL transactions (`BEGIN`, `UPDATE unit SET status='BOOKED' WHERE id=$1 AND status='AVAILABLE'`, `INSERT INTO booking ...`, `COMMIT`).
   - If `rowCount === 0`, transaction rolls back and returns a `409 Conflict` response to prevent double-booking.
