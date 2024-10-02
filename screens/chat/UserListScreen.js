import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, SafeAreaView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/Ionicons';

const socket = io('https://enhanced-remotely-bobcat.ngrok-free.app');

export default function ListScreen({ navigation }) {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [userId, setUserId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

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

        socket.on('updateOnlineUsers', async (users) => {
            const filteredUsers = users.filter(user => user.id !== userId);
            const token = await AsyncStorage.getItem('userToken');
            const response = await fetch('https://enhanced-remotely-bobcat.ngrok-free.app/api/online-users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const onlineUsersDetails = await response.json();
            setOnlineUsers(onlineUsersDetails.filter(user => user._id !== userId));
        });

        return () => {
            socket.off('updateOnlineUsers');
        };
    }, [userId]);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const response = await fetch(`https://enhanced-remotely-bobcat.ngrok-free.app/api/chat-history/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                // Xử lý dữ liệu chat history
                const processedChatHistory = data.map(chat => ({
                    _id: chat._id,
                    username: chat.receiverId, // Tạm thời sử dụng receiverId làm username
                    avatar: 'https://via.placeholder.com/50', // Placeholder avatar
                    lastMessage: chat.text,
                    lastMessageTime: new Date(chat.createdAt).toLocaleTimeString()
                }));
                setChatHistory(processedChatHistory);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        if (userId) {
            fetchChatHistory();
        }
    }, [userId]);

    const renderOnlineUser = ({ item }) => (
        <TouchableOpacity
            style={styles.onlineUserItem}
            onPress={() => navigation.navigate('ChatScreen', { receiverId: item._id, receiverName: item.username })}
        >
            <Image source={{ uri: item.avatar }} style={styles.onlineAvatar} />
            <Text style={styles.onlineUserName}>{item.username}</Text>
            <View style={styles.onlineIndicator} />
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatScreen', { receiverId: item._id, receiverName: item.username })}
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatInfo}>
                <Text style={styles.userName}>{item.username}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || 'No messages'}
                </Text>
            </View>
            <Text style={styles.timeStamp}>{item.lastMessageTime || ''}</Text>
        </TouchableOpacity>
    );

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
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <FlatList
                ListHeaderComponent={
                    <FlatList
                        horizontal
                        data={onlineUsers}
                        renderItem={renderOnlineUser}
                        keyExtractor={(item) => item._id}
                        style={styles.onlineList}
                        showsHorizontalScrollIndicator={false}
                    />
                }
                data={chatHistory}
                renderItem={renderChatItem}
                keyExtractor={(item) => item._id}
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
});