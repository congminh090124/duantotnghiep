import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Platform, 
  Dimensions,
  Animated,
  TextInput,
  FlatList,
  Keyboard,
  Alert
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getAllTravelPosts } from '../../apiConfig';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Image as ExpoImage } from 'expo-image';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [locationNames, setLocationNames] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasSearchResult, setHasSearchResult] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        await fetchPosts();
      } catch (error) {
        console.error('Error in useEffect:', error);
        setErrorMsg('Error initializing map');
      }
    })();
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      const result = await getAllTravelPosts();
      console.log('Travel Posts Data:', JSON.stringify(result, null, 2));
      if (Array.isArray(result)) {
        setPosts(result);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setErrorMsg('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  }, []);

  const animateToLocation = (latitude, longitude) => {
    mapRef.current?.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }, 1000);
  };

  const getLocationName = async (latitude, longitude) => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      if (result && result[0]) {
        const location = result[0];
        return [
          location.street,
          location.district,
          location.city,
          location.region,
          location.country
        ].filter(Boolean).join(', ');
      }
      return 'Không xác định';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Không xác định';
    }
  };

  useEffect(() => {
    const fetchLocationNames = async () => {
      const names = {};
      for (const post of posts) {
        if (post.currentLocation?.coordinates && post.destination?.coordinates) {
          const currentName = await getLocationName(
            post.currentLocation.coordinates[1],
            post.currentLocation.coordinates[0]
          );
          const destinationName = await getLocationName(
            post.destination.coordinates[1],
            post.destination.coordinates[0]
          );
          names[post._id] = {
            current: currentName,
            destination: destinationName
          };
        }
      }
      setLocationNames(names);
    };

    fetchLocationNames();
  }, [posts]);

  const PostDetailModal = ({ post, visible, onClose }) => {
    if (!post) return null;
    
    const handleShowDestination = () => {
      if (post.destination?.coordinates) {
        setSelectedDestination({
          latitude: post.destination.coordinates[1],
          longitude: post.destination.coordinates[0],
          title: locationNames[post._id]?.destination || 'Đang tải...',
          username: post.author?.username || 'Anonymous'
        });
        onClose();
        animateToLocation(post.destination.coordinates[1], post.destination.coordinates[0]);
      }
    };

    const handleUserPress = () => {
      onClose();
      navigation.navigate('UserProfile', { 
        userId: post.author?.id || post.author?._id 
      });
    };
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.imageSlider}>
                <ScrollView horizontal pagingEnabled>
                  {post.images?.map((image, index) => (
                    <ExpoImage
                      key={index}
                      source={{ uri: image }}
                      style={styles.postImage}
                      contentFit="cover"
                    />
                  ))}
                </ScrollView>
              </View>
              <View style={styles.postContent}>
                <Text style={styles.postTitle}>{post.title || 'Untitled'}</Text>
                
                <TouchableOpacity 
                  style={styles.authorSection}
                  onPress={handleUserPress}
                >
                  <ExpoImage
                    source={{ 
                      uri: post.author?.avatar || 'https://via.placeholder.com/50'
                    }}
                    style={styles.authorAvatar}
                    contentFit="cover"
                  />
                  <View>
                    <Text style={styles.authorName}>
                      {post.author?.username || 'Anonymous'}
                    </Text>
                    <Text style={styles.authorBio} numberOfLines={2}>
                      {post.author?.bio}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.postDescription}>
                  {post.description}
                </Text>
                <Text style={styles.postDate}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date not available'}
                </Text>
                {post.destination?.coordinates && (
                  <View style={styles.locationInfo}>
                    <View style={styles.locationItem}>
                      <MaterialIcons name="location-on" size={24} color="#666" />
                      <Text style={styles.locationText}>
                        Vị trí hiện tại: {locationNames[post._id]?.current || 'Đang tải...'}
                      </Text>
                    </View>
                    <View style={styles.locationItem}>
                      <MaterialIcons name="flag" size={24} color="#666" />
                      <Text style={styles.locationText}>
                        Điểm đến: {locationNames[post._id]?.destination || 'Đang tải...'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.showDestinationButton}
                      onPress={handleShowDestination}
                    >
                      <MaterialIcons name="place" size={24} color="#fff" />
                      <Text style={styles.showDestinationText}>Xem điểm đến</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
            'x-rapidapi-key': '057cd37262msh2a608699c67234ap104731jsn4fa717c7768d',
            'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
          }
        };

        const response = await axios.get(url, options);
        setSearchResults(response.data.predictions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (error.response?.status === 429) {
          Alert.alert(
            'Thông báo',
            'Đã vượt quá giới hạn tìm kiếm. Vui lòng thử lại sau ít phút.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Lỗi',
            'Không thể tìm kiếm địa điểm. Vui lòng thử lại sau.',
            [{ text: 'OK' }]
          );
        }
        setSearchResults([]);
        setShowSuggestions(false);
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
          'x-rapidapi-key': '057cd37262msh2a608699c67234ap104731jsn4fa717c7768d',
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      });

      const result = response.data.result;
      const { lat, lng } = result.geometry.location;
      
      animateToLocation(lat, lng);
      setSearchQuery(result.name);
      setShowSuggestions(false);
      setHasSearchResult(true);
      setIsMapReady(true);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error fetching place details:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin địa điểm');
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item.place_id)}
    >
      <Ionicons name="location-outline" size={20} color="#666" />
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
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
        initialRegion={{
          latitude: location?.coords?.latitude || 16.0544,
          longitude: location?.coords?.longitude || 108.2242,
          latitudeDelta: 8.0,
          longitudeDelta: 8.0,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {posts.map((post, index) => {
          if (!post?.currentLocation?.coordinates) return null;
          
          return (
            <Marker
              key={post._id || post.id || `post-${index}`}
              coordinate={{
                latitude: post.currentLocation.coordinates[1] || 0,
                longitude: post.currentLocation.coordinates[0] || 0
              }}
              onPress={() => {
                setSelectedPost(post);
                setModalVisible(true);
              }}
            >
              <Animated.View style={[
                styles.markerContainer,
                selectedPost?._id === post._id && styles.selectedMarker
              ]}>
                <ExpoImage
                  source={{ 
                    uri: post.author?.avatar || 'https://via.placeholder.com/44'
                  }}
                  style={styles.markerAvatar}
                  contentFit="cover"
                  placeholder={require('../../assets/default-avatar.png')}
                />
                <Text style={styles.markerUsername}>
                  {post.author?.username || 'Anonymous'}
                </Text>
              </Animated.View>
            </Marker>
          );
        })}
        {selectedDestination && (
          <Marker
            coordinate={{
              latitude: selectedDestination.latitude,
              longitude: selectedDestination.longitude
            }}
            onPress={() => animateToLocation(selectedDestination.latitude, selectedDestination.longitude)}
          >
            <View style={styles.destinationMarker}>
              <MaterialIcons name="place" size={40} color="#FF4444" />
              <View style={styles.destinationLabel}>
                <Text style={styles.destinationUsername}>
                  {selectedDestination.username}
                </Text>
                <Text style={styles.destinationText}>
                  {selectedDestination.title}
                </Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>
      <PostDetailModal
        post={selectedPost}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPost(null);
        }}
      />
      {selectedDestination && (
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => setSelectedDestination(null)}
        >
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  // Style cho marker trên bản đồ
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  markerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  markerUsername: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    maxWidth: 120,
    textAlign: 'center',
  },
  // Style cho Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: height * 0.8,
    paddingTop: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalScroll: {
    flex: 1,
  },
  imageSlider: {
    height: height * 0.3,
    width: '100%',
  },
  postImage: {
    width: width,
    height: '100%',
  },
  postContent: {
    padding: 20,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 14,
    color: '#666',
    maxWidth: width - 120,
  },
  postDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  postDate: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  // Loading và Error styles
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  // Thêm animation cho marker khi được chọn
  selectedMarker: {
    transform: [{ scale: 1.2 }],
  },
  // Style cho loading indicator
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  showDestinationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  showDestinationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  destinationMarker: {
    alignItems: 'center',
  },
  destinationLabel: {
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    padding: 8,
    borderRadius: 8,
    marginTop: -5,
    maxWidth: 200,
  },
  destinationUsername: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  destinationText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  resetButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF4444',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationInfo: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginVertical: 10,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  markerLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  markerLocation: {
    color: '#fff',
    fontSize: 11,
    textAlign: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  searchBarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    padding: 5,
  },
  suggestionList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default MapScreen;