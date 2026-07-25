from typing import Dict, Any, List
from datetime import datetime
from app.core.socket import sio


class SessionRoomManager:
    def __init__(self):
        # session_id -> room_state dict
        self.room_states: Dict[str, Dict[str, Any]] = {}
        # session_id -> { client_id -> client_info_dict }
        self.session_clients: Dict[str, Dict[str, Dict[str, Any]]] = {}
        # sid -> (session_id, client_id) mapping
        self.client_sessions: Dict[str, tuple[str, str]] = {}

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

    def _get_client_list_payload(self, session_id: str) -> List[Dict[str, Any]]:
        clients_dict = self.session_clients.get(session_id, {})
        client_list = []
        for cid, info in clients_dict.items():
            client_list.append({
                "clientId": cid,
                "name": info["name"],
                "browser": info.get("browser", "Browser"),
                "operatingSystem": info.get("operatingSystem", "OS"),
                "connectedAt": info.get("connectedAt", ""),
                "currentPage": info.get("currentPage", "inventory"),
                "status": info["status"],
                "isPaused": info["paused"]
            })
        return client_list

    async def broadcast_client_list(self, session_id: str):
        client_list = self._get_client_list_payload(session_id)
        # Connected count is count of Live or Mirroring Paused clients
        active_count = sum(1 for c in client_list if c["status"] != "Disconnected")
        if session_id in self.room_states:
            self.room_states[session_id]["clientsCount"] = active_count

        payload = {
            "clientsCount": active_count,
            "clients": client_list
        }
        await sio.emit("client:list_updated", payload, room=session_id)
        await sio.emit("room_clients_updated", {"clientsCount": active_count}, room=session_id)

    async def join_client(self, sid: str, session_id: str, client_id: str, browser: str = "Browser", os: str = "OS"):
        if not client_id:
            client_id = sid

        if session_id not in self.session_clients:
            self.session_clients[session_id] = {}

        # Remove old sid mapping if client_id reconnected with a new sid
        old_info = self.session_clients[session_id].get(client_id)
        if old_info and old_info.get("socket_id") and old_info["socket_id"] != sid:
            old_sid = old_info["socket_id"]
            if old_sid in self.client_sessions:
                del self.client_sessions[old_sid]

        self.client_sessions[sid] = (session_id, client_id)
        await sio.enter_room(sid, session_id)

        current_page = self.get_room_state(session_id).get("activePage", "inventory")

        if client_id in self.session_clients[session_id]:
            # Refreshed or reconnected client
            client_info = self.session_clients[session_id][client_id]
            client_info["socket_id"] = sid
            client_info["browser"] = browser or client_info.get("browser", "Browser")
            client_info["operatingSystem"] = os or client_info.get("operatingSystem", "OS")
            client_info["status"] = "Mirroring Paused" if client_info.get("paused") else "Live"
        else:
            # New client
            client_count = len(self.session_clients[session_id]) + 1
            client_info = {
                "clientId": client_id,
                "socket_id": sid,
                "name": f"Client {client_count}",
                "browser": browser or "Browser",
                "operatingSystem": os or "OS",
                "connectedAt": datetime.now().strftime("%I:%M %p"),
                "currentPage": current_page,
                "status": "Live",
                "paused": False
            }
            self.session_clients[session_id][client_id] = client_info

        state = self.get_room_state(session_id)
        # Emit initial room state to newly connected socket
        await sio.emit("room_state", state, to=sid)

        await self.broadcast_client_list(session_id)

    async def leave_client(self, sid: str):
        if sid in self.client_sessions:
            session_id, client_id = self.client_sessions.pop(sid)
            await sio.leave_room(sid, session_id)

            if session_id in self.session_clients and client_id in self.session_clients[session_id]:
                c_info = self.session_clients[session_id][client_id]
                # Only mark disconnected if this sid matches active socket for client_id
                if c_info.get("socket_id") == sid:
                    c_info["status"] = "Disconnected"
                    c_info["socket_id"] = None
                    await self.broadcast_client_list(session_id)

    async def update_and_broadcast(self, sid: str, event_name: str, payload: Dict[str, Any]):
        session_data = self.client_sessions.get(sid)
        if not session_data:
            return

        session_id, client_id = session_data
        state = self.get_room_state(session_id)

        # Update local room state cache
        if event_name == "sync_navigation":
            state["activePage"] = payload.get("activePage", "inventory")
            if session_id in self.session_clients and client_id in self.session_clients[session_id]:
                self.session_clients[session_id][client_id]["currentPage"] = state["activePage"]
                await self.broadcast_client_list(session_id)
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

        # Selective broadcast: only emit to sockets of non-paused clients in this room (excluding sender)
        clients_in_room = self.session_clients.get(session_id, {})
        for cid, cinfo in clients_in_room.items():
            target_sid = cinfo.get("socket_id")
            if target_sid and target_sid != sid and not cinfo.get("paused") and cinfo.get("status") == "Live":
                await sio.emit(event_name, payload, to=target_sid)

    async def pause_client(self, session_id: str, client_id: str):
        if session_id in self.session_clients and client_id in self.session_clients[session_id]:
            cinfo = self.session_clients[session_id][client_id]
            cinfo["paused"] = True
            if cinfo["status"] != "Disconnected":
                cinfo["status"] = "Mirroring Paused"
            
            target_sid = cinfo.get("socket_id")
            if target_sid:
                await sio.emit("mirror_status_changed", {"isPaused": True}, to=target_sid)
                
            await self.broadcast_client_list(session_id)

    async def resume_client(self, session_id: str, client_id: str):
        if session_id in self.session_clients and client_id in self.session_clients[session_id]:
            cinfo = self.session_clients[session_id][client_id]
            cinfo["paused"] = False
            if cinfo.get("socket_id"):
                cinfo["status"] = "Live"

            target_sid = cinfo.get("socket_id")
            if target_sid:
                # Sync full current state to resumed client
                state = self.get_room_state(session_id)
                await sio.emit("room_state", state, to=target_sid)
                await sio.emit("mirror_status_changed", {"isPaused": False}, to=target_sid)

            await self.broadcast_client_list(session_id)

    async def disconnect_client(self, session_id: str, client_id: str):
        if session_id in self.session_clients and client_id in self.session_clients[session_id]:
            cinfo = self.session_clients[session_id][client_id]
            target_sid = cinfo.get("socket_id")
            
            cinfo["status"] = "Disconnected"
            cinfo["socket_id"] = None

            if target_sid:
                await sio.emit("client:disconnected_by_presenter", {
                    "message": "You have been disconnected from this presentation by the presenter."
                }, to=target_sid)
                await sio.disconnect(target_sid)

            await self.broadcast_client_list(session_id)


room_manager = SessionRoomManager()
