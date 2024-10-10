import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { createPostTravel, getUserProfile } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerAndroid from '@react-native-community/datetimepicker';
import {API_ENDPOINTS } from '../../apiConfig';

const TaoTrangTimBanDuLich = () => {
  const [title, setTitle] = useState('');
  const [image, setImages] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [locationDisplay, setLocationDisplay] = useState('');
  const [destination, setDestination] = useState(null);
  const [destinationName, setDestinationName] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile();
        console.log('User profile data:', data);
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access location was denied');
      return;
    }
  
    try {
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setLocation(`${location.coords.latitude},${location.coords.longitude}`);
      
      let address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      if (address[0]) {
        setLocationDisplay(`${address[0].city}, ${address[0].country}`);
      } else {
        setLocationDisplay(`${location.coords.latitude.toFixed(2)}, ${location.coords.longitude.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get current location');
    }
  };

  const avatarUri = useMemo(() => {
    if (profileData?.anh_dai_dien) {
      // Sử dụng trực tiếp URL từ Cloudinary
      return profileData.anh_dai_dien;
    }
    return null;
  }, [profileData?.anh_dai_dien]);

  const optimizeImage = async (uri) => {
    try {
      const manipulatedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }], // Resize to 1080px width
        { compress: 0.7, format: SaveFormat.JPEG } // Compress to 70% quality
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return uri; // Return original URI if optimization fails
    }
  };

  const handleAddImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.image,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets) {
      const optimizedImages = await Promise.all(
        result.assets.map(async (asset) => await optimizeImage(asset.uri))
      );
      setImages([...image, ...optimizedImages]);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(image.filter((_, i) => i !== index));
  };

  const onChangeStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onChangeEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const showDatePicker = (startOrEnd) => {
    if (startOrEnd === 'start') {
      setShowStartPicker(true);
    } else {
      setShowEndPicker(true);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN');
  };

  const handleSelectDestination = () => {
    setShowMap(true);
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setDestination(coordinate);
    
    try {
      const address = await Location.reverseGeocodeAsync(coordinate);
      if (address[0]) {
        setDestinationName(`${address[0].city || address[0].region}, ${address[0].country}`);
      } else {
        setDestinationName(`${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setDestinationName(`${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`);
    }
    
    setShowMap(false);
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bài viết.');
      return;
    }
  
    if (!location) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
      return;
    }
  
    if (!destination) {
      Alert.alert('Lỗi', 'Vui lòng chọn điểm đến.');
      return;
    }
  
    try {
      const optimizedImages = await Promise.all(
        image.map(async (img) => {
          const optimizedUri = await optimizeImage(img);
          return {
            uri: optimizedUri,
            type: 'image/jpeg',
            name: `image_${Date.now()}.jpg`,
          };
        })
      );
  
      const [currentLat, currentLng] = location.split(',').map(coord => parseFloat(coord.trim()));
  
      const postData = {
        title: title.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentLocationLat: currentLat,
        currentLocationLng: currentLng,
        destinationLat: destination.latitude,
        destinationLng: destination.longitude,
        destinationName: destinationName,
        image: optimizedImages,
      };
  
      console.log('Sending post data:', postData);
  
      const result = await createPostTravel(postData);
      console.log('Post created successfully:', result);
      Alert.alert('Thành công', 'Bài viết đã được tạo.');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Lỗi', `Không thể tạo bài viết: ${error.message}`);
    }
  };

  const renderImageItem = ({ item, index }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item }} style={styles.postImage} />
      <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
        <Ionicons name="close-circle" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tạo bài viết</Text>
            <TouchableOpacity style={styles.postButton} onPress={handlePost}>
              <Text style={styles.postButtonText}>Đăng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.profilePic}
              />
            ) : (
              <View style={[styles.profilePic, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>
                  {profileData?.username ? profileData.username[0].toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{profileData?.username || 'User'}</Text>
          </View>

          {locationDisplay && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color="#1877f2" />
              <Text style={styles.locationText}>{locationDisplay}</Text>
            </View>
          )}

          <TextInput
            style={styles.titleInput}
            placeholder="Tiêu đề bài viết"
            value={title}
            onChangeText={setTitle}
          />

          <View style={styles.dateContainer}>
            <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker('start')}>
              <Text style={styles.dateButtonText}>Ngày bắt đầu: {formatDate(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateButton} onPress={() => showDatePicker('end')}>
              <Text style={styles.dateButtonText}>Ngày kết thúc: {formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>

          {showStartPicker && (
            <DateTimePickerAndroid
              testID="startDatePicker"
              value={startDate}
              mode="date"
              display="default"
              onChange={onChangeStartDate}
            />
          )}

          {showEndPicker && (
            <DateTimePickerAndroid
              testID="endDatePicker"
              value={endDate}
              mode="date"
              display="default"
              onChange={onChangeEndDate}
            />
          )}

          <TouchableOpacity style={styles.mapButton} onPress={handleSelectDestination}>
            <Ionicons name="map-outline" size={24} color="#1877f2" />
            <Text style={styles.mapButtonText}>
              {destination ? 'Thay đổi điểm đến' : 'Chọn điểm đến'}
            </Text>
          </TouchableOpacity>

          {destinationName && (
            <Text style={styles.destinationText}>
              Điểm đến: {destinationName}
            </Text>
          )}

          <FlatList
            data={image}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            style={styles.imageList}
            ListFooterComponent={
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImages}>
                <Ionicons name="image-outline" size={24} color="#1877f2" />
                <Text style={styles.addImageText}>Thêm hình ảnh</Text>
              </TouchableOpacity>
            }
          />
        </View>
      </TouchableWithoutFeedback>

      {showMap && currentLocation && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={currentLocation}
            onPress={handleMapPress}
          >
            {destination && (
              <Marker
                coordinate={destination}
                title="Điểm đến"
              />
            )}
          </MapView>
          <TouchableOpacity style={styles.closeMapButton} onPress={() => setShowMap(false)}>
            <Text style={styles.closeMapButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleInput: {
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    padding: 10,
    fontSize: 16,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    padding: 5,
  },
  postButtonText: {
    color: '#1877f2',
    fontWeight: 'bold',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  placeholderImage: {
    backgroundColor: '#1877f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontWeight: 'bold',
  },
  postInput: {
    minHeight: 100,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
  },
  imageList: {
    flex: 1,
  },
  imageItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 2,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  addImageText: {
    color: '#1877f2',
    marginLeft: 10,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  locationText: {
    marginLeft: 5,
    color: '#1877f2',
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dateButtonText: {
    color: '#1877f2',
    textAlign: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
    marginTop: 10,
  },
  mapButtonText: {
    color: '#1877f2',
    marginLeft: 10,
  },
  destinationText: {
    marginHorizontal: 10,
    marginTop: 5,
    color: '#1877f2',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  closeMapButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  closeMapButtonText: {
    color: '#1877f2',
    fontWeight: 'bold',
  },
});

export default TaoTrangTimBanDuLich;