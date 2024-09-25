import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Thư viện icon
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';

import DangKiDulichScreen from './DangKiDuLichScreen';
import DangKiTinhNguyenVienScreen from './DangKiTinhNguyenVienScreen';
import TrangTimBanDuLich from './TrangTimBanDuLich';
import DangBaiScreen from './DangBaiScreen';

const Tab = createMaterialTopTabNavigator();

export default function TrangChuScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: '#fff', // Màu nền trong suốt
          marginTop: '10%',
          elevation: 0, // Xóa shadow cho tab bar
        },
        tabBarIndicatorStyle: {
          backgroundColor: 'black', // Màu của đường underline dưới tab đang chọn
          height: 2, // Độ dày của đường underline
          width: '22%', // Chiều rộng của đường gạch dưới
          marginLeft: '6%', // Canh giữa so với tab
          marginBottom: '15%', // Canh dưới nếu cần
        },
        tabBarActiveTintColor: 'black', // Màu chữ khi tab được chọn
        tabBarInactiveTintColor: 'gray', // Màu chữ khi tab không được chọn
        tabBarPressColor: 'transparent', // Khi nhấn vào tab
      }}
    >
      <Tab.Screen
        name="Trang chủ"
        component={TrangTimBanDuLich}
      />
      <Tab.Screen
        name="Blog"
        component={DangBaiScreen}
      />
      <Tab.Screen
        name="Messages"
        component={DangKiDulichScreen}
        options={{
          headerShown: false,
          tabBarLabel: '', // Xóa tên tab
          tabBarIcon: ({ size }) => (
            <Image source={require('../assets/messages.png')} style={{ width: 20, height: 20 ,bottom:-15}} />
          )
        }}
      />

    </Tab.Navigator>
  );
}
