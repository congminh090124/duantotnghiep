import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS, getToken } from '../../apiConfig';
import NetInfo from "@react-native-community/netinfo";
import { debounce } from 'lodash';
import moment from 'moment';

const socket = io(API_ENDPOINTS.socketURL);

const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) return 'https://via.placeholder.com/50';
  if (publicId.startsWith('http')) return publicId;
  const baseUrl = "https://res.cloudinary.com/dois3oewd/image/upload/";
  const optionsString = Object.entries(options)
    .map(([key, value]) => `${key}_${value}`)
    .join(',');
  return `${baseUrl}${optionsString}/${publicId}`;
};

export default function ListScreen({ navigation }) {
    const [allUsers, setAllUsers] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [userId, setUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userID');
                if (storedUserId) {
                    setUserId(storedUserId);
                    socket.emit('userConnected', storedUserId);
                }
            } catch (error) {
                // Handle error silently or show an alert if necessary
            }
        };

        loadUserData();

        socket.on('updateOnlineUsers', handleUpdateOnlineUsers);

        return () => {
            socket.off('updateOnlineUsers', handleUpdateOnlineUsers);
        };
    }, []);

    const fetchAllUsers = useCallback(async () => {
        if (!isConnected) return;

        try {
            const token = await getToken();
            const response = await fetch(API_ENDPOINTS.onlineUsers, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAllUsers(data);
        } catch (error) {
            // Handle error
        }
    }, [isConnected]);

    const fetchChatHistory = useCallback(async () => {
        if (!isConnected || !userId) return;

        try {
            const token = await getToken();
            const response = await fetch(`${API_ENDPOINTS.chatHistory}/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setChatHistory(data);
        } catch (error) {
            // Handle error
        }
    }, [isConnected, userId]);

    useEffect(() => {
        fetchAllUsers();
        fetchChatHistory();
    }, [fetchAllUsers, fetchChatHistory]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([fetchAllUsers(), fetchChatHistory()]);
        setIsRefreshing(false);
    }, [fetchAllUsers, fetchChatHistory]);

    const handleSearch = useMemo(() => debounce((query) => setSearchQuery(query), 300), []);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => 
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allUsers, searchQuery]);

    const handleUpdateOnlineUsers = useCallback((onlineUserIds) => {
        setAllUsers(prevUsers => prevUsers.map(user => ({
            ...user,
            isOnline: onlineUserIds.some(onlineUser => onlineUser.id === user._id.toString())
        })));
    }, []);

    const renderUserItem = useCallback(({ item }) => {
        const avatarUrl = getCloudinaryUrl(item.avatar, { width: 60, height: 60, crop: 'fill' });
        
        return (
            <TouchableOpacity
                style={styles.onlineUserItem}
                onPress={() => {
                    navigation.navigate('ChatScreen', { receiverId: item._id, receiverName: item.username, receiverAvatar: item.avatar });
                }}
            >
                <Image source={{ uri: avatarUrl }} style={styles.onlineAvatar} />
                <Text style={styles.onlineUserName}>{item.username}</Text>
                {item.isOnline && <View style={styles.onlineIndicator} />}
            </TouchableOpacity>
        );
    }, [navigation]);

    const renderChatItem = useCallback(({ item }) => {
        const avatarUrl = getCloudinaryUrl(item.avatar, { width: 50, height: 50, crop: 'fill' });
        const lastMessageTime = moment(item.lastMessage.createdAt).format('HH:mm');
    
        return (
            <TouchableOpacity
                style={styles.chatItem}
                onPress={() => {
                    navigation.navigate('ChatScreen', { receiverId: item.id, receiverName: item.username, receiverAvatar: item.avatar });
                }}
            >
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.chatInfo}>
                    <Text style={styles.userName}>{item.username}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage.text}
                    </Text>
                </View>
                <Text style={styles.timeStamp}>{lastMessageTime}</Text>
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
                    onChangeText={handleSearch}
                />
            </View>
            {!isConnected && (
                <Text style={styles.offlineText}>You are offline. Some features may be unavailable.</Text>
            )}
            <FlatList
                ListHeaderComponent={
                    <FlatList
                        horizontal
                        data={allUsers}
                        renderItem={renderUserItem}
                        keyExtractor={(item) => item._id}
                        style={styles.onlineList}
                        showsHorizontalScrollIndicator={false}
                    />
                }
                data={chatHistory}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                    />
                }
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
        paddingVertical: 16,
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
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    lastActive: {
        color: '#8E8E93',
        fontSize: 12,
    },
    onlineIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CD964',
        position: 'absolute',
        top: 16,
        right: 16,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
});