import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../apiConfig';
import { showNotificationMessage } from '../screens/thongbao/FlashMessenger';
import { navigate } from '../navigation/NavigationRef';
import IncomingCallModal from './IncomingCallModal';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);

    const handleAcceptCall = async () => {
        if (socket && incomingCall) {
            try {
                const response = await fetch(`${API_ENDPOINTS.socketURL}/api/chat/video-call/accept`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify({
                        channelName: incomingCall.channelName,
                        callerId: incomingCall.callerId
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    socket.emit('accept_call', { 
                        channelName: incomingCall.channelName,
                        callerId: incomingCall.callerId 
                    });

                    navigate('VideoCallScreen', {
                        channelName: incomingCall.channelName,
                        userId: userId,
                        receiverId: incomingCall.callerId,
                        isInitiator: false
                    });
                } else {
                    showNotificationMessage('Lỗi', 'Không thể kết nối cuộc gọi');
                }
            } catch (error) {
                console.error('Error accepting call:', error);
                showNotificationMessage('Lỗi', 'Đã xảy ra lỗi khi chấp nhận cuộc gọi');
            }
            setIncomingCall(null);
        }
    };

    const handleRejectCall = async () => {
        if (socket && incomingCall) {
            try {
                const response = await fetch(`${API_ENDPOINTS.socketURL}/api/chat/video-call/reject`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify({
                        channelName: incomingCall.channelName,
                        callerId: incomingCall.callerId
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    socket.emit('reject_call', { 
                        channelName: incomingCall.channelName,
                        callerId: incomingCall.callerId 
                    });
                } else {
                    showNotificationMessage('Lỗi', 'Không thể từ chối cuộc gọi');
                }
            } catch (error) {
                console.error('Error rejecting call:', error);
                showNotificationMessage('Lỗi', 'Đã xảy ra lỗi khi từ chối cuộc gọi');
            }
            setIncomingCall(null);
        }
    };

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
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                rejectUnauthorized: false,
                timeout: 10000
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected with ID:', socketInstance.id);
                setIsConnected(true);
                socketInstance.emit('user_connected', userIdFromStorage);
            });

            socketInstance.on('receive_message', (message) => {
                console.log('Tin nhắn mới:', message);
                
                showNotificationMessage({
                    type: 'message',
                    senderName: message.sender.username,
                    senderAvatar: message.sender.avatar,
                    content: message.content,
                    createdAt: message.createdAt,
                    onPress: () => {
                        navigate('ChatScreen', {
                            userId: message.sender._id,  // ID người gửi
                            userName: message.sender.username,  // Tên người gửi
                            userAvatar: message.sender.avatar,  // Avatar người gửi
                            blockStatus: { canMessage: true }
                        });
                    }
                });
            });

            socketInstance.on('incoming_call', (callData) => {
                console.log('Incoming call:', callData);
                showNotificationMessage('Cuộc gọi video', 'Bạn có cuộc gọi video đến');
                setIncomingCall(callData);
            });

            socketInstance.on('call_canceled', () => setIncomingCall(null));
            socketInstance.on('call_timeout', () => setIncomingCall(null));
            socketInstance.on('call_ended', () => setIncomingCall(null));
            socketInstance.on('call_rejected', () => setIncomingCall(null));

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
            incomingCall,
            setIncomingCall,
            initSocket,
            disconnectSocket
        }}>
            {children}
            <IncomingCallModal
                visible={!!incomingCall}
                callData={incomingCall}
                onAccept={handleAcceptCall}
                onReject={handleRejectCall}
            />
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