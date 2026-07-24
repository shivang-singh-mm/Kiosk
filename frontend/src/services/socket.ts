import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

class SocketService {
  private socket: Socket | null = null;
  private currentSessionId: string = 'default';

  public connect(sessionId: string, onStateReceived?: (state: any) => void) {
    this.currentSessionId = sessionId;

    if (this.socket && this.socket.connected) {
      this.socket.emit('join_session', { sessionId });
      return;
    }

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.socket?.emit('join_session', { sessionId: this.currentSessionId });
    });

    this.socket.on('room_state', (state) => {
      if (onStateReceived) {
        onStateReceived(state);
      }
    });

    this.socket.on('disconnect', () => {
      console.warn('Socket disconnected. Reconnecting...');
    });
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public emit(event: string, payload: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, payload);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
