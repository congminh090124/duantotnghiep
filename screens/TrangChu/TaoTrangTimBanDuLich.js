import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import axios from 'axios';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const mapRef = useRef(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [tempDestination, setTempDestination] = useState(null);
  
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

  const getPlaceName = async (latitude, longitude) => {
    const url = `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?address=${latitude},${longitude}&language=vi&region=vi&result_type=administrative_area_level_1&location_type=APPROXIMATE`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
        'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.get(url, options);
      if (response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      }
    } catch (error) {
      console.error('Error getting place name:', error);
    }
    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const url = `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&language=vi&region=vi&result_type=administrative_area_level_1&location_type=APPROXIMATE`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
        'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.get(url, options);

      if (response.data.results.length > 0) {
        const result = response.data.results[0];
        const { lat, lng } = result.geometry.location;
        const searchLocation = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setDestination(searchLocation);
        setDestinationName(result.formatted_address);
        
        mapRef.current?.animateToRegion(searchLocation);
      } else {
        Alert.alert('Không tìm thấy', 'Không tìm thấy địa điểm này');
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm địa điểm');
    }
    
    Keyboard.dismiss();
  };

  const handleMapRegionChange = (region) => {
    setMapRegion(region);
    setTempDestination({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleSelectCurrentLocation = async () => {
    if (tempDestination) {
      try {
        const placeName = await getPlaceName(tempDestination.latitude, tempDestination.longitude);
        setDestination(tempDestination);
        setDestinationName(placeName || `${tempDestination.latitude.toFixed(4)}, ${tempDestination.longitude.toFixed(4)}`);
        setShowMap(false);
      } catch (error) {
        console.error('Error selecting current location:', error);
        Alert.alert('Lỗi', 'Không thể chọn vị trí hiện tại');
      }
    }
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

  const handleSearchInputChange = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const url = `https://google-map-places.p.rapidapi.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&language=vi&region=vi`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
            'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
          }
        };

        const response = await axios.get(url, options);
        setSearchResults(response.data.predictions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSearchResults([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (placeId) => {
    try {
      const url = `https://google-map-places.p.rapidapi.com/maps/api/place/details/json?place_id=${placeId}&language=vi&region=vi`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      };

      const response = await axios.get(url, options);
      const result = response.data.result;
      const { lat, lng } = result.geometry.location;
      const searchLocation = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      
      setDestination(searchLocation);
      setDestinationName(result.formatted_address);
      setSearchQuery(result.name);
      setShowSuggestions(false);
      
      mapRef.current?.animateToRegion(searchLocation);
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin địa điểm');
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

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item.place_id)}
    >
      <Ionicons name="location-outline" size={20} color="#1877f2" />
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
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
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => showDatePicker('start')}
            >
              <View style={styles.dateButtonContent}>
                <Ionicons name="calendar-outline" size={20} color="#1877f2" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Ngày bắt đầu</Text>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => showDatePicker('end')}
            >
              <View style={styles.dateButtonContent}>
                <Ionicons name="calendar-outline" size={20} color="#1877f2" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Ngày kết thúc</Text>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </View>
              </View>
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
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm địa điểm..."
              value={searchQuery}
              onChangeText={handleSearchInputChange}
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {showSuggestions && (
            <FlatList
              data={searchResults}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionList}
            />
          )}

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={currentLocation}
            onRegionChangeComplete={handleMapRegionChange}
          >
            {tempDestination && (
              <Marker
                coordinate={tempDestination}
                title="Điểm đến tạm thời"
              />
            )}
          </MapView>

          <View style={styles.mapButtonsContainer}>
            <TouchableOpacity 
              style={styles.selectLocationButton} 
              onPress={handleSelectCurrentLocation}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.selectLocationButtonText}>Chọn điểm đến</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.closeMapButton} 
            onPress={() => setShowMap(false)}
          >
            <Ionicons name="close-circle" size={24} color="#1877f2" />
          </TouchableOpacity>

          <View style={styles.mapCenterMarker}>
            <Ionicons name="location" size={36} color="#1877f2" />
          </View>
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
    marginBottom: 15,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 8,
    marginHorizontal: 5,
    padding: 10,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    marginLeft: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: '#65676b',
  },
  dateValue: {
    fontSize: 14,
    color: '#1877f2',
    fontWeight: 'bold',
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
  searchContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 90,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1877f2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionList: {
    position: 'absolute',
    top: '15%',
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    maxHeight: 200,
    zIndex: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 16,
  },
  mapButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  selectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877f2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  selectLocationButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  mapCenterMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -36,
  },
});

export default TaoTrangTimBanDuLich;
