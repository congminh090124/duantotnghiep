import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_ENDPOINTS from '../../apiConfig';
import { useNavigation } from '@react-navigation/native';
const ConfirmCCCDScreen = ({ route, navigation }) => {
  const [cccdData, setCccdData] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
      if (route.params?.cccdData) {
          console.log('Nhận được dữ liệu CCCD trong ConfirmScreen:', route.params.cccdData);
          setCccdData(route.params.cccdData);
       
      }

      const getToken = async () => {
          try {
              const storedToken = await AsyncStorage.getItem('userToken');
            
              if (storedToken) {
                  setToken(storedToken);
              } else {
                  console.warn('No token found');
                  navigation.navigate('DangNhap'); // Redirect to login if no token
              }
          } catch (error) {
              console.error('Error retrieving token:', error);
          }
      };
      getToken();
  }, [route.params, navigation]);

  const handleConfirm = async () => {
      if (!token || !cccdData) {
          Alert.alert('Error', 'Missing token or CCCD data');
          return;
      }
        
      try {
          console.log('Sending CCCD data:', cccdData); // Thêm log để debug
          const response = await fetch("https://www.adminftravel.xyz/api/scan/update-cccd", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(cccdData), // Gửi trực tiếp cccdData
          });

          const data = await response.json();
          console.log('Server response:', data); // Thêm log để debug

          if (response.ok) {
              Alert.alert('Success', 'Cập nhật thông tin CCCD thành công');
              navigation.navigate('TrangChu'); 
          } else {
              Alert.alert('Error', data.message || 'Failed to update CCCD information');
          }
      } catch (error) {
          console.error('Error updating CCCD:', error);
          Alert.alert('Error', 'An error occurred. Please try again.');
      }
  };

  const InfoItem = ({ label, value }) => (
      <View style={styles.infoItem}>
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.value}>{value || 'Không có'}</Text>
      </View>
  );

  return (
      <ScrollView style={styles.container}>
          <Text style={styles.header}>Xác nhận thông tin CCCD</Text>
          
          {cccdData ? (
              <View style={styles.infoContainer}>
                  <InfoItem label="Số CCCD" value={cccdData.cccd} />
                  <InfoItem label="Họ và tên" value={cccdData.name} />
                  <InfoItem 
                      label="Ngày sinh" 
                      value={
                          cccdData.dob ? 
                          new Date(cccdData.dob).toLocaleDateString('vi-VN') : 
                          'Không có'
                      } 
                  />
                  <InfoItem label="Giới tính" value={cccdData.sex} />
                  <InfoItem label="Quốc tịch" value={cccdData.nationality} />
                  <InfoItem label="Quê quán" value={cccdData.home} />
                  <InfoItem label="Nơi thường trú" value={cccdData.address} />
              </View>
          ) : (
              <Text style={styles.noDataText}>Không có dữ liệu CCCD</Text>
          )}

          <View style={styles.buttonContainer}>
              <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]} 
                  onPress={handleConfirm}
              >
                  <Text style={styles.buttonText}>Xác nhận</Text>
              </TouchableOpacity>
          </View>
      </ScrollView>
  );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoContainer: {
        marginBottom: 20,
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
    },
    value: {
        fontSize: 16,
        flex: 2,
        textAlign: 'right',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    confirmButton: {
        backgroundColor: '#28A745',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    noDataText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: 'red',
    },
});

export default ConfirmCCCDScreen;