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
  Platform,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createPostTravel, getUserProfile } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {API_ENDPOINTS } from '../../apiConfig';
import axios from 'axios';
import Modal from 'react-native-modal';

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
  const [isPosting, setIsPosting] = useState(false);
  const [hasSearchResult, setHasSearchResult] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [activeDateType, setActiveDateType] = useState(null); // 'start' or 'end'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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

  const showDatePicker = (type) => {
    setActiveDateType(type);
    setIsDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
    setActiveDateType(null);
  };

  const handleConfirmDate = (date) => {
    if (activeDateType === 'start') {
      setStartDate(date);
      if (date > endDate) {
        setEndDate(date);
      }
    } else {
      if (date < startDate) {
        Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
      setEndDate(date);
    }
    hideDatePicker();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSelectDestination = () => {
    setShowMap(true);
    setHasSearchResult(false);
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
  
    try {
      const url = `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&language=vi&region=vi&result_type=administrative_area_level_1&location_type=APPROXIMATE`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      };

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
        mapRef.current?.animateToRegion(searchLocation, 1000);
        
        // Đặt các state ngay lập tức
        setHasSearchResult(true);
        setIsMapReady(true);
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
        // Lấy tên địa điểm từ tọa độ
        const placeName = await getPlaceName(
          tempDestination.latitude,
          tempDestination.longitude
        );
        
        setDestination(tempDestination);
        setDestinationName(placeName || `${tempDestination.latitude.toFixed(2)}, ${tempDestination.longitude.toFixed(2)}`);
        setShowMap(false);
        setTempDestination(null);
      } catch (error) {
        console.error('Error getting place name:', error);
        // Fallback to coordinates if getting place name fails
        setDestinationName(`${tempDestination.latitude.toFixed(2)}, ${tempDestination.longitude.toFixed(2)}`);
      }
    }
  };

  const validateForm = () => {
    let newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
    }
    
    if (!destination) {
      newErrors.destination = 'Vui lòng chọn điểm đến';
    }
    
    if (endDate < startDate) {
      newErrors.date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePost = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!title.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bài viết.');
        return;
      }
    
      if (!location) {
        Alert.alert('Lỗi', 'Không thể lấy v trí hiện tại. Vui lòng thử lại.');
        return;
      }
    
      if (!destination) {
        Alert.alert('Lỗi', 'Vui lòng chọn điểm đến.');
        return;
      }
    
      setIsPosting(true);
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
      } finally {
        setIsPosting(false);
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsSubmitting(false);
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
      const response = await axios.get(url, {
        headers: {
          'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      });

      const result = response.data.result;
      const { lat, lng } = result.geometry.location;
      
      setTempDestination({
        latitude: lat,
        longitude: lng,
        name: result.formatted_address
      });
      
      setSearchQuery(result.name);
      setShowSuggestions(false);
      
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      // Đặt các state ngay lập tức
      setHasSearchResult(true);
      setIsMapReady(true);
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

  useEffect(() => {
    console.log('Current destinationName:', destinationName);
  }, [destinationName]);

  const generateDates = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    
    // Thêm ngày từ tháng trước
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push({ date, disabled: true });
    }
    
    // Thêm ngày trong tháng
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      dates.push({ date, disabled: false });
    }
    
    return dates;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo bài viết</Text>
          <TouchableOpacity 
            style={[
              styles.postButton,
              isSubmitting && styles.postButtonDisabled
            ]} 
            onPress={handlePost}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Đăng</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tiêu đề</Text>
            <TextInput
              style={[
                styles.titleInput,
                errors.title && styles.inputError
              ]}
              placeholder="Nhập tiêu đề bài viết..."
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                setErrors({ ...errors, title: null });
              }}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          <View style={styles.locationsContainer}>
            <Text style={styles.sectionTitle}>Địa điểm</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationBox}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color="#1877f2" />
                  <Text style={styles.locationLabel}>Vị trí hiện tại</Text>
                </View>
                <Text style={styles.locationValue} numberOfLines={1}>
                  {locationDisplay || 'Đang lấy vị trí...'}
                </Text>
              </View>

              <View style={styles.locationDivider}>
                <Ionicons name="arrow-forward" size={20} color="#666" />
              </View>

              <View style={styles.locationBox}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color="#E4405F" />
                  <Text style={styles.locationLabel}>Điểm đến</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.destinationButton,
                    destinationName ? styles.destinationSelected : null
                  ]}
                  onPress={handleSelectDestination}
                >
                  {destinationName ? (
                    <Text style={styles.locationValue} numberOfLines={1}>
                      {destinationName}
                    </Text>
                  ) : (
                    <Text style={styles.destinationPlaceholder}>
                      Chọn điểm đến
                    </Text>
                  )}
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={destinationName ? "#1A1A1A" : "#666"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.dateContainer}>
            <Text style={styles.sectionTitle}>Thời gian</Text>
            <View style={styles.dateButtons}>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showDatePicker('start')}
              >
                <View style={styles.dateContent}>
                  <View style={styles.dateIconLabel}>
                    <Ionicons name="calendar-outline" size={20} color="#1877f2" />
                    <Text style={styles.dateLabel}>Bắt đầu</Text>
                  </View>
                  <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => showDatePicker('end')}
              >
                <View style={styles.dateContent}>
                  <View style={styles.dateIconLabel}>
                    <Ionicons name="calendar-outline" size={20} color="#1877f2" />
                    <Text style={styles.dateLabel}>Kết thúc</Text>
                  </View>
                  <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                </View>
              </TouchableOpacity>
            </View>
            {errors.date && (
              <Text style={styles.errorText}>{errors.date}</Text>
            )}
          </View>

          <View style={styles.imagesSection}>
            <Text style={styles.sectionTitle}>Hình ảnh</Text>
            <FlatList
              data={image}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={3}
              ListEmptyComponent={
                <Text style={styles.emptyImagesText}>
                  Chưa có hình ảnh nào được chọn
                </Text>
              }
              ListFooterComponent={
                <TouchableOpacity 
                  style={styles.addImageButton} 
                  onPress={handleAddImages}
                >
                  <Ionicons name="image-outline" size={24} color="#1877f2" />
                  <Text style={styles.addImageText}>Thêm hình ảnh</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </View>
      </Animated.View>

      {showMap && currentLocation && (
        <View style={styles.mapContainer}>
          <View style={styles.mapHeaderContainer}>
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm địa điểm..."
                  value={searchQuery}
                  onChangeText={handleSearchInputChange}
                  placeholderTextColor="#666"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setSearchQuery('');
                      setShowSuggestions(false);
                      setHasSearchResult(false);
                      setIsMapReady(false);
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.closeMapButton}
                onPress={() => {
                  setShowMap(false);
                  setHasSearchResult(false);
                  setIsMapReady(false);
                }}
              >
                <Ionicons name="close" size={24} color="#000" />
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
          </View>

          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={currentLocation}
            onRegionChangeComplete={handleMapRegionChange}
          >
            {tempDestination && (
              <Marker
                coordinate={{
                  latitude: tempDestination.latitude,
                  longitude: tempDestination.longitude
                }}
                title={tempDestination.name}
              />
            )}
          </MapView>

          {!hasSearchResult && (
            <View style={styles.mapCenterMarker}>
              <Ionicons name="location" size={36} color="#1877f2" />
            </View>
          )}

          {hasSearchResult && isMapReady && (
            <TouchableOpacity 
              style={styles.confirmLocationButton}
              onPress={handleSelectCurrentLocation}
            >
              <Text style={styles.confirmLocationText}>Chọn địa điểm này</Text>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal
        isVisible={isDatePickerVisible}
        onBackdropPress={hideDatePicker}
        onSwipeComplete={hideDatePicker}
        swipeDirection={['down']}
        style={styles.modalStyle}
        propagateSwipe
      >
        <View style={styles.datePickerModal}>
          <View style={styles.datePickerHeader}>
            <View style={styles.modalIndicator} />
            <Text style={styles.datePickerTitle}>
              {activeDateType === 'start' ? 'Chọn ngày bắt đầu' : 'Chọn ngày kết thúc'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={hideDatePicker}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.monthYearSelector}>
            <TouchableOpacity 
              onPress={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              style={styles.monthArrowButton}
            >
              <Ionicons name="chevron-back" size={24} color="#1877F2" />
            </TouchableOpacity>

            <Text style={styles.monthYearText}>
              {`Tháng ${selectedMonth + 1}, ${selectedYear}`}
            </Text>

            <TouchableOpacity 
              onPress={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              style={styles.monthArrowButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysContainer}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
              <Text key={index} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>

          <ScrollView style={styles.datesContainer}>
            <View style={styles.datesGrid}>
              {generateDates(selectedYear, selectedMonth).map((item, index) => {
                const isSelected = activeDateType === 'start' 
                  ? item.date.toDateString() === startDate.toDateString()
                  : item.date.toDateString() === endDate.toDateString();
                
                const isDisabled = item.disabled || 
                  (activeDateType === 'end' && item.date < startDate) ||
                  item.date < new Date();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateCell,
                      isSelected && styles.selectedDateCell,
                      isDisabled && styles.disabledDateCell
                    ]}
                    onPress={() => {
                      if (!isDisabled) {
                        handleConfirmDate(item.date);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.dateText,
                      isSelected && styles.selectedDateText,
                      isDisabled && styles.disabledDateText
                    ]}>
                      {item.date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.datePickerActions}>
            <TouchableOpacity 
              style={[styles.datePickerButton, styles.datePickerButtonConfirm]}
              onPress={hideDatePicker}
            >
              <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextConfirm]}>
                Xác nhận
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Layout chính
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1A1A1A',
  },
  postButton: {
    backgroundColor: '#1877F2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // Input sections
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  titleInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    color: '#1A1A1A',
  },

  // Locations
  locationsContainer: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: 16,
  },
  locationBox: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
    marginLeft: 6,
  },
  locationValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  locationDivider: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  destinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  destinationSelected: {
    opacity: 1,
  },
  destinationPlaceholder: {
    fontSize: 15,
    color: '#666666',
    flex: 1,
  },

  // Date section
  dateContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  dateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  dateContent: {
    gap: 6,
  },
  dateIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },

  // Images section
  imagesSection: {
    marginBottom: 20,
  },
  imageItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 3,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 4,
  },
  emptyImagesText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 15,
    marginVertical: 20,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 8,
  },
  addImageText: {
    color: '#1877F2',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Map section
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
  map: {
    flex: 1,
  },
  mapHeaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    marginLeft: 8,
  },
  closeMapButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  suggestionList: {
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    paddingHorizontal: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  mapCenterMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -36,
  },
  confirmLocationButton: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  confirmLocationText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
  },

  // Date Picker Modal
  modalStyle: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  datePickerModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%',
  },
  datePickerHeader: {
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E8E8E8',
    borderRadius: 2,
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthArrowButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  datesContainer: {
    maxHeight: 280,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  selectedDateCell: {
    backgroundColor: '#1877F2',
    borderRadius: 20,
  },
  disabledDateCell: {
    opacity: 0.3,
  },
  dateText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  selectedDateText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledDateText: {
    color: '#666',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  datePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  datePickerButtonConfirm: {
    backgroundColor: '#1877F2',
  },
  datePickerButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  datePickerButtonTextConfirm: {
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
});

export default TaoTrangTimBanDuLich;
