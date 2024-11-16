import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    Image,
    Text,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { API_ENDPOINTS } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const Header = () => (
    <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="create-outline" size={24} color="#000" />
        </TouchableOpacity>
    </View>
);

const SearchBar = () => (
    <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
        />
    </View>
);

const UserListScreen = ({ navigation }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { socket, userId } = useSocket();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(
                `${API_ENDPOINTS.socketURL}/api/chat/all-users`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
        
        if (socket) {
            socket.on('onlineUsers', (onlineUsersList) => {
                setUsers(prev => prev.map(user => ({
                    ...user,
                    isOnline: onlineUsersList.includes(user._id)
                })));
            });

            socket.on('userStatusChanged', ({ userId, isOnline, lastActive }) => {
                setUsers(prev => prev.map(user => {
                    if (user._id === userId) {
                        return { ...user, isOnline, lastActive };
                    }
                    return user;
                }));
            });

            socket.emit('getOnlineUsers');
        }

        return () => {
            if (socket) {
                socket.off('onlineUsers');
                socket.off('userStatusChanged');
            }
        };
    }, [socket]);

    const renderOnlineUser = ({ item }) => {
        if (!item.isOnline) return null;
        
        return (
            <TouchableOpacity
                style={styles.onlineUserItem}
                onPress={() => navigation.navigate('ChatScreen', {
                    receiverId: item._id,
                    receiverName: item.username,
                    receiverAvatar: item.avatar
                })}
            >
                <View style={styles.onlineAvatarContainer}>
                    <Image
                        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
                        style={styles.onlineAvatar}
                    />
                    <View style={styles.onlineIndicator} />
                </View>
                <Text style={styles.onlineUserName} numberOfLines={1}>
                    {item.username}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderChatUser = ({ item }) => {
        const lastActiveText = item.lastActive 
            ? moment(item.lastActive).fromNow()
            : 'Never';

        return (
            <TouchableOpacity
                style={styles.chatUserItem}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ChatScreen', {
                    receiverId: item._id,
                    receiverName: item.username,
                    receiverAvatar: item.avatar
                })}
            >
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
                        style={styles.avatar}
                    />
                    {item.isOnline && <View style={styles.statusIndicator} />}
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.username}</Text>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {item.lastMessage || 'No messages yet'}
                    </Text>
                </View>
                <View style={styles.messageInfo}>
                    <Text style={styles.messageTime}>
                        {item.lastMessageTime ? moment(item.lastMessageTime).format('h:mm A') : ''}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0095F6" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <SearchBar />
            <FlatList
                data={users}
                renderItem={renderChatUser}
                keyExtractor={item => item._id}
                ListHeaderComponent={() => (
                    <View style={styles.onlineSection}>
                        <Text style={styles.sectionTitle}>Active Now</Text>
                        <FlatList
                            horizontal
                            data={users.filter(user => user.isOnline)}
                            renderItem={renderOnlineUser}
                            keyExtractor={item => `online-${item._id}`}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.onlineList}
                            ListEmptyComponent={() => (
                                <Text style={styles.emptyText}>No active users</Text>
                            )}
                        />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubble-outline" size={48} color="#8E8E93" />
                        <Text style={styles.emptyTitle}>No Messages</Text>
                        <Text style={styles.emptyText}>Start a conversation with your friends</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#262626',
    },
    headerAction: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 36,
        backgroundColor: '#EFEFEF',
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    onlineSection: {
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#DBDBDB',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#262626',
        marginLeft: 16,
        marginBottom: 12,
    },
    onlineList: {
        paddingHorizontal: 8,
    },
    onlineUserItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 70,
    },
    onlineAvatarContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    onlineAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#fff',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    onlineUserName: {
        fontSize: 12,
        textAlign: 'center',
        color: '#1a1a1a',
        maxWidth: 70,
    },
    chatUserItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F4',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E9ECEF',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
    },
    userInfo: {
        flex: 1,
        marginLeft: 16,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 13,
        color: '#666',
    },
    messageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    messageTime: {
        fontSize: 13,
        color: '#666',
    },
    unreadBadge: {
        backgroundColor: '#4CAF50',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginLeft: 4,
    },
    unreadCount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        padding: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
});

export default UserListScreen;