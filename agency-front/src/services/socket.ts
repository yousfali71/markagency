import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

// WebSocket disabled to prevent connection attempt errors when backend is offline
const ENABLE_WEBSOCKET = false;

export const initSocket = (token: string, baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!ENABLE_WEBSOCKET) {
    return null;
  }

  socketInstance = io(baseUrl, {
    auth: { token },
    transports: ['polling', 'websocket'],
    autoConnect: false,
    reconnection: false,
  });

  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocket = () => socketInstance;
