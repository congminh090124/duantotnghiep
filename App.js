import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, Platform, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SocketProvider } from './context/SocketContext'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import FlashMessage from "react-native-flash-message";

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
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
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
          <Stack.Navigator 
            initialRouteName={isLoggedIn ? "TrangChu" : "DangNhap"}
            screenOptions={{
              headerShown: false
            }}
          >
            {/* Auth Screens - Each screen with explicit key */}
            <Stack.Screen 
              key="dangNhap"
              name="DangNhap" 
              component={DangNhap} 
            />
            <Stack.Screen 
              key="dangKy"
              name="DangKy" 
              component={DangKy} 
            />
            <Stack.Screen 
              key="quenMatKhau"
              name="QuenMatKhauScreen" 
              component={QuenMatKhauScreen} 
            />
            <Stack.Screen 
              key="xacMinhOTP"
              name="XacMinhOTP" 
              component={XacMinhOtpScreen} 
            />
            <Stack.Screen 
              key="identityVerification"
              name="IdentityVerification" 
              component={IdentityVerification} 
            />
            <Stack.Screen 
              key="verifyIDScreen"
              name="VerifyIDScreen" 
              component={VerifyIDScreen} 
            />
            <Stack.Screen 
              key="confirmCCCDScreen"
              name="ConfirmCCCDScreen" 
              component={ConfirmCCCDScreen} 
            />

            {/* Main Screens */}
            <Stack.Screen 
              key="mapScreen"
              name="MapScreen" 
              component={MapScreen} 
            />
            <Stack.Screen 
              key="trangChu"
              name="TrangChu" 
              component={BottomTabs} 
            />
            <Stack.Screen 
              key="blog"
              name="Blog" 
              component={Blog} 
            />
            <Stack.Screen 
              key="createPost"
              name="CreatePost" 
              component={CreatePost} 
            />
            <Stack.Screen 
              key="postDetailScreen"
              name="PostDetailScreen" 
              component={PostDetailScreen} 
            />
            <Stack.Screen 
              key="taoTrangTimBanDuLich"
              name="TaoTrangTimBanDuLich" 
              component={TaoTrangTimBanDuLich} 
            />

            {/* Travel Screens */}
            <Stack.Screen 
              key="travelPostDetail"
              name="TravelPostDetail" 
              component={TravelPostDetail} 
            />
            <Stack.Screen 
              key="travelSearch"
              name="TravelSearch" 
              component={TravelSearch} 
            />

            {/* Profile Screens */}
            <Stack.Screen 
              key="updateProfile"
              name="UpdateProfile" 
              component={UpdateProfile} 
            />
            <Stack.Screen 
              key="follower"
              name="Follower" 
              component={Follower} 
            />
            <Stack.Screen 
              key="following"
              name="Following" 
              component={Following} 
            />
            <Stack.Screen 
              key="userProfile"
              name="UserProfile" 
              component={UserProfile} 
            />
            <Stack.Screen 
              key="profileMapScreen"
              name="ProfileMapScreen" 
              component={ProfileMapScreen} 
            />

            {/* Chat Screens */}
            <Stack.Screen 
              key="userListScreen"
              name="UserListScreen" 
              component={UserListScreen} 
            />
            <Stack.Screen 
              key="chatScreen"
              name="ChatScreen" 
              component={ChatScreen} 
            />

            {/* Settings Screens */}
            <Stack.Screen 
              key="settings"
              name="Settings" 
              component={Settings} 
            />
            <Stack.Screen 
              key="changePassword"
              name="ChangePassword" 
              component={ChangePassword} 
            />
            <Stack.Screen 
              key="postManager"
              name="PostManager" 
              component={PostManager} 
            />
            <Stack.Screen 
              key="editPost"
              name="EditPost" 
              component={EditPost} 
            />
            <Stack.Screen 
              key="editTravelPost"
              name="EditTravelPost" 
              component={EditTravelPost} 
            />
            <Stack.Screen 
              key="blockedUsers"
              name="BlockedUsers" 
              component={BlockedUsers} 
            />

            {/* Other Screens */}
            <Stack.Screen 
              key="dangKiTinhNguyenVien"
              name="DangKiTinhNguyenVienScreen" 
              component={DangKiTinhNguyenVienScreen} 
            />
            <Stack.Screen 
              key="dkTinhNguyenVien"
              name="DKTinhNguyenVien" 
              component={DKTinhNguyenVien} 
            />
          </Stack.Navigator>
          
          {/* Chỉ giữ lại một FlashMessage component ở đây với cấu hình đầy đủ */}
          <FlashMessage
            position="top"
            floating={true}
            statusBarHeight={Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10}
            style={styles.flashMessage}
            titleStyle={{
              fontSize: 16,
              fontWeight: '600',
              color: '#FFFFFF',
            }}
            textStyle={{
              fontSize: 14,
              color: '#FFFFFF',
            }}
            duration={3000}
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
  flashMessage: {
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});

export default App;