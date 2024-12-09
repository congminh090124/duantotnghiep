import { createNavigationContainerRef } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeToNotifications } from '../screens/thongbao/notificationService';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function handleNotificationNavigation(notification) {
  if (!navigationRef.isReady()) return;

  const navigationMap = {
    'like': 'PostDetailScreen',
    'comment': 'PostDetailScreen',
    'likeTravel': 'TravelPostDetail',
    'follow': 'UserProfile',
    'new_post': 'PostDetailScreen',
    'mention': 'PostDetailScreen',
    'request': 'UserProfile',
    'message': 'ChatScreen'  // Thêm case cho message
  };

  const screenName = navigationMap[notification.type];
  
  switch(notification.type) {
    case 'follow':
    case 'request':
      navigate(screenName, { userId: notification.senderId });
      break;
    case 'message':
      navigate(screenName, { 
        conversationId: notification.conversationId,
        userId: notification.senderId,
        userName: notification.senderName
      });
      break;
    default:
      navigate(screenName, { postId: notification.post });
      break;
  }
}