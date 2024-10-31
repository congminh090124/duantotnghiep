import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, StatusBar, ActivityIndicator, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS, getToken } from '../../apiConfig';

const socket = io(API_ENDPOINTS.socketURL);
const windowWidth = Dimensions.get('window').width;
const imageSize = (windowWidth - 45) / 2;

export default function ChatScreen({ route, navigation }) {
  const { receiverId, receiverName, receiverAvatar } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedBy, setIsBlockedBy] = useState(false);

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

    // Listen for incoming messages
    const handleReceiveMessage = (message) => {
      if (message.senderId._id === receiverId || message.receiverId._id === receiverId) {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (message.receiverId._id === userId) {
          socket.emit('updateMessageStatus', { messageId: message._id, status: 'delivered' });
        }
        scrollToBottom();
      }
    };

    // Listen for message status updates
    const handleMessageStatusUpdated = ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('messageStatusUpdated', handleMessageStatusUpdated);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('messageStatusUpdated', handleMessageStatusUpdated);
    };
  }, [receiverId, userId]);

  const fetchMessages = async (senderId) => {
    try {
      setIsLoading(true);
      
      // Kiểm tra block status trước khi fetch messages
      const blockStatus = await checkBlockStatus();
      if (blockStatus?.isBlocked || blockStatus?.isBlockedBy) {
        setIsLoading(false);
        return;
      }

      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.messages}/${senderId}/${receiverId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data);

      // Mark messages as read
      data.forEach((message) => {
        if (message.receiverId._id === senderId && message.status !== 'read') {
          socket.emit('updateMessageStatus', { messageId: message._id, status: 'read' });
        }
      });

      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = useCallback(() => {
    if (inputMessage.trim() === '' || isBlocked || isBlockedBy) return;

    const messageData = {
      senderId: userId,
      receiverId,
      text: inputMessage.trim(),
    };

    socket.emit('sendMessage', messageData);
    setInputMessage('');
  }, [inputMessage, userId, receiverId, isBlocked, isBlockedBy]);

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.senderId._id === userId;
    const messageDate = new Date(item.createdAt);
    const formattedDate = format(messageDate, 'HH:mm');

    const avatarUrl = isOwnMessage
      ? 'https://via.placeholder.com/50'
      : receiverAvatar
      ? `${API_ENDPOINTS.socketURL}${receiverAvatar}`
      : 'https://via.placeholder.com/50';

    return (
      <View
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.sentMessage : styles.receivedMessage,
        ]}
      >
        {!isOwnMessage && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
        <View style={isOwnMessage ? styles.sentMessageContent : styles.receivedMessageContent}>
          <Text style={[styles.messageText, isOwnMessage ? styles.sentMessageText : styles.receivedMessageText]}>
            {item.text}
          </Text>
          <Text style={styles.messageTime}>{formattedDate}</Text>
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

  const handleOpenUserProfile = useCallback(() => {
    if (!receiverId) {
      Alert.alert('Lỗi', 'Không thể mở trang cá nhân người dùng.');
      return;
    }

    // Kiểm tra nếu receiverId trùng với userId (tài khoản của mình)
    if (receiverId === userId) {
      navigation.navigate('Profile'); // Điều hướng đến trang Profile của mình
    } else {
      navigation.navigate('UserProfile', { userId: receiverId }); // Điều hướng đến trang UserProfile của người khác
    }
  }, [receiverId, userId, navigation]);

  const checkBlockStatus = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.checkBlockStatus}/${receiverId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsBlocked(data.isBlocked);
      setIsBlockedBy(data.isBlockedBy);
      return data;
    } catch (error) {
      console.error('Error checking block status:', error);
      return null;
    }
  };

  const handleUnblock = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.unblockUser}/${receiverId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsBlocked(false);
      fetchMessages(userId);
    } catch (error) {
      console.error('Error unblocking user:', error);
      Alert.alert('Lỗi', 'Không thể bỏ chặn người dùng này');
    }
  };

  const BlockedMessage = () => (
    <View style={styles.blockedContainer}>
      <Icon name="ban-outline" size={50} color="#666" />
      <Text style={styles.blockedText}>
        {isBlockedBy 
          ? "Bạn đã bị người dùng này chặn"
          : "Bạn đã chặn người dùng này"}
      </Text>
      {isBlocked && (
        <TouchableOpacity 
          style={styles.unblockButton}
          onPress={handleUnblock}
        >
          <Text style={styles.unblockButtonText}>Bỏ chặn</Text>
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
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.headerInfo} 
          onPress={handleOpenUserProfile}
          disabled={!receiverId}
        >
          <View style={styles.avatarContainer}>
            {receiverAvatar ? (
              <Image
                source={{ uri: `${API_ENDPOINTS.socketURL}${receiverAvatar}` }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.headerName}>{receiverName || 'Người dùng không xác định'}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="call-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="videocam-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="ellipsis-vertical" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
      {isBlocked || isBlockedBy ? (
        <BlockedMessage />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          initialNumToRender={10} // Optimize rendering for larger lists
          removeClippedSubviews={true} // Performance optimization for large lists
        />
      )}
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
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  headerButton: {
    padding: 5,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  avatarContainer: {
    marginRight: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerStatus: {
    fontSize: 12,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockedText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 10,
  },
  unblockButton: {
    backgroundColor: '#3897F0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  unblockButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
