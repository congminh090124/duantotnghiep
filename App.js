import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity } from 'react-native';

import AddOptionsModal from './screens/modal/AddOptionsModal';
// Import các màn hình
import QuenMatKhauScreen from './screens/auth/QuenMatKhauScreen';
import XacMinhOtpScreen from './screens/auth/XacMinhOtpScreen';
import DangKiDulichScreen from './screens/DangKiDuLichScreen';
import DangBaiScreen from './screens/DangBaiScreen';
import DangKy from './screens/auth/Dangky';
import DangNhap from './screens/auth/DangNhap';
import DoiMk from './screens/auth/DoiMk';
import TimKiemBanDuLich from './screens/TimKiemBanDuLich';
import ThongTinCaNhan from './screens/ThongTinCaNhan';
import TimKiem from './screens/TimKiem';
import Blog from './screens/blog/Blog';
import ThongBao from './screens/ThongBao';
import DangKiTinhNguyenVienScreen from './screens/DangKiTinhNguyenVienScreen';
import DKTinhNguyenVien from './screens/DKTinhNguyenVien';
import NhanTin from './screens/NhanTin';

import TrangHomeDangTus from './screens/TrangHomeDangTus';
import TrangTimBanDuLich from './screens/TrangTimBanDuLich';
import IdentityVerification from './screens/auth/xacMinhDanhTinh';
import VerifyIDScreen from './screens/auth/quetCCCD';
import ConfirmCCCDScreen from './screens/auth/ConfirmCCCDScreen';
import MapScreen from './screens/map';
import CreatePost from './screens/blog/createPostMap';
import LocationSearch from './screens/LocationSearch';
import UserProfileScreen from './screens/ThongTinCaNhan';
import MyProfile from './screens/profile/MyProfile';
import Follower from './screens/profile/Follower';
import UpdateProfile from './screens/profile/udateProfile';
import PostDetailScreen from './screens/blog//PostDetailScreen';
import UserListScreen from './screens/chat/UserListScreen';
import ChatScreen from './screens/chat/ChatScreen';


// Tạo Stack Navigator
const Stack = createStackNavigator();

// Tạo Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Tạo các màn hình trong Bottom Tab
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

            if (route.name === 'Home') {
              iconPath = require('./assets/home.png');
            } else if (route.name === 'Search') {
              iconPath = require('./assets/search.png');
            } else if (route.name === 'Notifications') {
              iconPath = require('./assets/notifications.png');
            } else if (route.name === 'Profile') {
              iconPath = require('./assets/profile.png');
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
                <Image source={require('./assets/add.png')} style={{ width: 30, height: 30 }} />
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

// EmptyComponent chỉ để giữ chỗ cho tab "Add"
const EmptyComponent = () => null;

// Tích hợp Stack Navigator và Bottom Tab Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DangNhap">
        {/* Các màn hình trong Stack Navigator */}
        <Stack.Screen name="UserListScreen" component={UserListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UpdateProfile" component={UpdateProfile} options={{ headerShown: false }} />
        <Stack.Screen name="Follower" component={Follower} options={{ headerShown: false }} />
        <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IdentityVerification" component={IdentityVerification} options={{ headerShown: false }} />
        <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LocationSearch" component={LocationSearch} options={{ headerShown: false }} />
        <Stack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: false }} />
        <Stack.Screen name="ConfirmCCCDScreen" component={ConfirmCCCDScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyIDScreen" component={VerifyIDScreen} options={{ headerShown: false }} />
        <Stack.Screen name="QuenMatKhau" component={QuenMatKhauScreen} options={{ headerShown: false }} />
        <Stack.Screen name="XacMinhOTP" component={XacMinhOtpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DangBai" component={DangBaiScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DangKy" component={DangKy} options={{ headerShown: false }} />
        <Stack.Screen name="DangNhap" component={DangNhap} options={{ headerShown: false }} />
        <Stack.Screen name="DoiMK" component={DoiMk} options={{ headerShown: false }} />
        <Stack.Screen name="TimKiemBanDuLich" component={TimKiemBanDuLich} options={{ headerShown: false }} />
        <Stack.Screen name="ThongTinCaNhan" component={ThongTinCaNhan} options={{ headerShown: false }} />
        <Stack.Screen name="Blog" component={Blog} options={{ headerShown: false }} />
        <Stack.Screen name="DangKiTinhNguyenVienScreen" component={DangKiTinhNguyenVienScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DKTinhNguyenVien" component={DKTinhNguyenVien} options={{ headerShown: false }} />
        <Stack.Screen name="NhanTin" component={NhanTin} options={{ headerShown: false }} />
        <Stack.Screen name="DangKiDulichScreen" component={DangKiDulichScreen} options={{ headerShown: false }} />
        {/* Thay thế TrangChu bằng BottomTabs */}
        <Stack.Screen name="TrangChu" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="TrangHomeDangTus" component={TrangHomeDangTus} options={{ headerShown: false }} />
        <Stack.Screen name="TrangTimBanDuLich" component={TrangTimBanDuLich} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;