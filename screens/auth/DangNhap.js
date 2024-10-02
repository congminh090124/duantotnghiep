import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, saveToken } from '../../apiConfig';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
  
    try {
      console.log('Attempting login with:', { email, password });
      const userData = { email, password };
      const response = await login(userData);
     
      
      if (response.token && response.user) {
        await saveToken(response.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
        console.log('Login successful, token saved');
        const userID = response.user.id;
        await AsyncStorage.setItem('userID', response.user.id);
        console.log('UserID:', userID);
  
        if (response.user.xacMinhDanhTinh) {
          console.log('Identity verified, navigating to TrangChu');
          navigation.navigate('TrangChu');
        } else {
          
          console.log('Identity not verified, showing alert');
          Alert.alert(
            'Xác minh danh tính',
            'Bạn cần xác minh danh tính để tiếp tục sử dụng ứng dụng.',
            [
              {
                text: 'Xác minh ngay',
                onPress: () => {
                  console.log('Navigating to IdentityVerification');
                  navigation.navigate('TrangChu');
                },
              },
              {
                text: 'Từ chối',
                onPress: () => {
                  console.log('User refused identity verification, logging out');
                  AsyncStorage.removeItem('userData');
                  AsyncStorage.removeItem('token');
                  setEmail('');
                  setPassword('');
                },
                style: 'cancel',
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        console.log('Login failed: No token or user data in response');
        Alert.alert('Lỗi', 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', `Đăng nhập không thành công: ${error.message}`);
    }
  };

  const handleRegister = () => {
    navigation.navigate('DangKy');
  };

  return (
    <ImageBackground
      source={require('../../assets/ccc.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Đăng Nhập</Text>
          <Image
            source={require('../../assets/vvv.png')}
            style={styles.headerImage}
          />
          <Text style={styles.subtitle}>Du lịch và kết bạn</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>Hoặc</Text>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require('../../assets/gg.png')}
                style={styles.logo}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={require('../../assets/fb.png')}
                style={styles.logo}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#00c3ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: 'blue',
  },
  orText: {
    marginBottom: 20,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  socialButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  logo: {
    width: 30,
    height: 30,
  },
});

export default LoginScreen;