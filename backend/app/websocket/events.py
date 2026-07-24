from app.core.socket import sio
from app.websocket.manager import room_manager


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    await room_manager.leave_client(sid)


@sio.event
async def join_session(sid, data):
    session_id = data.get("sessionId", "default") if isinstance(data, dict) else str(data)
    await room_manager.join_client(sid, session_id)


@sio.event
async def sync_navigation(sid, data):
    await room_manager.update_and_broadcast(sid, "sync_navigation", data)


@sio.event
async def sync_tower(sid, data):
    await room_manager.update_and_broadcast(sid, "sync_tower", data)


@sio.event
async def sync_unit(sid, data):
    await room_manager.update_and_broadcast(sid, "sync_unit", data)


@sio.event
async def sync_gallery(sid, data):
    await room_manager.update_and_broadcast(sid, "sync_gallery", data)


@sio.event
async def sync_video(sid, data):
    await room_manager.update_and_broadcast(sid, "sync_video", data)


@sio.event
async def sync_booking_modal(sid, data):
    await room_manager.update_and_broadcast(sid, "sync_booking_modal", data)
