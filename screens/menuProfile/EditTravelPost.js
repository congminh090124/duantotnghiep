import React, { useState, useRef, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  FlatList,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { editTravelPost } from '../../apiConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import debounce from 'lodash/debounce';

const { width } = Dimensions.get('window');
const inputWidth = width - 40;
const RAPID_API_KEY = '057cd37262msh2a608699c67234ap104731jsn4fa717c7768d';

const EditTravelPost = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { _id, title: initialTitle, startDate: initialStartDate, endDate: initialEndDate, 
          destination: initialDestination, destinationName: initialDestinationName, 
          images: initialImages } = route.params.post;

  const [title, setTitle] = useState(initialTitle);
  const [startDate, setStartDate] = useState(new Date(initialStartDate));
  const [endDate, setEndDate] = useState(new Date(initialEndDate));
  const [destination, setDestination] = useState(initialDestination);
  const [destinationName, setDestinationName] = useState(initialDestinationName);
  const [images, setImages] = useState(initialImages);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef(null);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [showMapSearchResults, setShowMapSearchResults] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);

  const handleUpdatePost = useCallback(async () => {
    setIsLoading(true);
    try {
      const postData = {
        title,
        startDate,
        endDate,
        destinationLat: destination.coordinates[1],
        destinationLng: destination.coordinates[0],
        destinationName,
        images
      };

      await editTravelPost(_id, postData);
      
      Alert.alert('Thành công', 'Bài viết đã được cập nhật', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật bài viết');
    } finally {
      setIsLoading(false);
    }
  }, [title, startDate, endDate, destination, destinationName, images, _id, navigation]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = useCallback((index) => {
    if (index < 0 || index >= images.length) return;
    
    const imageToRemove = images[index];
    
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa hình ảnh này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await editTravelPost(_id, {
                images: images.filter((_, i) => i !== index),
                imagesToDelete: [imageToRemove],
              });
  
              if (response?.travelPost) {
                setImages(response.travelPost.images);
                Alert.alert('Thành công', 'Hình ảnh đã được xóa');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa hình ảnh. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  }, [images, _id]);

  const handleSearchInputChange = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const url = `https://google-map-places.p.rapidapi.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&language=vi&region=vi`;
        const options = {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
          }
        };

        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await axios.get(url, options);
        setSearchResults(response.data.predictions);
        setShowSuggestions(true);
      } catch (error) {
        if (error.response?.status === 429) {
          console.log('Rate limit exceeded, waiting before next request');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error('Error fetching suggestions:', error);
        }
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
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      };

      const response = await axios.get(url, options);
      const result = response.data.result;
      const { lat, lng } = result.geometry.location;
      const location = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setDestination({
        type: 'Point',
        coordinates: [lng, lat]
      });
      setDestinationName(result.formatted_address);
      setSearchQuery(result.name);
      setShowSuggestions(false);

      mapRef.current?.animateToRegion(location);
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin địa điểm');
    }
  };

  const debouncedMapSearch = useMemo(() => 
    debounce(async (text) => {
      if (text.length <= 2) {
        setMapSearchResults([]);
        setShowMapSearchResults(false);
        return;
      }

      try {
        const url = `https://google-map-places.p.rapidapi.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&language=vi&region=vi`;
        const response = await axios.get(url, {
          headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
          }
        });

        setMapSearchResults(response.data.predictions);
        setShowMapSearchResults(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 300),
    []
  );

  const handleMapSearch = useCallback((text) => {
    setMapSearchQuery(text);
    debouncedMapSearch(text);
  }, [debouncedMapSearch]);

  const handleMapSearchSelect = useCallback(async (placeId) => {
    try {
      const url = `https://google-map-places.p.rapidapi.com/maps/api/place/details/json?place_id=${placeId}&language=vi&region=vi`;
      const response = await axios.get(url, {
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      });

      const result = response.data.result;
      const { lat, lng } = result.geometry.location;
      
      const newLocation = {
        coordinates: [lng, lat],
        name: result.formatted_address
      };
      
      setTempLocation(newLocation);
      setMapSearchQuery(result.name);
      setShowMapSearchResults(false);

      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin địa điểm');
    }
  }, []);

  const handleSelectLocation = useCallback(() => {
    if (tempLocation) {
      setDestination({
        type: 'Point',
        coordinates: tempLocation.coordinates
      });
      setDestinationName(tempLocation.name);
      setShowMap(false);
      setTempLocation(null);
    }
  }, [tempLocation]);

  const renderMapSearchResult = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.mapSearchResultItem}
      onPress={() => handleMapSearchSelect(item.place_id)}
    >
      <Text style={styles.mapSearchResultText}>{item.description}</Text>
    </TouchableOpacity>
  ), [handleMapSearchSelect]);

  const initialRegion = useMemo(() => ({
    latitude: destination?.coordinates[1] || 14.0583,
    longitude: destination?.coordinates[0] || 108.2772,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }), [destination]);

  const markerPosition = useMemo(() => {
    if (tempLocation) {
      return {
        coordinate: {
          latitude: tempLocation.coordinates[1],
          longitude: tempLocation.coordinates[0],
        },
        title: tempLocation.name
      };
    }
    if (destination) {
      return {
        coordinate: {
          latitude: destination.coordinates[1],
          longitude: destination.coordinates[0],
        },
        title: destinationName
      };
    }
    return null;
  }, [tempLocation, destination, destinationName]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
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
          <Text style={styles.headerTitle}>Sửa bài du lịch</Text>
        </View>
        
        <View style={styles.scrollContainer}>
          <Text style={styles.label}>Tiêu đề</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề bài viết"
          />

          <View style={styles.dateContainer}>
            <View style={styles.dateWrapper}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text>Bắt đầu: {startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowStartDatePicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>
            <View style={styles.dateWrapper}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text>Kết thúc: {endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowEndDatePicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setShowMap(true)}
          >
            <Text style={styles.locationText}>
              {destinationName || 'Chọn địa điểm'}
            </Text>
          </TouchableOpacity>

          {showMap && (
            <View style={styles.mapContainer}>
              <View style={styles.mapSearchContainer}>
                <TextInput
                  style={styles.mapSearchInput}
                  value={mapSearchQuery}
                  onChangeText={handleMapSearch}
                  placeholder="Tìm kiếm địa điểm"
                  placeholderTextColor="#666"
                />
                {showMapSearchResults && (
                  <FlatList
                    style={styles.mapSearchResults}
                    data={mapSearchResults}
                    keyExtractor={(item) => item.place_id}
                    renderItem={renderMapSearchResult}
                    keyboardShouldPersistTaps="handled"
                    maxToRenderPerBatch={10}
                    windowSize={5}
                  />
                )}
              </View>

              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={initialRegion}
              >
                {markerPosition && (
                  <Marker
                    coordinate={markerPosition.coordinate}
                    title={markerPosition.title}
                  />
                )}
              </MapView>

              <View style={styles.mapButtonsContainer}>
                <TouchableOpacity
                  style={styles.closeMapButton}
                  onPress={() => setShowMap(false)}
                >
                  <Text style={styles.closeMapButtonText}>Đóng bản đồ</Text>
                </TouchableOpacity>
                
                {tempLocation && (
                  <TouchableOpacity
                    style={styles.selectLocationButton}
                    onPress={handleSelectLocation}
                  >
                    <Text style={styles.selectLocationButtonText}>
                      Chọn vị trí này
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={styles.imageContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.updateButton,
              isLoading && styles.disabledButton
            ]}
            onPress={handleUpdatePost}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator 
                  size="small" 
                  color="#FFFFFF" 
                  style={styles.updateButtonLoading} 
                />
                <Text style={styles.updateButtonText}>Đang cập nhật...</Text>
              </>
            ) : (
              <Text style={styles.updateButtonText}>Cập nhật bài viết</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    paddingHorizontal: 4,
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
    marginBottom: 8,
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
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  dateButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  dateText: {
    fontSize: 16,
    color: '#212529',
  },
  locationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
    textAlign: 'center',
  },
  locationIcon: {
    position: 'absolute',
    left: 16,
    color: '#495057',
  },
  locationPlaceholder: {
    color: '#ADB5BD',
  },
  mapContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  mapSearchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  mapSearchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mapSearchResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  searchResult: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  searchResultText: {
    fontSize: 15,
    color: '#495057',
  },
  map: {
    flex: 1,
  },
  mapButtonsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  closeMapButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  closeMapButtonText: {
    color: '#495057',
    fontSize: 15,
    fontWeight: '600',
  },
  selectLocationButton: {
    flex: 1,
    backgroundColor: '#228BE6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectLocationButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 4,
    marginBottom: 24,
  },
  imageWrapper: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  removeButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DEE2E6',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 24,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#228BE6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
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
  updateButtonLoading: {
    width: 20,
    height: 20,
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
    opacity: 0.8,
  },
  errorText: {
    color: '#FA5252',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  
  },
});

export default React.memo(EditTravelPost, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});
