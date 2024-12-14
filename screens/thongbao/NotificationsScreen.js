import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity
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

  // Hàm xử lý điều hướng thông báo
  const handleNotificationNavigation = (notification) => {
    const navigationMap = {
      'like': { screen: 'PostDetailScreen', paramKey: 'postId', idField: 'post' },
      'comment': { screen: 'PostDetailScreen', paramKey: 'postId', idField: 'post' },
      'likeTravel': { screen: 'TravelPostDetail', paramKey: 'postId', idField: 'post' },
      'follow': { screen: 'UserProfile', paramKey: 'userId', idField: 'sender' },
      'new_post': { screen: 'PostDetailScreen', paramKey: 'postId', idField: 'post' },
      'mention': { screen: 'PostDetailScreen', paramKey: 'postId', idField: 'post' },
      'request': { screen: 'UserProfile', paramKey: 'userId', idField: 'sender' },
      'report_status_update': { screen: 'ReportDetail', paramKey: 'reportId', idField: 'reportId' }
    };

    const navConfig = navigationMap[notification.type];
    if (!navConfig) {
      if (notification.type === 'report_status_update') {
        const reportId = notification.metadata?.reportId;
        if (reportId) {
          navigation.navigate('ReportDetail', { reportId });
          return;
        }
      }
      return;
    }

    const id = notification[navConfig.idField];
    if (!id) {
      console.error('Invalid ID for navigation:', id);
      showErrorMessage('Lỗi', 'Không thể mở nội dung này');
      return;
    }

    navigation.navigate(navConfig.screen, { [navConfig.paramKey]: id });
  };

  // Xử lý khi nhấn vào thông báo
  const handleNotificationPress = async (notification) => {
    try {
      // Đánh dấu đã đọc
      if (!notification.read && userId) {
        await markNotificationAsRead(userId, notification.id);
      }

      // Điều hướng đến màn hình tương ứng
      handleNotificationNavigation(notification);
    } catch (error) {
      console.error('Notification Press Error:', error);
      showErrorMessage('Lỗi', 'Không thể xử lý thông báo');
    }
  };
  const getNotificationContent = (notification) => {
    switch (notification.type) {
     
      case 'travel_request':
        return {
          icon: 'airplane-outline',
          message: `${notification.sender.username} muốn đi du lịch cùng bạn`,
          color: '#2ecc71'
        };
      default:
        return {
          icon: 'notifications-outline',
          message: 'Bạn có thông báo mới',
          color: '#3498db'
        };
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
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
  unreadNotification: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTime: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
});

export default NotificationsScreen;