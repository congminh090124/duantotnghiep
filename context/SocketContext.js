import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../apiConfig';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const initSocket = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userID');
                if (storedUserId) {
                    const newSocket = io(API_ENDPOINTS.socketURL, {
                        transports: ['websocket'],
                        autoConnect: true
                    });
                    
                    newSocket.on('connect', () => {
                        console.log('Socket connected');
                        setIsConnected(true);
                        newSocket.emit('userConnected', storedUserId);
                    });

                    newSocket.on('disconnect', () => {
                        console.log('Socket disconnected');
                        setIsConnected(false);
                    });

                    setSocket(newSocket);
                    setUserId(storedUserId);
                }
            } catch (error) {
                console.error('Socket initialization error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ 
            socket, 
            userId, 
            isLoading,
            isConnected
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