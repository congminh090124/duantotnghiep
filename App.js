import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

import UserListScreen from './screens/chat/UserListScreen';
import ChatScreen from './screens/chat/ChatScreen';
import VideoCallScreen from './screens/chat/VideoCallScreen';


import Settings from './screens/menuProfile/setting';
import ChangePassword from './screens/menuProfile/ChangePassword';
import PostManager from './screens/menuProfile/Post-manager';
import Map from './screens/menuProfile/map';
import EditPost from './screens/menuProfile/EditPost';
import EditTravelPost from './screens/menuProfile/EditTravelPost';



import DangKiTinhNguyenVienScreen from './screens/DangKiTinhNguyenVienScreen';
import DKTinhNguyenVien from './screens/DKTinhNguyenVien';

// Create navigator
const Stack = createStackNavigator();

// Main App component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="VideoCallScreen">
        {/* Auth Screens */}
        <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DangNhap" component={DangNhap} options={{ headerShown: false }} />
        <Stack.Screen name="DangKy" component={DangKy} options={{ headerShown: false }} />
        <Stack.Screen name="QuenMatKhau" component={QuenMatKhauScreen} options={{ headerShown: false }} />
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
        <Stack.Screen name="Map" component={Map} options={{ headerShown: false }} />
        <Stack.Screen name="EditPost" component={EditPost} options={{ headerShown: false }} />
        <Stack.Screen name="EditTravelPost" component={EditTravelPost} options={{ headerShown: false }} />
        
        {/* Other Screens */}
        <Stack.Screen name="DangKiTinhNguyenVienScreen" component={DangKiTinhNguyenVienScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DKTinhNguyenVien" component={DKTinhNguyenVien} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;