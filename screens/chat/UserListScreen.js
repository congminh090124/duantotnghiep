import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS, getToken } from '../../apiConfig';
import NetInfo from "@react-native-community/netinfo";
import { debounce } from 'lodash'; // Import debounce to improve search efficiency

// Initialize socket connection globally
const socket = io(API_ENDPOINTS.socketURL);

export default function ListScreen({ navigation }) {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [userId, setUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    // Handle network connection status
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    // Load user data and initialize socket
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userID');
                if (storedUserId) {
                    setUserId(storedUserId);
                    socket.emit('userConnected', storedUserId);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();

        // Update online users when receiving the event from socket
        const handleUpdateOnlineUsers = async (users) => {
            const filteredUsers = users.filter(user => user.id !== userId);
            const token = await getToken();
            const response = await fetch(API_ENDPOINTS.onlineUsers, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const onlineUsersDetails = await response.json();
            setOnlineUsers(onlineUsersDetails.filter(user => user._id !== userId));
        };

        // Register socket event listener for online users
        socket.on('updateOnlineUsers', handleUpdateOnlineUsers);

        return () => {
            // Clean up socket events on unmount
            socket.off('updateOnlineUsers', handleUpdateOnlineUsers);
        };
    }, [userId]);

    // Fetch chat history from API
    const fetchChatHistory = useCallback(async () => {
        if (!userId || !isConnected) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_ENDPOINTS.chatHistory}/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const processedChatHistory = data.map(chat => ({
                id: chat.id || chat._id, 
                username: chat.username,
                avatar: chat.avatar,
                lastMessage: chat.lastMessage?.text || 'No messages',
                lastMessageTime: chat.lastMessage?.createdAt 
                    ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : ''
            }));
            setChatHistory(processedChatHistory);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    }, [userId, isConnected]);

    // Initial fetch chat history
    useEffect(() => {
        fetchChatHistory();
    }, [fetchChatHistory]);

    // Refresh chat history on pull-down
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchChatHistory();
        setIsRefreshing(false);
    }, [fetchChatHistory]);

    // Debounced search handler
    const handleSearch = useMemo(() => debounce((query) => setSearchQuery(query), 300), []);

    // Filtered chat history based on search query
    const filteredChatHistory = useMemo(() => {
        return chatHistory.filter(chat => 
            chat.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [chatHistory, searchQuery]);

    // Render online user
    const renderOnlineUser = useCallback(({ item }) => {
        const avatarUrl = `${API_ENDPOINTS.socketURL}${item.avatar}`;
        
        return (
            <TouchableOpacity
                style={styles.onlineUserItem}
                onPress={() => navigation.navigate('ChatScreen', { receiverId: item._id, receiverName: item.username, receiverAvatar: item.avatar })}
            >
                <Image source={{ uri: avatarUrl }} style={styles.onlineAvatar} />
                <Text style={styles.onlineUserName}>{item.username}</Text>
                <View style={styles.onlineIndicator} />
            </TouchableOpacity>
        );
    }, [navigation]);

    // Render chat item
    const renderChatItem = useCallback(({ item }) => {
        const avatarUrl = item.avatar ? `${API_ENDPOINTS.socketURL}${item.avatar}` : 'https://via.placeholder.com/50';
    
        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => {
                    navigation.navigate('ChatScreen', { receiverId: item.id, receiverName: item.username, receiverAvatar: item.avatar });
                }}
            >
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                    <Text style={styles.userName}>{item.username || 'Unknown User'}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage}
                    </Text>
                </View>
                <Text style={styles.timeStamp}>{item.lastMessageTime}</Text>
            </TouchableOpacity>
        );
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Đoạn chat</Text>
                <TouchableOpacity>
                    <Icon name="create-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
                <Icon name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm"
                    placeholderTextColor="#8E8E93"
                    onChangeText={handleSearch} // Use debounce for search
                />
            </View>
            {!isConnected && (
                <Text style={styles.offlineText}>You are offline. Some features may be unavailable.</Text>
            )}
            <FlatList
                ListHeaderComponent={
                    <FlatList
                        horizontal
                        data={onlineUsers}
                        renderItem={renderOnlineUser}
                        keyExtractor={(item) => item._id}
                        style={styles.onlineList}
                        showsHorizontalScrollIndicator={false}
                        initialNumToRender={5} // Optimized rendering for online users
                        removeClippedSubviews={true} // Improve performance by removing off-screen components
                    />
                }
                data={filteredChatHistory}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                    />
                }
                initialNumToRender={10} // Optimize FlatList initial render
                removeClippedSubviews={true} // Improve performance for large lists
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 10,
        margin: 16,
        paddingHorizontal: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 36,
        color: '#000000',
    },
    onlineList: {
        paddingLeft: 16,
        marginBottom: 16,
    },
    onlineUserItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    onlineAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 4,
    },
    onlineUserName: {
        color: '#000000',
        fontSize: 12,
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CD964',
        position: 'absolute',
        bottom: 22,
        right: 0,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    chatInfo: {
        flex: 1,
    },
    userName: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastMessage: {
        color: '#8E8E93',
        fontSize: 14,
    },
    timeStamp: {
        color: '#8E8E93',
        fontSize: 12,
    },
    offlineText: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: 10,
        textAlign: 'center',
    },
});
