import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
  

import DangKiDulichScreen from './DangKiDuLichScreen';
import DangKiTinhNguyenVienScreen from './DangKiTinhNguyenVienScreen';


const Tab = createMaterialTopTabNavigator();

export default function TrangChuScreen() {
    return (
     
        
        <Tab.Navigator 
        screenOptions={{
          tabBarLabelStyle: { 
            fontSize: 13, 
            textTransform: 'none',  // Giữ nguyên chữ không viết hoa
            fontWeight: 'bold',
          },
          tabBarStyle: { 
            backgroundColor: '#fff', // Màu nền trong suốt
            marginTop:'6%',
            elevation: 0, // Xóa shadow cho tab bar
          },
          tabBarIndicatorStyle: { 
            backgroundColor: 'black', // Màu của đường underline dưới tab đang chọn
            height: 2, // Độ dày của đường underline
            width: '20%', // Chiều rộng của đường gạch dưới
            marginLeft: '2%', // Canh giữa so với tab
          },
          tabBarActiveTintColor: 'black', // Màu chữ khi tab được chọn
          tabBarInactiveTintColor: 'gray', // Màu chữ khi tab không được chọn
          tabBarPressColor: 'transparent', // Khi nhấn vào tab
        }}
        style={{ backgroundColor:'#fff' }} // Canh trên nếu cần
      >
        <Tab.Screen name="Bạn bè" component={DangKiDulichScreen} />
        <Tab.Screen name="Khám phá" component={DangKiDulichScreen} />
        <Tab.Screen name="Đã follow" component={DangKiDulichScreen} />
        <Tab.Screen name="Đề xuất" component={DangKiTinhNguyenVienScreen} />
      </Tab.Navigator >
      
    );
  }