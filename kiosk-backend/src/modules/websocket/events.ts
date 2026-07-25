import { Socket } from 'socket.io';
import { getIO } from '../../core/socket';
import { roomManager } from './manager';

export function registerSocketEvents(): void {
  const io = getIO();

  io.on('connection', (socket: Socket) => {
    const auth = socket.handshake.auth || {};
    const query = socket.handshake.query || {};
    console.log(`Client connected: ${socket.id}`, auth);

    socket.on('join_session', async (data: any) => {
      const payload = typeof data === 'object' && data !== null ? data : { sessionId: String(data) };
      const sessionId = payload.sessionId || 'default';
      const clientId = payload.clientId || auth.clientId || query.clientId || socket.id;
      const browser = payload.browser || auth.browser || query.browser || 'Browser';
      const os = payload.operatingSystem || auth.operatingSystem || query.operatingSystem || 'OS';

      await roomManager.joinClient(socket.id, sessionId, clientId, browser, os);
    });

    socket.on('sync_navigation', async (data: any) => {
      await roomManager.updateAndBroadcast(socket.id, 'sync_navigation', data);
    });

    socket.on('sync_tower', async (data: any) => {
      await roomManager.updateAndBroadcast(socket.id, 'sync_tower', data);
    });

    socket.on('sync_unit', async (data: any) => {
      await roomManager.updateAndBroadcast(socket.id, 'sync_unit', data);
    });

    socket.on('sync_gallery', async (data: any) => {
      await roomManager.updateAndBroadcast(socket.id, 'sync_gallery', data);
    });

    socket.on('sync_video', async (data: any) => {
      await roomManager.updateAndBroadcast(socket.id, 'sync_video', data);
    });

    socket.on('sync_booking_modal', async (data: any) => {
      await roomManager.updateAndBroadcast(socket.id, 'sync_booking_modal', data);
    });

    socket.on('client_list', async () => {
      const sessionData = roomManager.getClientSessions().get(socket.id);
      if (sessionData) {
        await roomManager.broadcastClientList(sessionData.sessionId);
      }
    });

    socket.on('client_pause', async (data: any) => {
      const sessionData = roomManager.getClientSessions().get(socket.id);
      if (sessionData) {
        const targetClientId = typeof data === 'object' && data !== null ? data.clientId : String(data);
        if (targetClientId) {
          await roomManager.pauseClient(sessionData.sessionId, targetClientId);
        }
      }
    });

    socket.on('client_resume', async (data: any) => {
      const sessionData = roomManager.getClientSessions().get(socket.id);
      if (sessionData) {
        const targetClientId = typeof data === 'object' && data !== null ? data.clientId : String(data);
        if (targetClientId) {
          await roomManager.resumeClient(sessionData.sessionId, targetClientId);
        }
      }
    });

    socket.on('client_disconnect', async (data: any) => {
      const sessionData = roomManager.getClientSessions().get(socket.id);
      if (sessionData) {
        const targetClientId = typeof data === 'object' && data !== null ? data.clientId : String(data);
        if (targetClientId) {
          await roomManager.disconnectClient(sessionData.sessionId, targetClientId);
        }
      }
    });

    socket.on('disconnect', async () => {
      console.log(`Client disconnected: ${socket.id}`);
      await roomManager.leaveClient(socket.id);
    });
  });
}
