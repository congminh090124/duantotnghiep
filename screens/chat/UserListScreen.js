import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    View, Text, Image, FlatList, StyleSheet, TouchableOpacity,
    SafeAreaView, ActivityIndicator, RefreshControl
} from 'react-native';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this function before the UserListScreen component
const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // Nếu tin nhắn trong hôm nay
    if (diffInHours < 24 && messageDate.getDate() === now.getDate()) {
        return messageDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }
    
    // Nếu tin nhắn trong tuần này
    if (diffInDays < 7) {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[messageDate.getDay()];
    }
    
    // Nếu tin nhắn cũ hơn
    return messageDate.toLocaleDateString([], {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
};

const UserListScreen = ({ navigation }) => {
    const { socket, userId } = useSocket();
    const [activeUsers, setActiveUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const activeUsersRef = useRef(activeUsers);
    const conversationsRef = useRef(conversations);

    // Fetch data function
    const fetchData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const [conversationsRes, onlineUsersRes] = await Promise.all([
                axios.get(`${API_ENDPOINTS.socketURL}/api/chat/conversations`, config),
                axios.get(`${API_ENDPOINTS.socketURL}/api/chat/online-users`, config)
            ]);

            const sortedConversations = conversationsRes.data
                .filter(conv => conv.lastMessage)
                .sort((a, b) => new Date(b.lastMessage?.createdAt) - new Date(a.lastMessage?.createdAt));

            setConversations(sortedConversations);
            setActiveUsers(onlineUsersRes.data);
            
            // Update refs
            activeUsersRef.current = onlineUsersRes.data;
            conversationsRef.current = sortedConversations;
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Pull to refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData(false);
    }, [fetchData]);

    // Socket event handlers
    const handleUserStatus = useCallback((data) => {
        const { userId: statusUserId, isOnline, username, avatar, lastActive } = data;
        
        // Cập nhật activeUsers
        setActiveUsers(prev => {
            if (isOnline) {
                // Kiểm tra xem user đã tồn tại chưa
                const existingUserIndex = prev.findIndex(user => user._id === statusUserId);
                if (existingUserIndex === -1) {
                    // Thêm user mới vào danh sách online
                    return [...prev, { 
                        _id: statusUserId, 
                        username, 
                        avatar, 
                        isOnline: true,
                        lastActive: new Date()
                    }];
                } else {
                    // Cập nhật trạng thái user hiện tại
                    return prev.map(user => 
                        user._id === statusUserId 
                            ? { ...user, isOnline: true, lastActive: new Date() }
                            : user
                    );
                }
            } else {
                // Xóa user khỏi danh sách online
                return prev.filter(user => user._id !== statusUserId);
            }
        });

        // Cập nhật trạng thái trong conversations
        setConversations(prev => 
            prev.map(conv => {
                if (conv.with._id === statusUserId) {
                    return {
                        ...conv,
                        with: {
                            ...conv.with,
                            isOnline,
                            lastActive: lastActive || new Date()
                        }
                    };
                }
                return conv;
            })
        );
    }, []);

    const handleConversationUpdate = useCallback((data) => {
        const { messageId, content, createdAt, senderId, receiverId } = data;
        
        setConversations(prev => {
            const partnerId = senderId === userId ? receiverId : senderId;
            const existingConvIndex = prev.findIndex(conv => conv.with._id === partnerId);
            
            let updatedConversations = [...prev];
            const partnerInfo = activeUsersRef.current.find(u => u._id === partnerId);

            const newConversationData = {
                lastMessage: {
                    _id: messageId,
                    content,
                    createdAt: new Date(createdAt).toISOString()
                },
                unreadCount: senderId === userId ? 0 : 1
            };

            if (existingConvIndex === -1 && partnerInfo) {
                updatedConversations.unshift({
                    with: partnerInfo,
                    ...newConversationData
                });
            } else if (existingConvIndex !== -1) {
                const currentConv = updatedConversations[existingConvIndex];
                updatedConversations.splice(existingConvIndex, 1);
                updatedConversations.unshift({
                    ...currentConv,
                    ...newConversationData,
                    unreadCount: senderId === userId 
                        ? 0 
                        : (currentConv.unreadCount || 0) + 1
                });
            }

            return updatedConversations;
        });
    }, [userId]);

    const handleMessagesRead = useCallback(({ fromUserId }) => {
        setConversations(prev => 
            prev.map(conv => 
                conv.with._id === fromUserId
                    ? { ...conv, unreadCount: 0 }
                    : conv
            )
        );
    }, []);

    // Socket setup
    useEffect(() => {
        if (!socket) return;

        // Fetch initial data
        fetchData();

        // Đăng ký user online khi vào màn hình
        socket.emit('user_connected', userId);

        // Lắng nghe các sự kiện
        socket.on('user_status_changed', handleUserStatus);
        socket.on('conversation_updated', handleConversationUpdate);
        socket.on('messages_marked_read', handleMessagesRead);

        // Cleanup khi rời màn hình
        return () => {
            socket.off('user_status_changed', handleUserStatus);
            socket.off('conversation_updated', handleConversationUpdate);
            socket.off('messages_marked_read', handleMessagesRead);
        };
    }, [socket, userId, fetchData, handleUserStatus, handleConversationUpdate, handleMessagesRead]);

    // Thêm useEffect để cập nhật refs
    useEffect(() => {
        activeUsersRef.current = activeUsers;
    }, [activeUsers]);

    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);

    // Render functions
    const renderActiveUser = useCallback(({ item }) => (
        <TouchableOpacity 
            style={styles.activeUserItem}
            onPress={() => navigation.navigate('ChatScreen', { 
                userId: item._id, 
                userName: item.username,
                userAvatar: item.avatar,
                isOnline: item.isOnline,
                blockStatus: {
                    isBlocked: false,
                    isBlockedBy: false,
                    canMessage: true
                }
            })}
        >
            <View style={[
                styles.activeAvatarContainer,
                { borderColor: item.isOnline ? '#4CAF50' : '#999' }
            ]}>
                <Image 
                    source={{ uri: item.avatar || 'https://via.placeholder.com/60' }} 
                    style={styles.activeAvatar} 
                />
                <View style={[
                    styles.onlineBadge,
                    { backgroundColor: item.isOnline ? '#4CAF50' : '#999' }
                ]} />
            </View>
            <Text style={styles.activeUserName} numberOfLines={1}>
                {item.username}
            </Text>
        </TouchableOpacity>
    ), [navigation]);

    const renderConversation = useCallback(({ item }) => {
        const canMessage = item.blockStatus?.canMessage !== false;
        const blockMessage = item.blockStatus?.isBlocked ? 
            'Bạn đã chặn người dùng này' : 
            item.blockStatus?.isBlockedBy ? 
                'Bạn đã bị chặn bởi người dùng này' : '';

        return (
            <TouchableOpacity 
                style={[
                    styles.userItem,
                    !canMessage && styles.blockedConversation
                ]}
                onPress={() => navigation.navigate('ChatScreen', { 
                    userId: item.with._id, 
                    userName: item.with.username,
                    userAvatar: item.with.avatar,
                    blockStatus: item.blockStatus 
                })}
            >
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: item.with.avatar || 'https://via.placeholder.com/50' }} 
                        style={styles.avatar} 
                    />
                    <View style={[
                        styles.chatOnlineBadge,
                        { backgroundColor: item.with.isOnline ? '#4CAF50' : 'transparent' }
                    ]} />
                </View>
                <View style={styles.userInfo}>
                    <View style={styles.nameTimeContainer}>
                        <Text style={styles.userName}>
                            {item.with.username}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatMessageTime(item.lastMessage?.createdAt)}
                        </Text>
                    </View>
                    <View style={styles.lastMessageContainer}>
                        <Text style={[
                            styles.lastMessage,
                            !canMessage && styles.blockedMessage
                        ]} numberOfLines={1}>
                            {!canMessage ? blockMessage : item.lastMessage?.content}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, [navigation]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0084ff" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tin nhắn</Text>
                <Text style={styles.activeCount}>
                    {activeUsers.length} đang hoạt động
                </Text>
            </View>

            <View style={styles.activeUsersContainer}>
                <FlatList
                    horizontal
                    data={activeUsers}
                    keyExtractor={item => item._id}
                    renderItem={renderActiveUser}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.activeUsersList}
                />
            </View>

            <FlatList
                data={conversations}
                keyExtractor={item => item.with._id}
                renderItem={renderConversation}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0084ff']}
                    />
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  activeCount: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 5,
  },
  activeUsersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  activeUsersList: {
    padding: 15,
  },
  activeUserItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 60,
  },
  activeAvatarContainer: {
    position: 'relative',
    marginBottom: 5,
    padding: 2,
    borderRadius: 32,
    borderWidth: 2,
  },
  activeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  activeUserName: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
  userItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginLeft: 80,
  },
  unreadName: {
    fontWeight: '800',
    color: '#000',
  },
  unreadTime: {
    color: '#0084ff',
    fontWeight: '600',
  },
  unreadMessage: {
    color: '#000',
    fontWeight: '600',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadBadge: {
    backgroundColor: '#0084ff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  blockedConversation: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8'
  },
  blockedMessage: {
    fontStyle: 'italic',
    color: '#999'
  }
});

export default UserListScreen;