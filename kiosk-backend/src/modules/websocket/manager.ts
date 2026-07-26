import { getIO } from '../../core/socket';

export interface RoomState {
  activePage: string;
  selectedTowerId: number;
  selectedUnitId: number | null;
  galleryPreview: any | null;
  videoPlayback: any | null;
  bookingModal: number | null;
  clientsCount: number;
}

export interface ClientInfo {
  clientId: string;
  socket_id: string | null;
  name: string;
  browser: string;
  operatingSystem: string;
  connectedAt: string;
  currentPage: string;
  status: 'Live' | 'Mirroring Paused';
  paused: boolean;
}

export class SessionRoomManager {
  private roomStates: Map<string, RoomState> = new Map();
  private sessionClients: Map<string, Map<string, ClientInfo>> = new Map();
  private clientSessions: Map<string, { sessionId: string; clientId: string }> = new Map();

  public getRoomState(sessionId: string): RoomState {
    if (!this.roomStates.has(sessionId)) {
      this.roomStates.set(sessionId, {
        activePage: 'inventory',
        selectedTowerId: 1,
        selectedUnitId: null,
        galleryPreview: null,
        videoPlayback: null,
        bookingModal: null,
        clientsCount: 0,
      });
    }
    return this.roomStates.get(sessionId)!;
  }

  public getClientSessions(): Map<string, { sessionId: string; clientId: string }> {
    return this.clientSessions;
  }

  private _getClientListPayload(sessionId: string) {
    const clientsMap = this.sessionClients.get(sessionId);
    if (!clientsMap) return [];
    
    const clientList: any[] = [];
    clientsMap.forEach((info) => {
      clientList.push({
        clientId: info.clientId,
        name: info.name,
        browser: info.browser || 'Browser',
        operatingSystem: info.operatingSystem || 'OS',
        connectedAt: info.connectedAt || '',
        currentPage: info.currentPage || 'inventory',
        status: info.status,
        isPaused: info.paused,
      });
    });
    return clientList;
  }

  public async broadcastClientList(sessionId: string): Promise<void> {
    const io = getIO();
    const clientList = this._getClientListPayload(sessionId);
    const activeCount = clientList.length;

    const roomState = this.getRoomState(sessionId);
    roomState.clientsCount = activeCount;

    const payload = {
      clientsCount: activeCount,
      clients: clientList,
    };

    io.to(sessionId).emit('client:list_updated', payload);
    io.to(sessionId).emit('room_clients_updated', { clientsCount: activeCount });
  }

  public async joinClient(
    sid: string,
    sessionId: string,
    clientId: string,
    browser: string = 'Browser',
    os: string = 'OS'
  ): Promise<void> {
    const io = getIO();
    const resolvedClientId = clientId || sid;

    if (!this.sessionClients.has(sessionId)) {
      this.sessionClients.set(sessionId, new Map());
    }

    const clientsMap = this.sessionClients.get(sessionId)!;

    // Remove old sid mapping if client reconnected with new sid
    const oldInfo = clientsMap.get(resolvedClientId);
    if (oldInfo && oldInfo.socket_id && oldInfo.socket_id !== sid) {
      this.clientSessions.delete(oldInfo.socket_id);
    }

    this.clientSessions.set(sid, { sessionId, clientId: resolvedClientId });
    
    // Join socket room
    const socket = io.sockets.sockets.get(sid);
    if (socket) {
      socket.join(sessionId);
    }

    const currentPage = this.getRoomState(sessionId).activePage || 'inventory';

    if (clientsMap.has(resolvedClientId)) {
      // Refreshed / reconnected client
      const clientInfo = clientsMap.get(resolvedClientId)!;
      clientInfo.socket_id = sid;
      clientInfo.browser = browser || clientInfo.browser || 'Browser';
      clientInfo.operatingSystem = os || clientInfo.operatingSystem || 'OS';
      clientInfo.status = clientInfo.paused ? 'Mirroring Paused' : 'Live';
    } else {
      // New client
      const clientCount = clientsMap.size + 1;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      clientsMap.set(resolvedClientId, {
        clientId: resolvedClientId,
        socket_id: sid,
        name: `Client ${clientCount}`,
        browser: browser || 'Browser',
        operatingSystem: os || 'OS',
        connectedAt: timeStr,
        currentPage: currentPage,
        status: 'Live',
        paused: false,
      });
    }

    const state = this.getRoomState(sessionId);
    if (socket) {
      socket.emit('room_state', state);
    }

    await this.broadcastClientList(sessionId);
  }

  public async leaveClient(sid: string): Promise<void> {
    const io = getIO();
    const sessionData = this.clientSessions.get(sid);
    if (sessionData) {
      const { sessionId, clientId } = sessionData;
      this.clientSessions.delete(sid);

      const socket = io.sockets.sockets.get(sid);
      if (socket) {
        socket.leave(sessionId);
      }

      const clientsMap = this.sessionClients.get(sessionId);
      if (clientsMap && clientsMap.has(clientId)) {
        const cInfo = clientsMap.get(clientId)!;
        if (cInfo.socket_id === sid) {
          clientsMap.delete(clientId);
          if (clientsMap.size === 0) {
            this.sessionClients.delete(sessionId);
          }
          await this.broadcastClientList(sessionId);
        }
      }
    }
  }

  public async updateAndBroadcast(sid: string, eventName: string, payload: any): Promise<void> {
    const io = getIO();
    const sessionData = this.clientSessions.get(sid);
    if (!sessionData) return;

    const { sessionId, clientId } = sessionData;
    const state = this.getRoomState(sessionId);

    if (eventName === 'sync_navigation') {
      state.activePage = payload.activePage || 'inventory';
      const clientsMap = this.sessionClients.get(sessionId);
      if (clientsMap && clientsMap.has(clientId)) {
        clientsMap.get(clientId)!.currentPage = state.activePage;
        await this.broadcastClientList(sessionId);
      }
    } else if (eventName === 'sync_tower') {
      state.selectedTowerId = payload.selectedTowerId;
    } else if (eventName === 'sync_unit') {
      state.selectedUnitId = payload.selectedUnitId;
    } else if (eventName === 'sync_gallery') {
      state.galleryPreview = payload.galleryPreview;
    } else if (eventName === 'sync_video') {
      state.videoPlayback = payload.videoPlayback;
    } else if (eventName === 'sync_booking_modal') {
      state.bookingModal = payload.bookingModal;
    }

    // Selective broadcast: emit to active non-paused sockets (excluding sender)
    const clientsMap = this.sessionClients.get(sessionId);
    if (clientsMap) {
      clientsMap.forEach((cinfo) => {
        if (cinfo.socket_id && cinfo.socket_id !== sid && !cinfo.paused && cinfo.status === 'Live') {
          io.to(cinfo.socket_id).emit(eventName, payload);
        }
      });
    }
  }

  public async pauseClient(sessionId: string, clientId: string): Promise<void> {
    const io = getIO();
    const clientsMap = this.sessionClients.get(sessionId);
    if (clientsMap && clientsMap.has(clientId)) {
      const cinfo = clientsMap.get(clientId)!;
      cinfo.paused = true;
      cinfo.status = 'Mirroring Paused';

      if (cinfo.socket_id) {
        io.to(cinfo.socket_id).emit('mirror_status_changed', { isPaused: true });
      }
      await this.broadcastClientList(sessionId);
    }
  }

  public async resumeClient(sessionId: string, clientId: string): Promise<void> {
    const io = getIO();
    const clientsMap = this.sessionClients.get(sessionId);
    if (clientsMap && clientsMap.has(clientId)) {
      const cinfo = clientsMap.get(clientId)!;
      cinfo.paused = false;
      if (cinfo.socket_id) {
        cinfo.status = 'Live';
        const state = this.getRoomState(sessionId);
        io.to(cinfo.socket_id).emit('room_state', state);
        io.to(cinfo.socket_id).emit('mirror_status_changed', { isPaused: false });
      }
      await this.broadcastClientList(sessionId);
    }
  }

  public async disconnectClient(sessionId: string, clientId: string): Promise<void> {
    const io = getIO();
    const clientsMap = this.sessionClients.get(sessionId);
    if (clientsMap && clientsMap.has(clientId)) {
      const cinfo = clientsMap.get(clientId)!;
      const targetSid = cinfo.socket_id;

      clientsMap.delete(clientId);
      if (clientsMap.size === 0) {
        this.sessionClients.delete(sessionId);
      }

      if (targetSid) {
        this.clientSessions.delete(targetSid);
        const socket = io.sockets.sockets.get(targetSid);
        if (socket) {
          socket.emit('client:disconnected_by_presenter', {
            message: 'You have been disconnected from this presentation by the presenter.',
          });
          socket.disconnect(true);
        }
      }

      await this.broadcastClientList(sessionId);
    }
  }

  public async broadcastUnitBooked(sessionId: string, unitId: number, customerName: string): Promise<void> {
    const io = getIO();
    const state = this.getRoomState(sessionId);
    state.selectedUnitId = null;
    state.bookingModal = null;

    const payload = {
      unitId,
      customerName,
      timestamp: String(unitId),
    };

    io.to(sessionId).emit('unit_booked', payload);
    io.emit('global_inventory_changed', payload);
  }
}

export const roomManager = new SessionRoomManager();
