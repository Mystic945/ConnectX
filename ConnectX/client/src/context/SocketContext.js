import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socketRef.current.emit('user:online', user._id);

      socketRef.current.on('users:online', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  const joinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('room:join', roomId);
    }
  };

  const sendMessage = (data) => {
    if (socketRef.current) {
      socketRef.current.emit('message:send', data);
    }
  };

  const onMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message:receive', callback);
      return () => socketRef.current?.off('message:receive', callback);
    }
  };

  const emitTyping = (roomId, isTyping) => {
    if (socketRef.current) {
      socketRef.current.emit(isTyping ? 'typing:start' : 'typing:stop', {
        roomId,
        userId: user?._id,
      });
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      onlineUsers,
      joinRoom,
      sendMessage,
      onMessage,
      emitTyping,
      isOnline,
    }}>
      {children}
    </SocketContext.Provider>
  );
};
