import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

// Import các màn hình
import QuenMatKhauScreen from './screens/QuenMatKhauScreen';
import XacMinhOtpScreen from './screens/XacMinhOtpScreen';
import DangKiDulichScreen from './screens/DangKiDuLichScreen';
import DangBaiScreen from './screens/DangBaiScreen';
import DangKy from './screens/Dangky';
import DangNhap from './screens/DangNhap';
import DoiMk from './screens/DoiMk';
import TimKiemBanDuLich from './screens/TimKiemBanDuLich';
import ThongTinCaNhan from './screens/ThongTinCaNhan';
import TimKiem from './screens/TimKiem';
import Blog from './screens/Blog';
import ThongBao from './screens/ThongBao';
import DangKiTinhNguyenVienScreen from './screens/DangKiTinhNguyenVienScreen';
import DKTinhNguyenVien from './screens/DKTinhNguyenVien';
import NhanTin from './screens/NhanTin';
import TrangChuScreen from './screens/TrangChuScreen';
import TrangHomeDangTus from './screens/TrangHomeDangTus';
import TrangTimBanDuLich from './screens/TrangTimBanDuLich';
// Tạo Stack Navigator
const Stack = createStackNavigator();

// Tạo Bottom Tab Navigator
const Tab = createBottomTabNavigator();

// Tạo các màn hình trong Bottom Tab
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ size }) => {
          let iconPath;

          if (route.name === 'Home') {
            iconPath = require('./assets/home.png');
          } 
          else if (route.name === 'Search') {
            iconPath = require('./assets/search.png');
          } 
          else if (route.name === 'Add') {
            iconPath = require('./assets/add.png');
          } 
          else if (route.name === 'Notifications') {
            iconPath = require('./assets/notifications.png');
          }
           else if (route.name === 'Profile') {
            iconPath = require('./assets/profile.png');
          }

          return <Image source={iconPath} style={{ width: size, height: size }} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* Thêm TrangChuScreen vào Bottom Tab */}
      <Tab.Screen name="Home" component={TrangChuScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={TimKiem} />
      <Tab.Screen name="Add" component={DangBaiScreen} />
      <Tab.Screen name="Notifications" component={ThongBao} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={NhanTin} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Tích hợp Stack Navigator và Bottom Tab Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DangKiTinhNguyenVienScreen">
        {/* Các màn hình trong Stack Navigator */}
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