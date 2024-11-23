import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationItem from './NotificationItem';
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  deleteNotification 
} from './notificationService';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { showMessage, hideMessage } from "react-native-flash-message";

// Cấu hình thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userID');
        
        if (storedUserId) {
          setUserId(storedUserId);
          
          const unsubscribe = subscribeToNotifications(storedUserId, (updatedNotifications) => {
            if (updatedNotifications.length > notifications.length) {
              const newestNotification = updatedNotifications[0];
              
              // Format thời gian chỉ hiển thị giờ:phút
              const time = new Date(newestNotification.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });

              showMessage({
                message: newestNotification.senderName || "Thông báo",
                description: newestNotification.content,
                type: "info",
                duration: 4000,
                icon: props => (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image 
                      source={{ uri: newestNotification.senderAvatar || 'https://via.placeholder.com/40' }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: 10,
                        borderWidth: 1,
                        borderColor: 'white'
                      }}
                    />
                    <Text style={{ fontSize: 12, color: 'white', position: 'absolute', right: -50 }}>
                      {time}
                    </Text>
                  </View>
                ),
                style: {
                  marginTop: 30,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  backgroundColor: '#2196F3',
                  borderRadius: 8,
                },
                titleStyle: {
                  fontSize: 16,
                  fontWeight: "bold",
                  color: 'white',
                },
                textStyle: {
                  fontSize: 14,
                  color: 'white',
                },
                onPress: () => {
                  handleNotificationPress(newestNotification);
                },
                hideOnPress: true,
              });
            }
            setNotifications(updatedNotifications);
            setLoading(false);
          });
          return () => unsubscribe();
        }
      } catch (error) {
        console.error('Error:', error);
        showMessage({
          message: "Lỗi",
          description: "Không thể tải thông báo",
          type: "danger",
          duration: 3000,
        });
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Lắng nghe khi nhận được notification khi app đang chạy
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received notification:', notification);
    });

    // Lắng nghe khi user nhấn vào notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Thêm hàm đăng ký push notification
  async function registerForPushNotificationsAsync() {
    let token;
    
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo push token:', token);
      setExpoPushToken(token);
      
      // Lưu token vào AsyncStorage nếu cần
      await AsyncStorage.setItem('expoPushToken', token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  }

  const handleNotificationPress = async (notification) => {
    hideMessage();
    if (!notification.read && userId) {
      await markNotificationAsRead(userId, notification.id);
    }
    // Xử lý navigation hoặc action khác khi nhấn vào thông báo
  };

  const handleDelete = async (notificationId) => {
    if (!userId) return;
    try {
      await deleteNotification(userId, notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>Không tìm thấy thông tin người dùng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </View>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#999" />
          <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
            // Add refresh logic here
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NotificationsScreen;