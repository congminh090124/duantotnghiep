import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar,ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Ionicons';

const socket = io('https://enhanced-remotely-bobcat.ngrok-free.app');

export default function ChatScreen({ route, navigation }) {
  const { receiverId, receiverName, receiverUsername, receiverAvatar } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userID');
        if (storedUserId) {
          setUserId(storedUserId);
          fetchMessages(storedUserId);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    socket.on('receiveMessage', (message) => {
      if (message.senderId._id === receiverId || message.receiverId._id === receiverId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (message.receiverId._id === userId) {
          socket.emit('updateMessageStatus', { messageId: message._id, status: 'delivered' });
        }
        scrollToBottom();
      }
    });

    socket.on('messageStatusUpdated', ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageStatusUpdated');
    };
  }, [receiverId, receiverName, userId]);

  const fetchMessages = async (senderId) => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`https://enhanced-remotely-bobcat.ngrok-free.app/api/messages/${senderId}/${receiverId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data);
      setIsLoading(false);

      // Mark messages as read
      data.forEach((message) => {
        if (message.receiverId._id === senderId && message.status !== 'read') {
          socket.emit('updateMessageStatus', { messageId: message._id, status: 'read' });
        }
      });

      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(() => {
    if (inputMessage.trim() === '') return;

    const messageData = {
      senderId: userId,
      receiverId: receiverId,
      text: inputMessage.trim(),
    };

    socket.emit('sendMessage', messageData);
    setInputMessage('');
  }, [inputMessage, userId, receiverId]);

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId._id === userId;
    const messageDate = new Date(item.createdAt);
    const formattedDate = format(messageDate, 'HH:mm');

    if (item.type === 'info') {
      return <Text style={styles.infoMessage}>{item.text}</Text>;
    }

    if (item.type === 'button') {
      return (
        <TouchableOpacity style={styles.buttonMessage}>
          <Text style={styles.buttonText}>{item.text}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[
        styles.messageBubble,
        isOwnMessage ? styles.sentMessage : styles.receivedMessage
      ]}>
        {!isOwnMessage && (
          <Image source={{ uri: receiverAvatar }} style={styles.avatar} />
        )}
        <View style={isOwnMessage ? styles.sentMessageContent : styles.receivedMessageContent}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.sentMessageText : styles.receivedMessageText
          ]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderInputBar = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity>
        <Icon name="camera-outline" size={24} color="#3897F0" />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        value={inputMessage}
        onChangeText={setInputMessage}
        placeholder="Nhắn tin..."
        placeholderTextColor="#999"
      />
      {inputMessage.trim() === '' ? (
        <>
          <TouchableOpacity>
            <Icon name="mic-outline" size={24} color="#3897F0" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="image-outline" size={24} color="#3897F0" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="happy-outline" size={24} color="#3897F0" />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Image source={{ uri: receiverAvatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.headerName}>{receiverName}</Text>
            <Text style={styles.headerUsername}>{receiverUsername}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Icon name="call-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="videocam-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      {renderInputBar()}
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
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerUsername: {
    fontSize: 14,
    color: '#666',
  },
  messageList: {
    paddingVertical: 10,
  },
  infoMessage: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 5,
  },
  buttonMessage: {
    backgroundColor: '#EFEFEF',
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 5,
  },
  buttonText: {
    color: '#3897F0',
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  sentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  sentMessageContent: {
    backgroundColor: '#3897F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '70%',
  },
  receivedMessageContent: {
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '70%',
  },
  sentMessageText: {
    color: '#FFFFFF',
  },
  receivedMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  input: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 10,
    fontSize: 16,
  },
  sendButtonText: {
    color: '#3897F0',
    fontWeight: 'bold',
    fontSize: 16,
  },
});