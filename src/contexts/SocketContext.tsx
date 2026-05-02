import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextData {
  socket: Socket | null;
  onlineUsers: Record<string, boolean>;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextData>({ socket: null, onlineUsers: {}, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children, userId }: { children: React.ReactNode, userId: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // For local dev, hit the same host/port.
    const socketInstance = io('/', {
      auth: { userId },
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user:presence', (data: { userId: string, online: boolean }) => {
      setOnlineUsers(prev => ({ ...prev, [data.userId]: data.online }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  const value = useMemo(() => ({ socket, onlineUsers, isConnected }), [socket, onlineUsers, isConnected]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
