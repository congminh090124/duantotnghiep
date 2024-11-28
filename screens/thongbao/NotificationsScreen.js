import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';

// Custom Components and Services
import NotificationItem from './NotificationItem';
import { 
  subscribeToNotifications, 
  fetchNotifications,
  markNotificationAsRead, 
  deleteNotification 
} from './notificationService';
import { showErrorMessage, showNotificationMessage } from './FlashMessenger';

// Constants
const EMPTY_STATE_ICON_SIZE = 64;
const LOADER_COLOR = '#2196F3';

const NotificationsScreen = () => {
  // State Management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  // Hooks
  const navigation = useNavigation();

  // Fetch User ID on Component Mount
  useEffect(() => {
    const retrieveUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userID');
        if (storedUserId) {
          setUserId(storedUserId);
        } else {
          showErrorMessage('Lỗi', 'Không tìm thấy thông tin người dùng');
        }
      } catch (error) {
        showErrorMessage('Lỗi', 'Không thể truy xuất thông tin người dùng');
        console.error('User ID Retrieval Error:', error);
      }
    };

    retrieveUserId();
  }, []);

  // Notifications Subscription
  useEffect(() => {
    let unsubscribe;
    if (userId) {
      unsubscribe = subscribeToNotifications(userId, (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      });
    }
    return () => unsubscribe && unsubscribe();
  }, [userId]);

  // Push Notifications Setup
  useEffect(() => {
    const configureNotifications = async () => {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            showErrorMessage('Thông báo', 'Không thể nhận thông báo');
          }
        }
      } catch (error) {
        console.error('Notification Permission Error:', error);
      }
    };

    configureNotifications();
  }, []);

  // Refresh Handler
  const handleRefresh = useCallback(async () => {
    if (!userId) return;

    setRefreshing(true);
    try {
      const refreshedNotifications = await fetchNotifications(userId);
      setNotifications(refreshedNotifications);
    } catch (error) {
      showErrorMessage('Lỗi', 'Không thể làm mới thông báo');
      console.error('Refresh Notifications Error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userId]);

  // Notification Press Handler
  const handleNotificationPress = async (notification) => {
    try {
      // Mark as read
      if (!notification.read && userId) {
        await markNotificationAsRead(userId, notification.id);
      }

      // Navigation based on notification type
      const navigationMap = {
        'like': 'PostDetailScreen',
        'comment': 'PostDetailScreen',
        'likeTravel': 'TravelPostDetail',
        'follow': 'UserProfile',
        'new_post': 'PostDetailScreen',
        'mention': 'PostDetailScreen',
        'request': 'UserProfile'
      };

      const screenName = navigationMap[notification.type];
      const paramKey = screenName === 'UserProfile' ? 'userId' : 'postId';
      
      if (screenName) {
        navigation.navigate(screenName, {
          [paramKey]: notification.type === 'follow' || notification.type === 'request' 
            ? notification.sender 
            : notification.post
        });
      }
    } catch (error) {
      console.error('Notification Press Error:', error);
    }
  };

  // Delete Notification Handler
  const handleDeleteNotification = async (notificationId) => {
    if (!userId) return;
    
    try {
      await deleteNotification(userId, notificationId);
    } catch (error) {
      showErrorMessage('Lỗi', 'Không thể xóa thông báo');
      console.error('Delete Notification Error:', error);
    }
  };

  // Thêm useEffect để xử lý thông báo mới
  useEffect(() => {
    if (userId) {
      const handleNewNotification = (updatedNotifications, previousNotifications) => {
        // Tìm thông báo mới bằng cách so sánh với danh sách cũ
        const newNotifications = updatedNotifications.filter(notification => {
          return !previousNotifications.some(prevNotif => prevNotif.id === notification.id);
        });

        // Hiển thị flash message cho mỗi thông báo mới
        newNotifications.forEach(notification => {
          showNotificationMessage({
            type: notification.type,
            senderName: notification.senderName,
            senderAvatar: notification.senderAvatar,
            content: notification.content,
            createdAt: notification.createdAt,
            onPress: () => handleNotificationPress(notification)
          });
        });
      };

      let previousNotifications = notifications;
      const unsubscribe = subscribeToNotifications(userId, (updatedNotifications) => {
        handleNewNotification(updatedNotifications, previousNotifications);
        previousNotifications = updatedNotifications;
        setNotifications(updatedNotifications);
        setLoading(false);
      });

      return () => unsubscribe && unsubscribe();
    }
  }, [userId]);

  // Render Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={LOADER_COLOR} />
      </SafeAreaView>
    );
  }

  // Render Empty State
  if (!notifications.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Ionicons 
            name="notifications-off-outline" 
            size={EMPTY_STATE_ICON_SIZE} 
            color="#999" 
          />
          <Text style={styles.emptyStateText}>
            Chưa có thông báo nào
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main Render
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onDelete={() => handleDeleteNotification(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[LOADER_COLOR]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;