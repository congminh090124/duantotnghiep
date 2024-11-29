import React, { useState, useRef, useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { resetPassword, forgotPassword } from '../../apiConfig';

const XacMinhOtpScreen = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;
  
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Cleanup timer when component unmounts
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (!otpString || otpString.length !== 6 || !newPassword) {
      setError('Vui lòng nhập đầy đủ mã OTP và mật khẩu mới.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email, otpString, newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại thành công.', [
        { text: 'OK', onPress: () => navigation.navigate('DangNhap') }
      ]);
    } catch (error) {
      setError(error.message || 'Đã xảy ra lỗi khi xác minh OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      setLoading(true);
      await forgotPassword(email);
      setCountdown(20); // Start 20s countdown
      Alert.alert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn.');
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Xác Minh OTP</Text>
        </View>

        <Text style={styles.description}>
          Vui lòng nhập mã OTP gồm 6 số được gửi đến email của bạn
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputRefs.current[index] = ref}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Text style={styles.inputLabel}>Mật khẩu mới</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu mới"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          placeholderTextColor="#ADB5BD"
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabledButton]} 
          onPress={handleVerifyOTP} 
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleResendOTP}
          disabled={countdown > 0 || loading}
          style={styles.resendButton}
        >
          <Text style={[
            styles.resendText,
            countdown > 0 && styles.resendTextDisabled
          ]}>
            {countdown > 0 
              ? `Gửi lại mã OTP (${countdown}s)`
              : 'Gửi lại mã OTP'
            }
          </Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: '20%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#495057',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginRight: '20%',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 32,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 12,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: '#212529',
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
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
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
    marginBottom: 16,
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
  errorText: {
    color: '#FA5252',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    color: '#228BE6',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: '#ADB5BD',
    textDecorationLine: 'none',
  },
});

export default XacMinhOtpScreen;
