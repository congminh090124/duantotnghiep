import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const XacMinhDanhTinh = () => {
  const navigation = useNavigation();

  const handleVerify = () => {
    navigation.navigate('VerifyIDScreen');
  };

 

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>Xác Minh Danh Tính</Text>
      
      <Image
        source={require('../../assets/cccd.jpg')} // Make sure to add this image to your assets
        style={styles.image}
      />
      
      <Text style={styles.content}>
        Để đảm bảo an toàn và cung cấp trải nghiệm tốt nhất, chúng tôi cần xác minh danh tính của bạn. 
        Quá trình này sẽ chỉ mất vài phút và giúp bảo vệ tài khoản của bạn.
      </Text>
      
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Xác Minh Ngay</Text>
      </TouchableOpacity>
      
     
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#999',
  },
  skipButtonText: {
    color: '#999',
  },
});

export default XacMinhDanhTinh;
