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
            tabBarLabelStyle: { fontSize: 14 },
            tabBarStyle: { backgroundColor: 'orange' },
            tabBarIndicatorStyle: { backgroundColor: 'white' },
            
          }}
          style={{marginTop: '5%'}}
        >
          <Tab.Screen name="DangKiDuLich" component={DangKiDulichScreen} />
          <Tab.Screen name="DangKiTinhNguyenVien" component={DangKiTinhNguyenVienScreen} />
        </Tab.Navigator>
      
    );
  }