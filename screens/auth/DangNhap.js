import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ImageBackground, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, saveToken, googleSignIn, facebookSignIn } from '../../apiConfig';
import { useSocket } from '../../context/SocketContext';

import { ResponseType } from 'expo-auth-session';

// Thêm các hằng số cho Google OAuth

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { initSocket } = useSocket();

  // Thêm useEffect để kiểm tra token khi màn hình được load
  useEffect(() => {
    checkExistingToken();
  }, []);

  // Thêm hàm kiểm tra token
  const checkExistingToken = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userToken && userData) {
        await initSocket();
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
        }
      }
    } catch (error) {
     
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
  
    try {
      const userData = { email, password };
      const response = await login(userData);
      
      if (response.token && response.user) {
        await AsyncStorage.multiSet([
          ['userToken', response.token],
          ['userData', JSON.stringify(response.user)],
          ['userID', response.user.id.toString()],
          ['savedEmail', email],
          ['savedPassword', password],
          ['isLoggedIn', 'true']
        ]);
    
        await initSocket();
        navigation.reset({
          index: 0,
          routes: [{ name: 'TrangChu' }],
        });
      } else {
        Alert.alert('Lỗi', 'Đăng nhập không thành công. Vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Lỗi', `Đăng nhập không thành công: ${error.message}`);
    }
  };

  const handleRegister = () => {
    navigation.navigate('DangKy');
  };
  const handleForgotPassword = () => {
    navigation.navigate('QuenMatKhauScreen');
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

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
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

            <TouchableOpacity 
          style={styles.socialButton}
         
        
        >
          <Image
            source={require('../../assets/gg.png')}
            style={styles.logo}
          />
        </TouchableOpacity>

        <TouchableOpacity 
              style={styles.socialButton}
             
             
            >
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