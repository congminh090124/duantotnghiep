import { createNavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeToNotifications } from '../screens/thongbao/notificationService';
import { showNotificationMessage } from '../screens/thongbao/FlashMessenger';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Thêm hàm xử lý notification navigation
export function handleNotificationNavigation(notification) {
  if (!navigationRef.isReady()) return;

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
  const idToNavigate = notification.type === 'follow' || notification.type === 'request' 
    ? notification.sender 
    : notification.post;

  if (screenName && idToNavigate) {
    navigate(screenName, { [paramKey]: idToNavigate });
  }
}

// Thêm hàm khởi tạo notification listener
export async function initializeNotificationListener() {
  try {
    const userId = await AsyncStorage.getItem('userID');
    if (!userId) return;

    let previousNotifications = [];
    
    return subscribeToNotifications(userId, (updatedNotifications) => {
      // Tìm thông báo mới
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
          postId: notification.postId,
          senderId: notification.senderId,
          onPress: () => handleNotificationNavigation(notification)
        });
      });

      previousNotifications = updatedNotifications;
    });
  } catch (error) {
    console.error('Error initializing notification listener:', error);
  }
}