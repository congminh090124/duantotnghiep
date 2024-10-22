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
          const response = await fetch("https://lacewing-evolving-generally.ngrok-free.app/api/scan/update-cccd", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                  cccd: cccdData[0]?.id,
                  name: cccdData[0]?.name,
                  dob: cccdData[0]?.dob,
                  sex: cccdData[0]?.sex,
                  nationality: cccdData[0]?.nationality,
                  home: cccdData[0]?.home,
                  address: cccdData[0]?.address,
              }),
          });

          const data = await response.json();
      

          if (response.ok) {
              Alert.alert('Success', 'Cập nhật thông tin CCCD thành công');
              navigation.goBack(); 
          } else {
              Alert.alert('Error', data.message || 'Failed to update CCCD information');
          }
      } catch (error) {
          console.error('Error updating CCCD:', error);
          Alert.alert('Error', 'An error occurred. Please try again.');
      }
  };

  const handleEdit = () => {
      navigation.goBack();
  };

  const InfoItem = ({ label, value }) => (
      <View style={styles.infoItem}>
          <Text style={styles.label}>{label}:</Text>
          <Text style={styles.value}>{value}</Text>
      </View>
  );

  return (
      <ScrollView style={styles.container}>
          <Text style={styles.header}>Xác nhận thông tin CCCD</Text>
          
          {cccdData ? (
              <View style={styles.infoContainer}>
                  <InfoItem label="Số CCCD" value={cccdData[0]?.id || 'Không có'} />
                  <InfoItem label="Họ và tên" value={cccdData[0]?.name || 'Không có'} />
                  <InfoItem label="Ngày sinh" value={cccdData[0]?.dob || 'Không có'} />
                  <InfoItem label="Giới tính" value={cccdData[0]?.sex || 'Không có'} />
                  <InfoItem label="Quốc tịch" value={cccdData[0]?.nationality || 'Không có'} />
                  <InfoItem label="Quê quán" value={cccdData[0]?.home || 'Không có'} />
                  <InfoItem label="Nơi thường trú" value={cccdData[0]?.address || 'Không có'} />
              </View>
          ) : (
              <Text style={styles.noDataText}>Không có dữ liệu CCCD</Text>
          )}

          <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleEdit}>
                  <Text style={styles.buttonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={handleConfirm}>
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
    },
    value: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    debugButton: {
        backgroundColor: '#ff9800',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
});

export default ConfirmCCCDScreen;