import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SocketProvider } from './context/SocketContext'; 
import FlashMessage from "react-native-flash-message";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import BottomTabs
import BottomTabs from './screens/bottomNav';

// Import screens
import QuenMatKhauScreen from './screens/auth/QuenMatKhauScreen';
import XacMinhOtpScreen from './screens/auth/XacMinhOtpScreen';
import DangKy from './screens/auth/Dangky';
import DangNhap from './screens/auth/DangNhap';
import IdentityVerification from './screens/auth/xacMinhDanhTinh';
import VerifyIDScreen from './screens/auth/quetCCCD';
import ConfirmCCCDScreen from './screens/auth/ConfirmCCCDScreen';

import Blog from './screens/blog/Blog';
import CreatePost from './screens/blog/createPostMap';
import PostDetailScreen from './screens/blog/PostDetailScreen';

import UpdateProfile from './screens/profile/udateProfile';
import Follower from './screens/profile/Follower';
import Following from './screens/profile/Following';
import UserProfile from './screens/profile/UserProfile';
import ProfileMapScreen from './screens/profile/ProfileMapScreen';

import TaoTrangTimBanDuLich from './screens/TrangChu/TaoTrangTimBanDuLich';
import MapScreen from './screens/TrangChu/MapScreen'

//travel
import TravelPostDetail from './screens/travel/TravelPostDetail'
import TravelSearch from './screens/travel/TravelSearch'


import UserListScreen from './screens/chat/UserListScreen';
import ChatScreen from './screens/chat/ChatScreen';



import Settings from './screens/menuProfile/setting';
import ChangePassword from './screens/menuProfile/ChangePassword';
import PostManager from './screens/menuProfile/Post-manager';
import EditPost from './screens/menuProfile/EditPost';
import EditTravelPost from './screens/menuProfile/EditTravelPost';
import BlockedUsers from './screens/menuProfile/BlockedUsers';



import DangKiTinhNguyenVienScreen from './screens/DangKiTinhNguyenVienScreen';
import DKTinhNguyenVien from './screens/DKTinhNguyenVien';

// Create navigator
const Stack = createStackNavigator();

// Main App component
const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // hoặc return một loading spinner
  }

  // Wrapper component để xử lý SafeAreaView theo platform
  const AppWrapper = ({ children }) => {
    if (Platform.OS === 'android') {
      return (
        <View style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent={true}
          />
          <SafeAreaView style={styles.safeArea}>
            {children}
          </SafeAreaView>
        </View>
      );
    }
    
    // Với iOS, không cần SafeAreaView
    return children;
  };

  return (
    <AppWrapper>
      <SocketProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={isLoggedIn ? "TrangChu" : "DangNhap"}>
            {/* Auth Screens */}

            <Stack.Screen name="DangNhap" component={DangNhap} options={{ headerShown: false }} />
            <Stack.Screen name="DangKy" component={DangKy} options={{ headerShown: false }} />
            <Stack.Screen name="QuenMatKhauScreen" component={QuenMatKhauScreen} options={{ headerShown: false }} />
            <Stack.Screen name="XacMinhOTP" component={XacMinhOtpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="IdentityVerification" component={IdentityVerification} options={{ headerShown: false }} />
            <Stack.Screen name="VerifyIDScreen" component={VerifyIDScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ConfirmCCCDScreen" component={ConfirmCCCDScreen} options={{ headerShown: false }} />

            {/* Main Screens */}
            <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TrangChu" component={BottomTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Blog" component={Blog} options={{ headerShown: false }} />
            <Stack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: false }} />
            <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TaoTrangTimBanDuLich" component={TaoTrangTimBanDuLich} options={{ headerShown: false }} />
         
            <Stack.Screen name="TravelPostDetail" component={TravelPostDetail} options={{ headerShown: false }} />
            <Stack.Screen name="TravelSearch" component={TravelSearch} options={{ headerShown: false }} />

            {/* Profile Screens */}
            <Stack.Screen name="UpdateProfile" component={UpdateProfile} options={{ headerShown: false }} />
            <Stack.Screen name="Follower" component={Follower} options={{ headerShown: false }} />
            <Stack.Screen name="Following" component={Following} options={{ headerShown: false }} />
            <Stack.Screen name="UserProfile" component={UserProfile} options={{ headerShown: false }} />
            <Stack.Screen name="ProfileMapScreen" component={ProfileMapScreen} options={{ headerShown: false }} />

            {/* Chat Screens */}
            <Stack.Screen name="UserListScreen" component={UserListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />

            {/* Settings Screens */}
            <Stack.Screen name="Settings" component={Settings} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
            <Stack.Screen name="PostManager" component={PostManager} options={{ headerShown: false }} />
            <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
            <Stack.Screen name="EditTravelPost" component={EditTravelPost} options={{ headerShown: false }} />
            <Stack.Screen name="BlockedUsers" component={BlockedUsers} options={{ headerShown: false }} />

            {/* Other Screens */}
            <Stack.Screen name="DangKiTinhNguyenVienScreen" component={DangKiTinhNguyenVienScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DKTinhNguyenVien" component={DKTinhNguyenVien} options={{ headerShown: false }} />
          </Stack.Navigator>
          <FlashMessage 
            position="top"
            floating={true}
            style={{
              paddingTop: Platform.OS === 'android' ? 10 : 30,
              backgroundColor: '#2196F3',
              borderRadius: 8,
              margin: 10,
            }}
            titleStyle={{
              fontSize: 16,
              fontWeight: "bold",
              color: 'white'
            }}
            textStyle={{
              fontSize: 14,
              color: 'white'
            }}
          />
        </NavigationContainer>
      </SocketProvider>
    </AppWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;