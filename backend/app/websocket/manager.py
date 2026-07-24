from typing import Dict, Any, Set
from app.core.socket import sio


class SessionRoomManager:
    def __init__(self):
        # session_id -> room_state dict
        self.room_states: Dict[str, Dict[str, Any]] = {}
        # sid -> session_id mapping
        self.client_sessions: Dict[str, str] = {}

    def get_room_state(self, session_id: str) -> Dict[str, Any]:
        if session_id not in self.room_states:
            self.room_states[session_id] = {
                "activePage": "inventory",
                "selectedTowerId": 1,
                "selectedUnitId": None,
                "galleryPreview": None,
                "videoPlayback": None,
                "bookingModal": None,
                "clientsCount": 0
            }
        return self.room_states[session_id]

    async def join_client(self, sid: str, session_id: str):
        self.client_sessions[sid] = session_id
        await sio.enter_room(sid, session_id)
        
        state = self.get_room_state(session_id)
        # Count connected clients in room
        state["clientsCount"] += 1

        # Emit full initial room state back to the newly joined client
        await sio.emit("room_state", state, to=sid)
        
        # Broadcast updated client count to all clients in room
        await sio.emit("room_clients_updated", {"clientsCount": state["clientsCount"]}, room=session_id)

    async def leave_client(self, sid: str):
        if sid in self.client_sessions:
            session_id = self.client_sessions.pop(sid)
            await sio.leave_room(sid, session_id)
            if session_id in self.room_states:
                self.room_states[session_id]["clientsCount"] = max(0, self.room_states[session_id]["clientsCount"] - 1)
                await sio.emit("room_clients_updated", {"clientsCount": self.room_states[session_id]["clientsCount"]}, room=session_id)

    async def update_and_broadcast(self, sid: str, event_name: str, payload: Dict[str, Any]):
        session_id = self.client_sessions.get(sid)
        if not session_id:
            return

        state = self.get_room_state(session_id)

        # Update local room state cache
        if event_name == "sync_navigation":
            state["activePage"] = payload.get("activePage", "inventory")
        elif event_name == "sync_tower":
            state["selectedTowerId"] = payload.get("selectedTowerId")
        elif event_name == "sync_unit":
            state["selectedUnitId"] = payload.get("selectedUnitId")
        elif event_name == "sync_gallery":
            state["galleryPreview"] = payload.get("galleryPreview")
        elif event_name == "sync_video":
            state["videoPlayback"] = payload.get("videoPlayback")
        elif event_name == "sync_booking_modal":
            state["bookingModal"] = payload.get("bookingModal")

        # Broadcast state change to room (excluding sender if desired, or room-wide)
        await sio.emit(event_name, payload, room=session_id, skip_sid=sid)

    async def broadcast_unit_booked(self, session_id: str, unit_id: int, customer_name: str):
        if session_id in self.room_states:
            self.room_states[session_id]["selectedUnitId"] = None
            self.room_states[session_id]["bookingModal"] = None

        # Emit room-wide inventory update notification
        payload = {
            "unitId": unit_id,
            "customerName": customer_name,
            "timestamp": str(unit_id)
        }
        await sio.emit("unit_booked", payload, room=session_id)
        # Also broadcast globally in case other rooms need total inventory sync
        await sio.emit("global_inventory_changed", payload)


room_manager = SessionRoomManager()
