# Aura Realty Kiosk Pro — Backend Documentation

Node.js, Express, TypeScript, and PostgreSQL backend service providing REST API endpoints, Zod middleware validation, live Swagger OpenAPI documentation UI, and real-time Socket.IO WebSockets for multi-device kiosk presentation synchronization and atomic unit reservations.

---

## 📚 Interactive API Documentation (Swagger)

Live Swagger API Documentation UI:
👉 **[https://kiosk-g6jr.onrender.com/docs](https://kiosk-g6jr.onrender.com/docs)** *(Local: `http://localhost:8000/docs`)*

---

## 📂 Backend Folder Structure

```
kiosk-backend/
├── Dockerfile
├── package.json
├── tsconfig.json
├── .env
└── src/
    ├── app.ts
    ├── server.ts
    ├── seed.ts
    ├── core/
    │   ├── config/
    │   └── middleware/
    └── modules/
        ├── booking/
        ├── gallery/
        ├── inventory/
        ├── video/
        └── websocket/
```

### Why a Modular Structure Benefits Debugging & Scaling

1. **Domain Isolation**: Each feature domain (`booking`, `gallery`, `inventory`, `video`, `websocket`) maintains its own self-contained router, service, repository, and schema.
2. **Effortless Debugging**: When an issue arises in a specific feature (e.g. unit reservations), developers can isolate and debug within `src/modules/booking/` without wading through unrelated code.
3. **Scalability & Code Ownership**: New capabilities or domain modules can be added seamlessly by creating a new directory in `src/modules/` without causing merge conflicts or breaking existing API contracts.
4. **Clean Layered Pattern**: Separation of concerns (`router` ➔ `service` ➔ `repository`) ensures controllers stay clean while database logic remains reusable and testable.

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

2. **WebSocket Flow**:
   - **Client Connection** ➔ `core/socket.ts` (Socket.IO instance)
   - **Event Listening** ➔ `modules/websocket/events.ts` (Handles `join_session`, `sync_*`, `client_*`)
   - **Session State Management** ➔ `modules/websocket/manager.ts` (`SessionRoomManager` maintains in-memory active client identity, room state, paused states, and selective broadcasting)
