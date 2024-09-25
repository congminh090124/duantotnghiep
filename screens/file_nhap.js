import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import DangKiDuLichScreen from './DangKiDuLichScreen';
import DangBaiScreen from './DangBaiScreen';

const Tab = createMaterialTopTabNavigator();

export default function TrangChuScreen() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarLabelStyle: {
                    fontSize: 13,
                    textTransform: 'none',
                    fontWeight: 'bold',
                },
                tabBarStyle: {
                    backgroundColor: '#fff',
                    marginTop: '6%',
                    elevation: 0,
                },
                tabBarIndicatorStyle: {
                    backgroundColor: 'black',
                    height: 2,
                    width: '20%',
                    marginLeft: '15%',
                    marginBottom: '15%',
                },
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
            }}
            style={{ backgroundColor: '#fff' }} // Canh trên nếu cần
        >
            {/* Hoán đổi thứ tự khai báo */}
            <Tab.Screen
                name="Blog"
                component={DangBaiScreen}
                options={{
                    tabBarLabel: 'Blog',
                    tabBarLabelStyle: { textAlign: 'right' }, // Căn phải cho chữ
                }}
            />
            <Tab.Screen
                name="Trang chủ"
                component={DangKiDuLichScreen}
                options={{
                    tabBarLabel: 'Trang chủ',
                    tabBarLabelStyle: { textAlign: 'left' }, // Căn trái cho chữ
                }}
            />
        </Tab.Navigator>
    );
}
//options={{
    tabBarLabel: () => (
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon style={{ marginLeft: 20, }} name="chatbubble-ellipses-outline" size={20} color="gray"  />
          <Text style={{ marginLeft: 8, fontWeight: 'bold', fontSize: 13 }}>Blog</Text>
        </TouchableOpacity>
      ),
    }}