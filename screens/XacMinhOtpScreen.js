import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';

const XacMinhOtpScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const handleBack = () => {
    navigation.goBack();
  };
  const handleGetOTP = () => {
    if (!email) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã OTP');
      return;
    }

    setLoading(true);

    // Giả lập việc gửi OTP (thực tế bạn sẽ thực hiện API call ở đây)
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Thông báo', 'Mã OTP đã được gửi đến email của bạn.');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Row container for Back button and Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Xác Minh OTP</Text>
        </View>

        <Text style={styles.description}>
          Vui lòng xác minh OPT gồm 4 ký tự được gửi đến gmail
        </Text>
        <Text style={styles.xacMinh}>Mã  OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã OTP"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.textValidate}>Mã không hợp lệ vui lòng thử lại!</Text>

        <TouchableOpacity style={styles.button} onPress={handleGetOTP} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Đang gửi...' : 'Nhận OTP'}</Text>
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
});


export default XacMinhOtpScreen;
