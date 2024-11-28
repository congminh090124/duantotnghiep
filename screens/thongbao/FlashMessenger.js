import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { showMessage, hideMessage } from "react-native-flash-message";

export const showNotificationMessage = (notification) => {
  // Format thời gian chỉ hiển thị giờ:phút
  const time = new Date(notification.createdAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const getNotificationMessage = (type) => {
    switch (type) {
      case 'like':
        return 'đã thích bài viết của bạn';
      case 'likeTravel':
        return 'đã thích bài viết du lịch của bạn';
      case 'comment':
        return 'đã bình luận về bài viết của bạn';
      case 'follow':
        return 'đã bắt đầu theo dõi bạn';
      case 'new_post':
        return 'đã đăng một bài viết mới';
      case 'mention':
        return 'đã nhắc đến bạn trong một bài viết';
      case 'request':
        return 'đã gửi yêu cầu kết bạn';
      case 'message':
        return notification.content || 'đã gửi cho bạn một tin nhắn';
      default:
        return 'Thông báo mới';
    }
  };

  showMessage({
    message: notification.senderName || "Thông báo",
    description: getNotificationMessage(notification.type),
    type: "info",
    duration: 4000,
    icon: props => (
      <View style={styles.iconContainer}>
        <Image 
          source={{ uri: notification.senderAvatar || 'https://via.placeholder.com/40' }}
          style={styles.notificationAvatar}
        />
        <Text style={styles.timeStamp}>{time}</Text>
      </View>
    ),
    style: styles.notification,
    onPress: () => {
      // Thêm callback để xử lý khi người dùng nhấn vào thông báo
      if (notification.onPress) {
        notification.onPress(notification);
      }
    },
  });
};

export const showErrorMessage = (message, description) => {
  showMessage({
    message: message,
    description: description,
    type: "danger",
    duration: 3000,
  });
};

export const showInfoMessage = (message, description = '') => {
  showMessage({
    message,
    description,
    type: "info",
    duration: 3000,
  });
};

export const showWarningMessage = (message, description = '') => {
  showMessage({
    message,
    description,
    type: "warning",
    duration: 3000,
  });
};

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row', 
    alignItems: 'center'
  },
  notificationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'white'
  },
  timeStamp: {
    fontSize: 11,
    color: '#E8E8E8',
    position: 'absolute',
    left: 300,
    top: -3,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  notification: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});