import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
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
    <ImageBackground
      source={require('../assets/ccc.png')} // Đường dẫn tới ảnh nền của bạn
      style={styles.background}
      resizeMode="cover" // Để đảm bảo ảnh phủ đầy màn hình
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.textdn}>Đăng Nhập</Text>
          <Image
            source={require('../assets/vvv.png')}
            style={styles.headerImage}
          />
          <Text style={styles.title}>Du lịch và kết bạn</Text>

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
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton}>
                            <Image
                                source={require('../assets/logo.png')} // Apple logo
                                style={styles.logo}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Image
                                source={require('../assets/gg.png')} // Google logo
                                style={styles.logo}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton}>
                            <Image
                                source={require('../assets/fb.png')} // Facebook logo
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    flex: 1,
    width: '100%',
    height: '150%',
},
container: {
  flex: 1,
  height: "60%", // Add transparency to make the background visible
  paddingHorizontal: width * 0.05,
  paddingVertical: height * 0.08,
},
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.04,
  },
  headerImage: {
    width: width * 2,
    height: height * 0.2,
    resizeMode: 'contain',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
    textAlign: 'center',
    color: '#fff', // Màu trắng để hiển thị tốt trên nền tối
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
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.02,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  orText: {
    textAlign: 'center',
    marginVertical: height * 0.02,
    fontSize: width * 0.04,
    color: '#fff',
  },
  socialButtonsContainer: {
    flexDirection: 'row',       // Aligns buttons in a row
    justifyContent: 'center',   // Centers the buttons
    alignItems: 'center',       // Vertically centers the buttons
    marginBottom: height * 0.02,
},
socialButton: {
    backgroundColor: '#f2f2f2',
    padding: width * 0.02,      // Reduces the padding for less space around logos
    borderRadius: 10,
    marginHorizontal: width * 0.05,  // Small horizontal margin to keep buttons close
},
logo: {
    width: width * 0.07,        // Size of the logos (adjust as needed)
    height: width * 0.07,
},
});

export default LoginScreen;
