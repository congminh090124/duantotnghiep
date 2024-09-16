import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import QuenMatKhauScreen from './screens/QuenMatKhauScreen'; // Import your QuenMatKhauScreen component
import XacMinhOtpScreen from './screens/XacMinhOtpScreen'; // Import your QuenMatKhauScreen component
import DangKiDulichScreen from './screens/DangKiDuLichScreen'; // Import your QuenMatKhauScreen component
import DangBaiScreen from './screens/DangBaiScreen'; // Import your QuenMatKhauScreen component
import NhanTinScreen from './screens/NhanTinScreen';


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DangKiDulich">


        <Stack.Screen name="QuenMatKhau"
          component={QuenMatKhauScreen} 
          options={{ headerShown: false }}
           />
        <Stack.Screen
          name="XacMinhOTP"
          component={XacMinhOtpScreen}
          options={{ headerShown: false }} // You can set headerShown to true if you want to show the header
        /> 
         <Stack.Screen
          name="DangKiDulich"
          component={DangKiDulichScreen}
          options={{ headerShown: false }} // You can set headerShown to true if you want to show the header
        />
        
         <Stack.Screen
          name="DangBai"
          component={DangBaiScreen}
          options={{ headerShown: false }} // You can set headerShown to true if you want to show the header
        />    
         <Stack.Screen
          name="NhanTin"
          component={NhanTinScreen}
          options={{ headerShown: false }} // You can set headerShown to true if you want to show the header
        />  
         


      </Stack.Navigator>

    </NavigationContainer>
  );
};

export default App;
