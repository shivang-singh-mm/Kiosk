from app.core.socket import sio
from app.websocket.manager import room_manager


@sio.event
async def connect(sid, environ, auth=None):
    print(f"Client connected: {sid}, auth: {auth}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    await room_manager.leave_client(sid)


@sio.event
async def join_session(sid, data):
    if not isinstance(data, dict):
        data = {"sessionId": str(data)}
    session_id = data.get("sessionId", "default")
    client_id = data.get("clientId", sid)
    browser = data.get("browser", "Browser")
    os = data.get("operatingSystem", "OS")

    await room_manager.join_client(sid, session_id, client_id, browser, os)


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


@sio.event
async def client_list(sid, data=None):
    session_data = room_manager.client_sessions.get(sid)
    if session_data:
        session_id, _ = session_data
        await room_manager.broadcast_client_list(session_id)


@sio.event
async def client_pause(sid, data):
    session_data = room_manager.client_sessions.get(sid)
    if session_data:
        session_id, _ = session_data
        client_id = data.get("clientId") if isinstance(data, dict) else str(data)
        if client_id:
            await room_manager.pause_client(session_id, client_id)


@sio.event
async def client_resume(sid, data):
    session_data = room_manager.client_sessions.get(sid)
    if session_data:
        session_id, _ = session_data
        client_id = data.get("clientId") if isinstance(data, dict) else str(data)
        if client_id:
            await room_manager.resume_client(session_id, client_id)


@sio.event
async def client_disconnect(sid, data):
    session_data = room_manager.client_sessions.get(sid)
    if session_data:
        session_id, _ = session_data
        client_id = data.get("clientId") if isinstance(data, dict) else str(data)
        if client_id:
            await room_manager.disconnect_client(session_id, client_id)
