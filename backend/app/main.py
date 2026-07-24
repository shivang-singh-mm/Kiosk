from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from app.core.config import settings
from app.core.database import engine, Base
from app.core.socket import sio, socket_app
from app.gallery.router import router as gallery_router
from app.video.router import router as video_router
from app.inventory.router import router as inventory_router
from app.booking.router import router as booking_router
from app.seed import seed_database
import app.websocket.events  # Register socket event handlers


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks: create DB tables & seed
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_database()
    yield
    # Shutdown tasks
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Feature API Routers
app.include_router(gallery_router, prefix=settings.API_V1_STR)
app.include_router(video_router, prefix=settings.API_V1_STR)
app.include_router(inventory_router, prefix=settings.API_V1_STR)
app.include_router(booking_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

# Wrap FastAPI with Socket.IO ASGI app
combined_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="socket.io")
