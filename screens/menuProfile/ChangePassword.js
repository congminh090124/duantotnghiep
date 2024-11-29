import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  SafeAreaView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { changePassword } from '../../apiConfig';

const ChangePassword = () => {
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      
      if (newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      } else if (!hasUpperCase || !hasLowerCase) {
        newErrors.newPassword = 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa và 1 chữ thường';
      }
    }

    if (!confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmNewPassword !== newPassword) {
      newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi thành công', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.currentPassword && styles.inputError]}
              placeholder="Mật khẩu hiện tại"
              secureTextEntry
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                setErrors(prev => ({...prev, currentPassword: ''}));
              }}
              placeholderTextColor="#ADB5BD"
            />
            {errors.currentPassword && (
              <Text style={styles.errorText}>{errors.currentPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.newPassword && styles.inputError]}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setErrors(prev => ({...prev, newPassword: ''}));
              }}
              placeholderTextColor="#ADB5BD"
            />
            {errors.newPassword && (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.confirmNewPassword && styles.inputError]}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={(text) => {
                setConfirmNewPassword(text);
                setErrors(prev => ({...prev, confirmNewPassword: ''}));
              }}
              placeholderTextColor="#ADB5BD"
            />
            {errors.confirmNewPassword && (
              <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.updateButton,
              isLoading && styles.disabledButton
            ]} 
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" style={styles.updateButtonLoading} />
            ) : (
              <Text style={styles.updateButtonText}>Cập nhật mật khẩu</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
  formContainer: {
    paddingHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 16,
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
  inputError: {
    borderColor: '#FA5252',
  },
  errorText: {
    color: '#FA5252',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  updateButton: {
    backgroundColor: '#228BE6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
    opacity: 0.8,
  },
  updateButtonLoading: {
    width: 20,
    height: 20,
  },
});

export default ChangePassword;