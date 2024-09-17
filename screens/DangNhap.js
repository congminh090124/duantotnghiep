import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('BottomTabs');
  };
  const handleRegister = () => {
    navigation.navigate('DangKy');
  };
  const SocialButton = ({ icon, text }) => (
    <TouchableOpacity style={styles.socialButton}>
      <Image source={icon} style={styles.logo} />
      <Text style={styles.socialButtonText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.textdn}>Đăng Nhập</Text>
        <Image
          source={require('../assets/logodn.webp')}
          style={styles.headerImage}
        />
        <Text style={styles.title}>Du lịch và kết bạn</Text>
        <Text style={styles.description}>
          Cảnh đẹp bên ngoài phản chiếu tâm hồn thanh tịnh bên trong.
        </Text>

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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.registerButton]} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Hoặc</Text>

        <SocialButton icon={require('../assets/logo.png')} text="Đăng ký với Apple ID" />
        <SocialButton icon={require('../assets/gg.png')} text="Đăng ký với Google" />
        <SocialButton icon={require('../assets/fb.png')} text="Đăng ký với Facebook" />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.04,
  },
  headerImage: {
    width: width * 0.8,
    height: height * 0.15,
    resizeMode: 'contain',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  description: {
    fontSize: width * 0.04,
    textAlign: 'center',
    color: '#707070',
    marginBottom: height * 0.02,
  },
  input: {
    width: '100%',
    padding: height * 0.015,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: height * 0.015,
  },
  button: {
    backgroundColor: '#00AEEF',
    padding: height * 0.02,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
  },
  textdn: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: height * 0.02,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  orText: {
    textAlign: 'center',
    marginVertical: height * 0.02,
    fontSize: width * 0.04,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.04,
    borderRadius: 10,
    marginBottom: height * 0.01,
    width: '100%',
  },
  socialButtonText: {
    flex: 1,
    textAlign: 'center',
    fontSize: width * 0.04,
  },
  logo: {
    width: width * 0.06,
    height: width * 0.06,
    marginRight: width * 0.02,
  },
});

export default LoginScreen;