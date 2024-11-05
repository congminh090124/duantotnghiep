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
  FlatList
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
const RAPID_API_KEY = 'f2a097fff0mshc9e7deae19d8053p11d780jsn906b698f08d0';

const EditTravelPost = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { post } = route.params;
  const [title, setTitle] = useState(post.title);
  const [startDate, setStartDate] = useState(new Date(post.startDate));
  const [endDate, setEndDate] = useState(new Date(post.endDate));
  const [destination, setDestination] = useState(post.destination);
  const [destinationName, setDestinationName] = useState(post.destinationName);
  const [images, setImages] = useState(post.images);
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

  const handleUpdatePost = async () => {
    setIsLoading(true);
    try {
      const updatedPost = await editTravelPost(post._id, {
        title,
        startDate,
        endDate,
        destinationLat: destination.coordinates[1],
        destinationLng: destination.coordinates[0],
        destinationName,
        images
      });
      setIsLoading(false);
      Alert.alert('Thành công', 'Bài viết đã được cập nhật');
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể cập nhật bài viết');
    }
  };

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

  const removeImage = (index) => {
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
              const newImages = images.filter((_, i) => i !== index);
              const response = await editTravelPost(post._id, {
                images: newImages,
                imagesToDelete: [imageToRemove],
              });
  
              if (response && response.travelPost) {
                setImages(response.travelPost.images);
                Alert.alert('Thành công', 'Hình ảnh đã được xóa');
              }
            } catch (error) {
              console.error('Lỗi khi xóa hình ảnh:', error);
              Alert.alert('Lỗi', 'Không thể xóa hình ảnh. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

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
          'x-rapidapi-key': 'YOUR_RAPIDAPI_KEY',
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

  const debouncedMapSearch = useCallback(
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
          style={styles.updateButton}
          onPress={handleUpdatePost}
        >
          <Text style={styles.updateButtonText}>Cập nhật bài viết</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: inputWidth,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateWrapper: {
    width: inputWidth / 2 - 10,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeMapButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  closeMapButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  imageWrapper: {
    width: (inputWidth - 30) / 3,
    height: (inputWidth - 30) / 3,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    width: (inputWidth - 30) / 3,
    height: (inputWidth - 30) / 3,
    margin: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 30,
    color: '#888',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  mapSearchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
  },
  mapSearchInput: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  mapSearchResults: {
    backgroundColor: 'white',
    marginTop: 5,
    borderRadius: 8,
    maxHeight: 200,
  },
  mapSearchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapSearchResultText: {
    fontSize: 16,
    color: '#333',
  },
  mapButtonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectLocationButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectLocationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default React.memo(EditTravelPost);
