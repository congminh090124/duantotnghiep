import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../apiConfig';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const initSocket = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userIdFromStorage = await AsyncStorage.getItem('userID');

            if (!token || !userIdFromStorage) {
                console.log('No token or userId found');
                return null;
            }

            setUserId(userIdFromStorage);

            if (socket) {
                socket.disconnect();
            }

            const socketInstance = io(API_ENDPOINTS.socketURL, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected with ID:', socketInstance.id);
                setIsConnected(true);
                socketInstance.emit('user_connected', userIdFromStorage);
            });

            socketInstance.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });

            setSocket(socketInstance);
            return socketInstance;
        } catch (error) {
            console.error('Socket init error:', error);
            return null;
        }
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
            setUserId(null);
        }
    };

    useEffect(() => {
        initSocket();
        return () => {
            disconnectSocket();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ 
            socket, 
            userId, 
            isConnected,
            initSocket,
            disconnectSocket
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};