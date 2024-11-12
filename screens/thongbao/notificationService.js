import { ref, onValue, update, remove, query, orderByChild } from 'firebase/database';
import { database } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = ref(database, `notifications/${userId}`);
  const notificationsQuery = query(notificationsRef, orderByChild('createdAt'));

  const unsubscribe = onValue(notificationsQuery, (snapshot) => {
    const notifications = [];
    snapshot.forEach((childSnapshot) => {
      notifications.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    callback(notifications.reverse());
  });

  return unsubscribe;
};

export const markNotificationAsRead = async (userId, notificationId) => {
  const updates = {};
  updates[`notifications/${userId}/${notificationId}/read`] = true;
  return update(ref(database), updates);
};

export const deleteNotification = async (userId, notificationId) => {
  const notificationRef = ref(database, `notifications/${userId}/${notificationId}`);
  return remove(notificationRef);
};

export const getUnreadCount = async (userId) => {
  const notificationsRef = ref(database, `notifications/${userId}`);
  return new Promise((resolve) => {
    onValue(notificationsRef, (snapshot) => {
      let count = 0;
      snapshot.forEach((childSnapshot) => {
        if (!childSnapshot.val().read) {
          count++;
        }
      });
      resolve(count);
    }, { onlyOnce: true });
  });
};