import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import { userAPI } from '../../api/userRoute';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const response = await userAPI.getCurrentUserId();
        setCurrentUserId(response.currentUserId);
        
        const newSocket = io(import.meta.env.SERVER_URL || 'http://localhost:3000', {
          auth: {
            token: localStorage.getItem('token')
          }
        });

        newSocket.on('connect', () => {
          console.log('Connected to socket server');
          newSocket.emit('user_connected', response.currentUserId);
        });

        setSocket(newSocket);

        return () => {
          newSocket.close();
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
      }
    };

    initializeSocket();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, currentUserId }}>
      {children}
    </SocketContext.Provider>
  );
}

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};