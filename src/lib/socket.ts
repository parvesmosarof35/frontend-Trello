import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const rawUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      'https://trello-trellobackend-oh99sz-6fe50c-2-24-82-111.sslip.io/api';
    
    // Extract base origin (without /api path)
    const baseOrigin = rawUrl.replace(/\/api\/?$/, '');

    socket = io(baseOrigin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }

  return socket;
};
