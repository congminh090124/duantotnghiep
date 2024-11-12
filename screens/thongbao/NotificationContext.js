// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { getUnreadCount } from './notificationService';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const NotificationContext = createContext();

// export const NotificationProvider = ({ children }) => {
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const getUserId = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem('userID');
//         if (storedUserId) {
//           setUserId(storedUserId);
//           const count = await getUnreadCount(storedUserId);
//           setUnreadCount(count);
//         }
//       } catch (error) {
//         console.error('Error getting userID:', error);
//       }
//     };
//     getUserId();
//   }, []);

//   const updateUnreadCount = async () => {
//     if (userId) {
//       const count = await getUnreadCount(userId);
//       setUnreadCount(count);
//     }
//   };

//   return (
//     <NotificationContext.Provider value={{ unreadCount, updateUnreadCount }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);