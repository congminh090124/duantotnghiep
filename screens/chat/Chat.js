import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { getToken, API_ENDPOINTS } from '../../apiConfig';
import io from 'socket.io-client';

const ChatScreen = ({ route, navigation }) => {
    const { userId , username } = route.params || {};
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        navigation.setOptions({ title: username });
        
        const setupSocket = async () => {
            const token = await getToken();
            const newSocket = io(API_ENDPOINTS.baseURL, {
                query: { token }
            });
            setSocket(newSocket);

            newSocket.on('newMessage', (newMessage) => {
                if (newMessage.sender === userId || newMessage.receiver === userId) {
                    setChatHistory(prevHistory => [...prevHistory, newMessage]);
                }
            });

            return () => newSocket.close();
        };

        setupSocket();
        loadChatHistory();
    }, [userId, username, navigation]);

    const loadChatHistory = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${API_ENDPOINTS.chats}/history/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (Array.isArray(data)) {
                setChatHistory(data);
            } else {
                console.error('Invalid chat history format:', data);
                setChatHistory([]);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            alert('Failed to load chat history. Please try again.');
        }
    };

    const sendMessage = async () => {
        if (message.trim()) {
            try {
                const token = await getToken();
                const response = await fetch(`${API_ENDPOINTS.chats}/send`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        receiverId: userId,
                        content: message
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const newMessage = await response.json();

                if (typeof newMessage === 'object' && newMessage !== null) {
                    setChatHistory(prevHistory => [...prevHistory, newMessage]);
                    setMessage('');

                    if (socket) {
                        socket.emit('sendMessage', {
                            senderId: newMessage.sender,
                            receiverId: userId,
                            content: message
                        });
                    }
                } else {
                    console.error('Invalid message format received:', newMessage);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message. Please try again.');
            }
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[styles.message, item.sender === userId ? styles.sentMessage : styles.receivedMessage]}>
            <Text style={styles.messageText}>{item.content}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chatHistory}
                renderItem={renderMessage}
                keyExtractor={(item) => item._id}
                inverted
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                />
                <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                    <Text style={styles.sendButtonText}>Send</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    message: {
        padding: 10,
        borderRadius: 8,
        marginVertical: 4,
        maxWidth: '70%',
        marginHorizontal: 16,
    },
    sentMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    receivedMessage: {
        backgroundColor: '#E8E8E8',
        alignSelf: 'flex-start',
    },
    messageText: {
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    input: {
        flex: 1,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ChatScreen;