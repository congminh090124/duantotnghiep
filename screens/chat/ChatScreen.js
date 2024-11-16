import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../../context/SocketContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const ChatScreen = ({ route, navigation }) => {
    const { receiverId, receiverName, receiverAvatar } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const { socket, userId } = useSocket();
    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        if (socket) {
            socket.emit('joinChat', { userId, receiverId });
            
            socket.on('newMessage', ({ message }) => {
                setMessages(prev => [message, ...prev]);
            });

            socket.on('userTyping', ({ userId: typingUserId }) => {
                if (typingUserId === receiverId) {
                    setIsTyping(true);
                }
            });

            socket.on('userStopTyping', ({ userId: typingUserId }) => {
                if (typingUserId === receiverId) {
                    setIsTyping(false);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('newMessage');
                socket.off('userTyping');
                socket.off('userStopTyping');
            }
        };
    }, [socket, receiverId]);

    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await axios.get(
                `${API_ENDPOINTS.socketURL}/api/chat/messages/${userId}/${receiverId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMessages(response.data.reverse());
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageData = {
                senderId: userId,
                receiverId,
                text: newMessage.trim(),
                type: 'text'
            };

            socket.emit('sendMessage', messageData);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = () => {
        socket.emit('typing', { senderId: userId, receiverId });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { senderId: userId, receiverId });
        }, 1000);
    };

    const renderMessage = ({ item }) => {
        const isMyMessage = item.senderId._id === userId;

        return (
            <View style={[
                styles.messageContainer,
                isMyMessage ? styles.myMessage : styles.theirMessage
            ]}>
                {!isMyMessage && (
                    <Image
                        source={{ uri: item.senderId.avatar || 'https://via.placeholder.com/50' }}
                        style={styles.messageAvatar}
                    />
                )}
                <View style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isMyMessage ? styles.myMessageText : styles.theirMessageText
                    ]}>
                        {item.text}
                    </Text>
                    <Text style={styles.messageTime}>
                        {moment(item.createdAt).format('h:mm A')}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerProfile}>
                    <Image
                        source={{ uri: receiverAvatar || 'https://via.placeholder.com/50' }}
                        style={styles.headerAvatar}
                    />
                    <View>
                        <Text style={styles.headerName}>{receiverName}</Text>
                        {isTyping && (
                            <Text style={styles.typingIndicator}>typing...</Text>
                        )}
                    </View>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0095F6" style={styles.loading} />
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item._id}
                    inverted
                    contentContainerStyle={styles.messagesList}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={text => {
                        setNewMessage(text);
                        handleTyping();
                    }}
                    placeholder="Type a message..."
                    multiline
                />
                <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={handleSend}
                    disabled={!newMessage.trim()}
                >
                    <Ionicons 
                        name="send" 
                        size={24} 
                        color={newMessage.trim() ? "#0095F6" : "#999"} 
                    />
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    backButton: {
        marginRight: 16,
    },
    headerProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '600',
    },
    typingIndicator: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    messagesList: {
        padding: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        maxWidth: '80%',
    },
    myMessage: {
        alignSelf: 'flex-end',
    },
    theirMessage: {
        alignSelf: 'flex-start',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
        maxWidth: '100%',
    },
    myMessageBubble: {
        backgroundColor: '#0095F6',
        borderBottomRightRadius: 4,
    },
    theirMessageBubble: {
        backgroundColor: '#F1F3F4',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        marginBottom: 4,
    },
    myMessageText: {
        color: '#FFFFFF',
    },
    theirMessageText: {
        color: '#000000',
    },
    messageTime: {
        fontSize: 11,
        color: '#666',
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#EFEFEF',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        backgroundColor: '#F1F3F4',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        maxHeight: 100,
        marginRight: 8,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;