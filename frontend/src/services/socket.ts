import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export function getPersistentClientId(): string {
  let clientId = sessionStorage.getItem('kiosk_client_id');
  if (!clientId) {
    clientId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'client-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    sessionStorage.setItem('kiosk_client_id', clientId);
  }
  return clientId;
}

export function detectBrowserAndOS() {
  const ua = navigator.userAgent;
  let browser = 'Chrome';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';

  let os = 'Windows';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, operatingSystem: os };
}

class SocketService {
  private socket: Socket | null = null;
  private currentSessionId: string = 'default';

  public connect(sessionId: string, onStateReceived?: (state: any) => void) {
    this.currentSessionId = sessionId;
    const clientId = getPersistentClientId();
    const { browser, operatingSystem } = detectBrowserAndOS();

    if (this.socket && this.socket.connected) {
      this.socket.emit('join_session', { sessionId, clientId, browser, operatingSystem });
      return;
    }

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        clientId,
        browser,
        operatingSystem,
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id, 'ClientId:', clientId);
      this.socket?.emit('join_session', {
        sessionId: this.currentSessionId,
        clientId,
        browser,
        operatingSystem,
      });
    });

    this.socket.on('room_state', (state) => {
      if (onStateReceived) {
        onStateReceived(state);
      }
    });

    this.socket.on('disconnect', () => {
      console.warn('Socket disconnected.');
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
