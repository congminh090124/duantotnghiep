import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

const DangBaiScreen = () => {
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    startDate: "Ngày bắt đầu",
    endDate: "Ngày kết thúc",
    selectedImage: null,
    selectedLocation: null,
    selectedAddress: '',
    currentAddress: 'Đang lấy vị trí...',
  });
  const [showDatePicker, setShowDatePicker] = useState({ start: false, end: false });

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route.params?.selectedLocation && route.params?.selectedAddress) {
      setPostData(prev => ({
        ...prev,
        selectedLocation: route.params.selectedLocation,
        selectedAddress: route.params.selectedAddress,
      }));
    }
  }, [route.params]);

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log("Please grant location permissions");
      return;
    }
    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      reverseGeocode(currentLocation);
    } catch (error) {
      console.error("Error getting current location:", error);
      setPostData(prev => ({ ...prev, currentAddress: 'Không thể lấy vị trí' }));
    }
  };

  const reverseGeocode = async (location) => {
    try {
      const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      if (reverseGeocodedAddress.length > 0) {
        const addressObj = reverseGeocodedAddress[0];
        const formattedAddress = `${addressObj.street}, ${addressObj.city}, ${addressObj.region}, ${addressObj.country}`;
        setPostData(prev => ({ ...prev, currentAddress: formattedAddress }));
      } else {
        setPostData(prev => ({ ...prev, currentAddress: 'Không thể lấy vị trí' }));
      }
    } catch (error) {
      console.error("Error in reverse geocoding: ", error);
      setPostData(prev => ({ ...prev, currentAddress: 'Không thể lấy vị trí' }));
    }
  };

  const handleBack = useCallback(() => navigation.goBack(), [navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Bạn cần cấp quyền truy cập thư viện ảnh!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPostData(prev => ({ ...prev, selectedImage: result.assets[0].uri }));
    }
  };

  const onDateChange = (event, selectedDate, dateType) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(prev => ({ ...prev, [dateType]: false }));
    setPostData(prev => ({ ...prev, [dateType]: currentDate.toLocaleDateString() }));
  };

  const handleChooseLocation = useCallback(() => navigation.navigate('MapScreen'), [navigation]);

  const renderDatePicker = (dateType) => (
    <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(prev => ({ ...prev, [dateType]: true }))}>
      <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/2838/2838779.png" }} style={styles.image2} />
      <Text style={styles.buttonText}>{postData[dateType]}</Text>
      {showDatePicker[dateType] && (
        <DateTimePicker 
          value={new Date()} 
          mode="date" 
          display="default" 
          onChange={(event, selectedDate) => onDateChange(event, selectedDate, dateType)}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image source={require('../assets/back.png')} style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerText}>Tạo bài đăng</Text>
          </View>

          <View style={styles.rowAnh}>
            <Image
              source={postData.selectedImage ? { uri: postData.selectedImage } : require('../assets/image.png')}
              style={styles.image}
            />
            <Text style={styles.cab}>Chọn ảnh</Text>
            <TouchableOpacity style={styles.btnThem} onPress={pickImage}>
              <Text style={styles.btnThemText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.titleLabel}>Tiêu đề</Text>
            <TextInput
              style={styles.input}
              placeholder="Tiêu đề của bạn"
              value={postData.title}
              onChangeText={(text) => setPostData(prev => ({ ...prev, title: text }))}
              multiline={true}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chi tiết</Text>
            {renderDatePicker('startDate')}
            {renderDatePicker('endDate')}

            <TouchableOpacity style={styles.button} onPress={handleChooseLocation}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/128/819/819865.png" }} style={styles.image2} />
              <Text style={styles.buttonText}>{postData.selectedAddress || "Chọn địa điểm"}</Text>
            </TouchableOpacity>

            <View style={styles.currentLocationContainer}>
              <Text style={styles.currentLocationLabel}>Vị trí hiện tại:</Text>
              <Text style={styles.currentLocationText}>{postData.currentAddress}</Text>
            </View>
          </View>

          <View style={styles.textAreaContainer}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Mô tả kế hoạch du lịch của bạn"
              value={postData.description}
              onChangeText={(text) => setPostData(prev => ({ ...prev, description: text }))}
              multiline={true}
            />
          </View>

          <View style={styles.budgetContainer}>
            <TouchableOpacity style={styles.submitButton}>
              <Text style={styles.submitButtonText}>Tạo bài đăng</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 20,
    paddingLeft: '10%'
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  titleLabel: {
    marginBottom: 5,
    fontSize: 17,
    fontWeight: 'bold',
  },
  input: {
    height: 66,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 120,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: 'orange',
    padding: 15,
    borderRadius: 10,
    marginBottom: '10%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
    marginLeft: 10,
    marginBottom: '2%',
    marginTop: '2%',
  },
  image2: {
    width: 20,
    height: 20,
  },
  cab: {
    marginTop: '1%',
    marginLeft:'3%'
  },
  btnThem: {
    marginTop: '1%',
    marginLeft:'45%',
    backgroundColor: 'orange',
    paddingHorizontal: '3%',
    paddingVertical: '1%',
    borderRadius: 5,
  },
  currentLocationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  currentLocationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  currentLocationText: {
    fontSize: 14,
  },
  btnThemText: {
    color: '#fff',
  },
  textAreaContainer: {
    marginBottom: 20,
  },
  rowAnh: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    marginBottom: '5%'
  },
  dropdownContainer: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: '32%'
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
    marginTop: '1%',
  },
  backIcon: {
    width: 20,
    height: 20,
  },
});

export default DangBaiScreen;