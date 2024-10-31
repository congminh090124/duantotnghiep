import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../apiConfig';

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

  // Thêm useEffect mới để lắng nghe socket events
  useEffect(() => {
    if (socket) {
      // Lắng nghe thông báo mới
      socket.on('personalNotification', (notification) => {
        console.log('Received personal notification:', notification);
        // Cập nhật danh sách thông báo
        setNotifications(prev => {
          const newNotifications = [notification, ...prev];
          // Cập nhật filtered notifications dựa trên tab hiện tại
          filterNotifications(newNotifications, activeTab);
          return newNotifications;
        });
        
        // Hiển thị thông báo
        Alert.alert(
          'Thông báo mới',
          notification.content,
          [
            {
              text: 'Xem',
              onPress: () => handleMarkAsRead(notification._id)
            },
            {
              text: 'Đóng',
              style: 'cancel'
            }
          ]
        );
      });

      // Lắng nghe thông báo chung
      socket.on('newNotification', (notification) => {
        console.log('Received broadcast notification:', notification);
        setNotifications(prev => {
          const newNotifications = [notification, ...prev];
          filterNotifications(newNotifications, activeTab);
          return newNotifications;
        });
      });

      // Lắng nghe cập nhật thông báo
      socket.on('notificationUpdated', (updatedNotification) => {
        console.log('Notification updated:', updatedNotification);
        setNotifications(prev => {
          const updatedNotifications = prev.map(notif => 
            notif._id === updatedNotification._id ? updatedNotification : notif
          );
          filterNotifications(updatedNotifications, activeTab);
          return updatedNotifications;
        });
      });

      // Lắng nghe xóa thông báo
      socket.on('notificationDeleted', (deletedId) => {
        console.log('Notification deleted:', deletedId);
        setNotifications(prev => {
          const filteredNotifications = prev.filter(notif => notif._id !== deletedId);
          filterNotifications(filteredNotifications, activeTab);
          return filteredNotifications;
        });
      });

      return () => {
        socket.off('personalNotification');
        socket.off('newNotification');
        socket.off('notificationUpdated');
        socket.off('notificationDeleted');
      };
    }
  }, [socket, activeTab]); // Thêm activeTab vào dependencies

  const initializeSocket = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (!userDataString || !token) {
        console.log('No userData or token found');
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData.id;

      // Đóng socket cũ nếu có
      if (socket) {
        socket.disconnect();
      }

      const newSocket = io(API_ENDPOINTS.socketURL, {
        transports: ['websocket'],
        auth: { token },
        query: { userId }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        newSocket.emit('userConnected', userId);
        // Load lại thông báo khi kết nối thành công
        loadNotifications();
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server thông báo');
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Socket initialization error:', error);
      Alert.alert('Lỗi', 'Không thể khởi tạo kết nối socket');
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
      const userId = userData.id;

      console.log('Loading notifications for user:', userData);

      const response = await fetch(`${API_ENDPOINTS.socketURL}/api/notifications`, {
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

  // Xử lý đánh dấu đã đọc
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      socket?.emit('markAsRead', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Xử lý đánh dấu tất cả là đã đọc
  const handleMarkAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userDataString = await AsyncStorage.getItem('userData');
      if (!token || !userDataString) return;
      
      const userData = JSON.parse(userDataString);
      socket?.emit('markAllRead', userData.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Xử lý xóa thông báo
  const handleDelete = async (notificationId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await fetch(`${API_ENDPOINTS.socketURL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('Lỗi', 'Không thể xóa thông báo');
    }
  };

  // Lọc thông báo theo tab
  const filterNotifications = (notifs, tab) => {
    let filtered = [...notifs];
    switch (tab) {
      case 'unread':
        filtered = filtered.filter(n => !n.read);
        break;
      case 'mentions':
        filtered = filtered.filter(n => n.type === 'mention');
        break;
      case 'requests':
        filtered = filtered.filter(n => n.type === 'request');
        break;
    }
    
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
