import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserProfile } from '../apiConfig'; // Đảm bảo import này chính xác
import AddOptionsModal from '../screens/modal/AddOptionsModal';
import TopTabNavigator from '../screens/TopTabNavigator';
import UserListScreen from '../screens/chat/UserListScreen';
import NotificationsScreen from '../screens/thongbao/NotificationsScreen';
import MyProfile from '../screens/profile/MyProfile';

const Tab = createBottomTabNavigator();

// EmptyComponent for "Add" tab
const EmptyComponent = () => null;

const BottomTabs = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [xacMinhDanhTinh, setXacMinhDanhTinh] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      const profileData = await getUserProfile();
      setXacMinhDanhTinh(profileData.xacMinhDanhTinh);
      console.log('Trạng thái xác minh danh tính:', profileData.xacMinhDanhTinh);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin profile:', error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleTabPress = (event, route) => {
    if (!xacMinhDanhTinh && route.name !== 'Profile') {
      event.preventDefault();
      Alert.alert(
        "Xác minh danh tính",
        "Bạn cần xác minh danh tính để sử dụng chức năng này.",
        [
          {
            text: "Hủy",
            style: "cancel"
          },
          { 
            text: "Xác minh", 
            onPress: () => {
              navigation.navigate('IdentityVerification');
            }
          }
        ]
      );
    } else if (route.name === 'Add') {
      event.preventDefault();
      toggleModal();
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ size }) => {
            let iconPath;
            switch (route.name) {
              case 'Home':
                iconPath = require('../assets/home.png');
                break;
              case 'Search':
                iconPath = require('../assets/messenger.png');
                break;
              case 'Add':
                iconPath = require('../assets/add.png');
                break;
              case 'Notifications':
                iconPath = require('../assets/notifications.png');
                break;
              case 'Profile':
                iconPath = require('../assets/profile.png');
                break;
              default:
                iconPath = require('../assets/home.png'); // Default fallback icon
            }
            return <Image source={iconPath} style={{ width: size, height: size }} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={TopTabNavigator} 
          options={{ headerShown: false }}
          listeners={{
            tabPress: (e) => handleTabPress(e, { name: 'Home' }),
          }}
        />
        <Tab.Screen 
          name="Search" 
          component={UserListScreen} 
          options={{ headerShown: false }}
          listeners={{
            tabPress: (e) => handleTabPress(e, { name: 'Search' }),
          }}
        />
        <Tab.Screen 
          name="Add" 
          component={EmptyComponent}
          options={{ headerShown: false }}
          listeners={{
            tabPress: (e) => handleTabPress(e, { name: 'Add' }),
          }}
        />
        <Tab.Screen 
          name="Notifications" 
          component={NotificationsScreen} 
          options={{ headerShown: false }}
          listeners={{
            tabPress: (e) => handleTabPress(e, { name: 'Notifications' }),
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={MyProfile} 
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
      <AddOptionsModal isVisible={isModalVisible} onClose={toggleModal} />
    </>
  );
};

export default BottomTabs;
