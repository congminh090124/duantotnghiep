import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NhanTinScreen from '../screens/NhanTinScreen';
import DangBaiScreen from '../screens/DangBaiScreen';

const Tab = createBottomTabNavigator();

const BottomNavigationScreen = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Dangbai" component={DangBaiScreen} />
            <Tab.Screen name="NhanTin" component={NhanTinScreen} />
        </Tab.Navigator>
    );
};

export default BottomNavigationScreen;
