import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

const socket = io('https://lacewing-evolving-generally.ngrok-free.app');

export default function ListScreen({ navigation }) {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [userId, setUserId] = useState('');

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
            const response = await fetch('https://lacewing-evolving-generally.ngrok-free.app/api/online-users', {
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
                const response = await fetch(`https://lacewing-evolving-generally.ngrok-free.app/api/chat-history/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setChatHistory(data);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        if (userId) {
            fetchChatHistory();
        }
    }, [userId]);

    const renderUserItem = ({ item, type }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => navigation.navigate('Chat', { receiverId: item._id, receiverName: item.username })}
        >
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{item.username}</Text>
            {type === 'online' && <View style={styles.onlineIndicator} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Online Users</Text>
            <FlatList
                data={onlineUsers}
                renderItem={({ item }) => renderUserItem({ item, type: 'online' })}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text>No online users</Text>}
            />

            <Text style={styles.sectionTitle}>Chat History</Text>
            <FlatList
                data={chatHistory}
                renderItem={({ item }) => renderUserItem({ item, type: 'history' })}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text>No chat history</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userName: {
        fontSize: 16,
    },
    onlineIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'green',
        marginLeft: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
});