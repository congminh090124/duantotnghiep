import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ notification, onPress, onDelete }) => {
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
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, !notification.read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: notification.senderAvatar || 'https://via.placeholder.com/48' }} 
          style={styles.avatar}
        />
        {!notification.read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {notification.senderName}
          </Text>
          <Text style={styles.time}>
            {new Date(notification.createdAt).toLocaleDateString()}
          </Text>
        </View>
        
        <Text style={styles.messageText} numberOfLines={2}>
          {getNotificationMessage(notification.type)}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  unread: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  unreadDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  time: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.1)',
  },
});

export default NotificationItem;