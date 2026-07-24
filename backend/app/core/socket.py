import socketio
from app.core.config import settings

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)

socket_app = socketio.ASGIApp(
    socketio_server=sio,
    socketio_path="socket.io"
)
