import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../../context/SocketContext';
import { getUserProfile } from '../../apiConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = () => {
  const navigation = useNavigation();
  const [isVerified, setIsVerified] = useState(false);
  const { disconnectSocket } = useSocket();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const profileData = await getUserProfile();
      setIsVerified(profileData.xacMinhDanhTinh);
      
    } catch (error) {
     
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleIdentityVerification = () => {
    if (isVerified) {
      Alert.alert(
        'Đã xác minh',
        'Danh tính của bạn đã được xác minh.',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed')
          }
        ]
      );
    } else {
      navigation.navigate('IdentityVerification', {
        onVerificationComplete: () => {
          setIsVerified(true);
          checkVerificationStatus();
        }
      });
    }
  };

  const handleManagePosts = () => {
    navigation.navigate('PostManager');
  };

  const handleBlockedUsers = () => {
    navigation.navigate('BlockedUsers');
  };

  const handleReportHistory = () => {
    navigation.navigate('ReportHistory');
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Xác nhận đăng xuất',
        'Bạn có chắc chắn muốn đăng xuất?',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Đăng xuất',
            onPress: async () => {
              try {
                await disconnectSocket();
                
                await AsyncStorage.clear();
                
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'DangNhap' }],
                });
              } catch (error) {
               
                Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
              }
            },
            style: 'destructive'
          }
        ]
      );
    } catch (error) {
     
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  return (
   
    <View style={styles.container}>
      <Text style={styles.title}>Cài đặt</Text>

      <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
        <Ionicons name="key-outline" size={24} color="black" style={styles.icon} />
        <Text style={styles.optionText}>Đổi mật khẩu</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleIdentityVerification}>
        <Ionicons name="shield-checkmark-outline" size={24} color="black" style={styles.icon} />
        <Text style={styles.optionText}>Xác minh danh tính</Text>
        {isVerified ? (
          <Ionicons name="checkmark-circle" size={24} color="green" />
        ) : (
          <Ionicons name="chevron-forward-outline" size={24} color="gray" />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleManagePosts}>
        <Ionicons name="document-text-outline" size={24} color="black" style={styles.icon} />
        <Text style={styles.optionText}>Quản lý bài viết</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleBlockedUsers}>
        <Ionicons name="ban-outline" size={24} color="black" style={styles.icon} />
        <Text style={styles.optionText}>Danh sách chặn</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleReportHistory}>
        <Ionicons name="warning-outline" size={24} color="black" style={styles.icon} />
        <Text style={styles.optionText}>Lịch sử báo cáo</Text>
        <Ionicons name="chevron-forward-outline" size={24} color="gray" />
      </TouchableOpacity>

     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    top:"3%"
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 15,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutOption: {
    marginTop: 20,
    borderColor: 'red',
    borderWidth: 1,
  },
  logoutText: {
    color: 'red',
  },
});

export default Settings;