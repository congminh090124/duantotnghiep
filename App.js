// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './navigation/BottomTabs'; // Import BottomTabs

// Import các màn hình khác
import QuenMatKhauScreen from './screens/auth/QuenMatKhauScreen';
import XacMinhOtpScreen from './screens/auth/XacMinhOtpScreen';
import DangKiDulichScreen from './screens/DangKiDuLichScreen';
import DangBaiScreen from './screens/DangBaiScreen';
import DangKy from './screens/auth/Dangky';
import DangNhap from './screens/auth/DangNhap';
import DoiMk from './screens/auth/DoiMk';
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
import IdentityVerification from './screens/auth/xacMinhDanhTinh';
import VerifyIDScreen from './screens/auth/VerifyIDScreen';
import ConfirmCCCDScreen from './screens/auth/ConfirmCCCDScreen';
import MapScreen from './screens/map';
import CreatePost from './screens/createPostMap';
import LocationSearch from './screens/LocationSearch';
import UserProfileScreen from './screens/ThongTinCaNhan';
import MyProfile from './screens/profile/MyProfile';
import Follower from './screens/profile/Follower';
import UserListScreen from './screens/chat/UserListScreen';
import Chat from './screens/chat/Chat';
const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DangNhap">
        {/* Khai báo các màn hình trong Stack Navigator */}   
        <Stack.Screen name="ThongBao" component={ThongBao} options={{ headerShown: false }} />
        <Stack.Screen name="Follower" component={Follower} options={{ headerShown: false }} />
        <Stack.Screen name="MyProfile" component={MyProfile} options={{ headerShown: false }} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IdentityVerification" component={IdentityVerification} options={{ headerShown: false }} />
        <Stack.Screen name="MapScreen" component={MapScreen} options={{ headerShown: false }} />
        <Stack.Screen name="LocationSearch" component={LocationSearch} options={{ headerShown: false }} />
        <Stack.Screen name="CreatePost" component={CreatePost} options={{ headerShown: false }} />
        <Stack.Screen name="ConfirmCCCDScreen" component={ConfirmCCCDScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyIDScreen" component={VerifyIDScreen} options={{ headerShown: false }} />
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
        <Stack.Screen name="UserListScreen" component={UserListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        {/* Sử dụng BottomTabs làm màn hình chính của TrangChu */}
        <Stack.Screen name="TrangChu" component={BottomTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
