import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { forgotPassword } from '../../apiConfig'; // Đảm bảo đường dẫn này chính xác
import Ionicons from 'react-native-vector-icons/Ionicons';

const QuenMatKhauScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGetOTP = async () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập địa chỉ email.');
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email);
      Alert.alert('Thông báo', 'Mã OTP đã được gửi đến email của bạn.');
      navigation.navigate('XacMinhOTP', { email });
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color="#495057"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <View style={styles.rightPlaceholder} />
        </View>
  
        <Text style={styles.description}>
          Vui lòng nhập địa chỉ email của bạn để nhận mã OTP. Mã OTP sẽ được gửi đến email của bạn trong vòng vài phút.
          Nếu bạn không nhận được mã, hãy kiểm tra thư mục spam hoặc thử lại sau.
        </Text>
  
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
           autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
  
        <TouchableOpacity style={styles.button} onPress={handleGetOTP} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Nhận OTP'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  
   
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  rightPlaceholder: {
    width: 40,
  },
  description: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  button: {
    backgroundColor: '#228BE6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
    opacity: 0.8,
  },
});
  

export default QuenMatKhauScreen;
