import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';
import { showMessage } from "react-native-flash-message";

const handlePress = (notification) => {
  if (notification.onPress) {
    notification.onPress();
  }
};

export const showNotificationMessage = (notification) => {
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
      handlePress(notification);
    },
  });
};

export const showPostNotification = (postData) => {
  showNotificationMessage({
    type: 'new_post',
    senderName: postData.authorName,
    senderAvatar: postData.authorAvatar,
    createdAt: new Date(),
    senderId: postData.authorId,
    post: postData._id,
    onPress: () => {
      handlePress({
        type: 'new_post',
        post: postData._id
      });
    }
  });
};

export const showLikeNotification = (likeData) => {
  showNotificationMessage({
    type: 'like',
    senderName: likeData.userName,
    senderAvatar: likeData.userAvatar,
    createdAt: new Date(),
    senderId: likeData.userId,
    onPress: () => {
      handlePress({
        type: 'like',
        senderId: likeData.userId,
        senderName: likeData.userName,
        senderAvatar: likeData.userAvatar
      });
    }
  });
};

export const showCommentNotification = (commentData) => {
  showNotificationMessage({
    type: 'comment',
    senderName: commentData.userName,
    senderAvatar: commentData.userAvatar,
    createdAt: new Date(),
    senderId: commentData.userId,
    content: commentData.comment,
    onPress: () => {
      handlePress({
        type: 'comment',
        senderId: commentData.userId,
        senderName: commentData.userName,
        senderAvatar: commentData.userAvatar
      });
    }
  });
};

export const showFollowNotification = (followData) => {
  showNotificationMessage({
    type: 'follow',
    senderName: followData.followerName,
    senderAvatar: followData.followerAvatar,
    createdAt: new Date(),
    senderId: followData.followerId,
    onPress: () => {
      handlePress({
        type: 'follow',
        senderId: followData.followerId,
        senderName: followData.followerName,
        senderAvatar: followData.followerAvatar
      });
    }
  });
};

export const showErrorMessage = (message, description) => {
  showMessage({
    message,
    description,
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

export const showMessageNotification = (messageData) => {
  console.log('Showing message notification:', messageData); // Debug log
  
  showNotificationMessage({
    type: 'message',
    senderName: messageData.senderName,
    senderAvatar: messageData.senderAvatar,
    createdAt: new Date(),
    senderId: messageData.senderId,
    content: messageData.content,
    conversationId: messageData.conversationId,
    onPress: () => {
      console.log('Message notification pressed'); // Debug log
      handlePress({
        type: 'message',
        senderId: messageData.senderId,
        senderName: messageData.senderName,
        senderAvatar: messageData.senderAvatar,
        conversationId: messageData.conversationId
      });
    }
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
    left: Platform.OS === 'ios' ? 300 : 270,
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