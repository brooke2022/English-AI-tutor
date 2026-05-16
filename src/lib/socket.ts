import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

let socket: Socket | null = null;

function deriveWsUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

export function connectSocket(): Socket | null {
  const token = getAccessToken();
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(deriveWsUrl(), {
    path: '/ws',
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}
