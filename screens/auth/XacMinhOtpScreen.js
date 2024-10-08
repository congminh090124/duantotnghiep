import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resetPassword } from '../../apiConfig'; // Đảm bảo đường dẫn này chính xác

const XacMinhOtpScreen = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleVerifyOTP = async () => {
    if (!otp || !newPassword) {
      setError('Vui lòng nhập mã OTP và mật khẩu mới.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await resetPassword(email, otp, newPassword);
     
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại thành công.');
      navigation.navigate('DangNhap'); // Chuyển hướng đến màn hình đăng nhập
    } catch (error) {
      console.error('Error in handleVerifyOTP:', error);
      setError(error.message || 'Đã xảy ra lỗi khi xác minh OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Row container for Back button and Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Xác Minh OTP</Text>
        </View>

        <Text style={styles.description}>
          Vui lòng xác minh OPT gồm 4 ký tự được gửi đến gmail
        </Text>
        <Text style={styles.xacMinh}>Mã OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã OTP"
          keyboardType="numeric"
          value={otp}
          onChangeText={setOtp}
        />
        <Text style={styles.xacMinh}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Xác nhận'}</Text>
        </TouchableOpacity>
        <Text style={styles.textNhanOtp}>Nhận OTP  </Text>

      </View>
    </SafeAreaView>
  );


};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inner: {
    padding: 16,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    // backgroundColor:'red',
    marginTop: '10%'
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    // //   width: 24, // Kích thước hình ảnh
    //   height: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: '15%',
  },
  description: {
    fontSize: 14,
    marginVertical: 10,
    marginBottom: '10%'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: '5%',
    backgroundColor:'#EBEDED',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',

  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  xacMinh: {
    fontSize: 20,
    marginBottom: '5%',
    fontWeight: 'bold',

  },
  textValidate: {

    fontSize:10,
    color: '#5B6D72',
    marginBottom: '5%',
     

  },
  textNhanOtp:{
    textAlign: 'center',
    fontSize:12,
    color:'#5B6D72',
    marginTop: '5%',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});

export default XacMinhOtpScreen;
