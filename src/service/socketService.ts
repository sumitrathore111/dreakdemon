import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://nextstepbackend-qhxw.onrender.com';

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
    });
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const joinProjectRoom = (projectId: string): void => {
  if (socket) {
    socket.emit('join-project', projectId);
    console.log('📡 Joined project room:', projectId);
  }
};

export const leaveProjectRoom = (projectId: string): void => {
  if (socket) {
    socket.emit('leave-project', projectId);
    console.log('📡 Left project room:', projectId);
  }
};

// Join user's personal room for receiving notifications
export const joinUserRoom = (userId: string): void => {
  if (socket) {
    socket.emit('join-user', userId);
    console.log('📡 Joined user room:', userId);
  }
};

export const leaveUserRoom = (userId: string): void => {
  if (socket) {
    socket.emit('leave-user', userId);
    console.log('📡 Left user room:', userId);
  }
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Event listeners for project updates
export const onNewMessage = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('new-message', callback);
  }
};

export const onTaskCreated = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('task-created', callback);
  }
};

export const onTaskUpdated = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('task-updated', callback);
  }
};

export const onTaskDeleted = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('task-deleted', callback);
  }
};

export const onMemberJoined = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('member-joined', callback);
  }
};

export const onJoinRequestUpdated = (callback: (data: any) => void): void => {
  if (socket) {
    socket.on('join-request-updated', callback);
  }
};

// Remove event listeners
export const offNewMessage = (callback?: (data: any) => void): void => {
  if (socket) {
    socket.off('new-message', callback);
  }
};

export const offTaskCreated = (callback?: (data: any) => void): void => {
  if (socket) {
    socket.off('task-created', callback);
  }
};

export const offTaskUpdated = (callback?: (data: any) => void): void => {
  if (socket) {
    socket.off('task-updated', callback);
  }
};

export const offTaskDeleted = (callback?: (data: any) => void): void => {
  if (socket) {
    socket.off('task-deleted', callback);
  }
};

export const offMemberJoined = (callback?: (data: any) => void): void => {
  if (socket) {
    socket.off('member-joined', callback);
  }
};

export const offJoinRequestUpdated = (callback?: (data: any) => void): void => {
  if (socket) {
    socket.off('join-request-updated', callback);
  }
};
