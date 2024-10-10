import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity } from 'react-native';

import AddOptionsModal from '../screens/modal/AddOptionsModal';
import TrangTimBanDuLich from '../screens/Feed/TrangTimBanDuLich';
import UserListScreen from '../screens/chat/UserListScreen';
import ThongBao from '../screens/ThongBao';
import MyProfile from '../screens/profile/MyProfile';

const Tab = createBottomTabNavigator();

// EmptyComponent for "Add" tab
const EmptyComponent = () => null;

const BottomTabs = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
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
                iconPath = require('../assets/search.png');
                break;
              case 'Notifications':
                iconPath = require('../assets/notifications.png');
                break;
              case 'Profile':
                iconPath = require('../assets/profile.png');
                break;
              default:
                iconPath = require('../assets/home.png');
            }
            return <Image source={iconPath} style={{ width: size, height: size }} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={TrangTimBanDuLich} options={{ headerShown: false }} />
        <Tab.Screen name="Search" component={UserListScreen} options={{ headerShown: false }} />
        <Tab.Screen 
          name="Add" 
          component={EmptyComponent}
          options={{
            tabBarButton: (props) => (
              <TouchableOpacity {...props} onPress={toggleModal}>
                <Image source={require('../assets/add.png')} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen name="Notifications" component={ThongBao} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={MyProfile} options={{ headerShown: false }} />
      </Tab.Navigator>
      <AddOptionsModal isVisible={isModalVisible} onClose={toggleModal} />
    </>
  );
};

export default BottomTabs;