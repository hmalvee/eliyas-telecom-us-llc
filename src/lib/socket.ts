import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('Connected to MongoDB change stream');
});

socket.on('disconnect', () => {
  console.log('Disconnected from MongoDB change stream');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

export const subscribeToCollection = (collection: string, callback: (change: any) => void) => {
  socket.on(`${collection}Change`, callback);
  return () => {
    socket.off(`${collection}Change`, callback);
  };
};