# Aura Realty Kiosk Pro — Backend Documentation

Node.js, Express, TypeScript, and PostgreSQL backend service providing REST API endpoints, Zod middleware validation, Swagger OpenAPI documentation UI (`/docs`), and real-time Socket.IO WebSockets for multi-device kiosk presentation synchronization and atomic unit reservations.

---

## 📂 Backend Folder Structure

```
kiosk-backend/
├── Dockerfile                    # Multi-stage production Docker build configuration
├── package.json                  # Backend dependencies, engine specs, and NPM scripts
├── tsconfig.json                 # TypeScript compiler configuration (ES2022 / CommonJS)
├── .env                          # Environment variables configuration (PORT, DATABASE_URL)
└── src/                          # TypeScript source code root
    ├── app.ts                    # Express app initialization, CORS middleware, Swagger UI routes, and health ping
    ├── server.ts                 # HTTP & Socket.IO server startup, database seeding trigger, and route mounting
    ├── seed.ts                   # PostgreSQL schema creation and automatic seed data execution
    ├── core/                     # Application core infrastructure
    │   ├── config.ts             # Environment variable parser and application configuration defaults
    │   ├── database.ts           # PostgreSQL connection pool instance using 'pg'
    │   ├── socket.ts             # Socket.IO server instance initialization and getter
    │   ├── config/               # Infrastructure configurations
    │   │   └── swagger.ts        # Swagger OpenAPI 3.0 specs and UI configuration
    │   └── middleware/           # Reusable Express request middleware
    │       └── validate.ts       # Generic Zod request body/query/params validation middleware
    └── modules/                  # Feature domain modules
        ├── booking/              # Unit reservation domain
        │   ├── repository.ts     # Atomic PostgreSQL reservation transaction database access
        │   ├── router.ts         # POST /api/book endpoint definition with OpenAPI annotations & Zod middleware
        │   ├── schema.ts         # Zod validation schema for reservation payloads (bookUnitSchema)
        │   └── service.ts        # Booking business logic and Socket.IO unit_booked broadcast trigger
        ├── gallery/              # Architectural photo gallery domain
        │   ├── repository.ts     # SELECT query for gallery photo items
        │   ├── router.ts         # GET /api/gallery endpoint definition with OpenAPI annotations
        │   └── service.ts        # Gallery business logic layer
        ├── inventory/            # Apartment inventory domain
        │   ├── repository.ts     # PostgreSQL queries joining towers and nested units
        │   ├── router.ts         # GET /api/inventory endpoint definition with OpenAPI annotations
        │   └── service.ts        # Computes total, available, and booked inventory metrics
        ├── video/                # Property video showcase domain
        │   ├── repository.ts     # SELECT query for video showcase items
        │   ├── router.ts         # GET /api/videos endpoint definition with OpenAPI annotations
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
   - **Request Validation** ➔ `core/middleware/validate.ts` (Zod schema validation middleware returning HTTP 400 on error)
   - **Clean Router** ➔ `modules/*/router.ts` (Clean route definitions decorated with OpenAPI JSDoc specs)
   - **Business Logic** ➔ `service.ts` (Orchestrates database operations and triggers real-time events)
   - **Database Access** ➔ `repository.ts` (Executes SQL queries via PostgreSQL `pg` pool)
   - **Data Store** ➔ PostgreSQL 16 Database

2. **Swagger UI Documentation**:
   - Accessible at `http://localhost:8000/docs` or `http://localhost:8000/api-docs`.

3. **WebSocket Flow**:
   - **Client Connection** ➔ `core/socket.ts` (Socket.IO instance)
   - **Event Listening** ➔ `modules/websocket/events.ts` (Handles `join_session`, `sync_*`, `client_*`)
   - **Session State Management** ➔ `modules/websocket/manager.ts` (`SessionRoomManager` maintains in-memory active client identity, room state, paused states, and selective broadcasting)
