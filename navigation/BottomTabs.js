// navigation/BottomTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

// Import các màn hình cho Bottom Tab
import TrangTimBanDuLich from '../screens/TrangTimBanDuLich';
import UserChat from '../screens/chat/UserListScreen';
import DangBaiScreen from '../screens/DangBaiScreen';
import ThongBao from '../screens/ThongBao';
import MyProfile from '../screens/profile/MyProfile';

// Khởi tạo Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ size }) => {
          let iconPath;

          // Xác định icon dựa vào tên của màn hình
          if (route.name === 'Home') {
            iconPath = require('../assets/home.png');
          } else if (route.name === 'Search') {
            iconPath = require('../assets/search.png');
          } else if (route.name === 'Add') {
            iconPath = require('../assets/add.png');
          } else if (route.name === 'Notifications') {
            iconPath = require('../assets/notifications.png');
          } else if (route.name === 'Profile') {
            iconPath = require('../assets/profile.png');
          }

          // Trả về component Image chứa icon tương ứng
          return <Image source={iconPath} style={{ width: size, height: size }} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* Khai báo các màn hình trong Bottom Tab */}
      <Tab.Screen name="Home" component={TrangTimBanDuLich} options={{ headerShown: false }} />
      <Tab.Screen name="Chat" component={UserChat} />
      <Tab.Screen name="Add" component={DangBaiScreen} />
      <Tab.Screen name="Notifications" component={ThongBao} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={MyProfile} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
