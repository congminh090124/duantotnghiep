import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'https://enhanced-remotely-bobcat.ngrok-free.app'; // Thay thế bằng URL server của bạn

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Khởi tạo socket connection
  useEffect(() => {
    initializeSocket();
    loadNotifications();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = async () => {
    try {
      // Lấy userToken và userData từ AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!userDataString || !token) {
        console.log('No userData or token found');
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData.id; // hoặc userData._id

      console.log('Loaded userData:', userData); // Debug
      console.log('Loaded userId:', userId);
      console.log('Loaded token:', token);

      if (!userId) {
        console.log('Missing userId in userData');
        return;
      }

      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: { token } // Sử dụng userToken
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        if (userId) {
          newSocket.emit('userConnected', userId);
        }
      });

      newSocket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        Alert.alert('Thông báo mới', notification.content);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  };

  // Load notifications từ server
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!userDataString || !token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData.id; // hoặc userData._id

      console.log('Loading notifications for user:', userData);

      if (!userId) {
        Alert.alert('Lỗi', 'Thông tin người dùng không hợp lệ');
        return;
      }

      const response = await fetch(`${SOCKET_URL}/api/notification/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Loaded notifications:', data);
      setNotifications(data);
      filterNotifications(data, activeTab);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị toast message
  const showToast = (message) => {
    Alert.alert(
      "Thông báo mới",
      message,
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );
  };

  // Xử lý đánh dấu đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`${SOCKET_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Xử lý xóa thông báo
  const handleDelete = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      const response = await fetch(`${SOCKET_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Lọc thông báo theo tab
  const filterNotifications = (notifs, tab) => {
    let filtered = notifs;
    switch (tab) {
      case 'unread':
        filtered = notifs.filter(n => !n.read);
        break;
      case 'mentions':
        filtered = notifs.filter(n => n.type === 'mention');
        break;
      case 'requests':
        filtered = notifs.filter(n => n.type === 'request');
        break;
    }
    
    // Áp dụng search filter nếu có
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredNotifications(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleMarkAsRead(item._id)}
    >
      <Image source={{ uri: item.sender?.avatar || item.image }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.content}</Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id)}>
        <Image source={require('../assets/delete.png')} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Thông báo</Text>
      </View>

      <View style={styles.searchContainer}>
        <Image source={require('../assets/search.png')} style={{ width: 24, height: 24 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thông báo"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            filterNotifications(notifications, activeTab);
          }}
        />
      </View>

      <View style={styles.tabsContainer}>
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'unread', label: 'Chưa đọc' },
          { id: 'mentions', label: 'Đề cập' },
          { id: 'requests', label: 'Yêu cầu' }
        ].map(tab => (
          <TouchableOpacity 
            key={tab.id}
            onPress={() => {
              setActiveTab(tab.id);
              filterNotifications(notifications, tab.id);
            }}
          >
            <Text style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        refreshing={isLoading}
        onRefresh={loadNotifications}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>
            {isLoading ? 'Đang tải...' : 'Không có thông báo'}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: "10%",
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  tab: {
    fontSize: 16,
    color: 'gray',
  },
  list: {
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: 'gray',
  },
  unreadItem: {
    backgroundColor: '#e6f3ff',
  },
  activeTab: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});
