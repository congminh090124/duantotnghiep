import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Alert, Platform, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingTop: 12,
            paddingBottom: Platform.OS === 'ios' ? 25 : 12,
            backgroundColor: '#FFFFFF',
            position: 'absolute',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.06)',
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          },
          tabBarIcon: ({ focused, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Search':
                iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                break;
              case 'Add':
                iconName = 'add-circle';
                break;
              case 'Notifications':
                iconName = focused ? 'notifications' : 'notifications-outline';
                break;
              case 'Profile':
                iconName = focused ? 'person' : 'person-outline';
                break;
            }

            if (route.name === 'Add') {
              return (
                <View style={{
                  width: 50,
                  height: 50,
                  marginTop: -30,
                  borderRadius: 25,
                  backgroundColor: '#FFFFFF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                }}>
                  <Ionicons
                    name={iconName}
                    size={44}
                    color="#FF6B6B"
                    style={{
                      marginTop: Platform.OS === 'ios' ? 0 : -2,
                    }}
                  />
                </View>
              );
            }

            return (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons
                  name={iconName}
                  size={26}
                  color={focused ? '#FF6B6B' : '#9E9E9E'}
                  style={{
                    transform: [{ scale: focused ? 1.1 : 1 }],
                    opacity: focused ? 1 : 0.8,
                  }}
                />
                {focused && (
                  <View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#FF6B6B',
                    marginTop: 4,
                  }}/>
                )}
              </View>
            );
          },
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