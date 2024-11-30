import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Dimensions,
  Platform 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllTravelPosts } from '../../apiConfig';

const { width, height } = Dimensions.get('window');

const VIETNAM_REGION = {
  latitude: 16.0544,
  longitude: 108.2242,
  latitudeDelta: 8.0,
  longitudeDelta: 8.0,
};

const INITIAL_CAMERA = {
  center: {
    latitude: VIETNAM_REGION.latitude,
    longitude: VIETNAM_REGION.longitude,
  },
  pitch: 0,
  heading: 0,
  zoom: 6.5,
};

const getLocationName = async (coordinates) => {
  if (!coordinates) return 'Không xác định';
  
  try {
    const [longitude, latitude] = coordinates;
    const location = await Location.reverseGeocodeAsync({
      latitude,
      longitude
    });

    if (location && location[0]) {
      const { city, region, country } = location[0];
      const parts = [city, region, country].filter(Boolean);
      return parts.join(', ');
    }
    return 'Không xác định';
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Không xác định';
  }
};

const MapMarker = memo(({ post, onPress, isSelected }) => {
  if (!post?.currentLocation?.coordinates) return null;

  const [latitude, longitude] = [
    post.currentLocation.coordinates[1],
    post.currentLocation.coordinates[0]
  ];

  // Validate coordinates
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) return null;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(post)}
      tracksViewChanges={false} // Performance optimization
    >
      <View style={[styles.markerContainer, isSelected && styles.selectedMarker]}>
        <Image
          source={{ 
            uri: post.author?.avatar,
            cache: 'force-cache' // Performance optimization
          }}
          style={styles.markerAvatar}
          defaultSource={require('../../assets/default-avatar.png')}
        />
        <Text numberOfLines={1} style={styles.markerUsername}>
          {post.author?.username || 'Anonymous'}
        </Text>
      </View>
    </Marker>
  );
});

const PostDetailModal = memo(({ post, visible, onClose, onDestinationPress }) => {
  const [destinationName, setDestinationName] = useState('Đang tải...');
  
  useEffect(() => {
    const loadLocationName = async () => {
      if (post?.destination?.coordinates) {
        const name = await getLocationName(post.destination.coordinates);
        setDestinationName(name);
      }
    };
    
    loadLocationName();
  }, [post]);

  if (!post) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <ScrollView style={styles.modalScroll}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              style={styles.imageSlider}
            >
              {post.images?.map((image, index) => (
                <Image
                  key={`image-${index}`}
                  source={{ uri: image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.postContent}>
              <Text style={styles.postTitle}>
                {post.title}
              </Text>
              
              {post?.destination?.coordinates && (
                <TouchableOpacity 
                  style={styles.destinationButton}
                  onPress={() => onDestinationPress(post.destination.coordinates)}
                >
                  <View style={styles.destinationContent}>
                    <MaterialIcons name="place" size={24} color="#FF385C" />
                    <View style={styles.destinationTextContainer}>
                      <Text style={styles.destinationLabel}>Điểm đến:</Text>
                      <Text style={styles.destinationText}>
                        {destinationName}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#666" />
                  </View>
                </TouchableOpacity>
              )}
              
              <View style={styles.authorSection}>
                <Image
                  source={{ 
                    uri: post.author?.avatar,
                    cache: 'force-cache'
                  }}
                  style={styles.authorAvatar}
                  defaultSource={require('../../assets/default-avatar.png')}
                />
                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>
                    {post.author?.username || 'Anonymous'}
                  </Text>
                  <Text style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const MapScreen = () => {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const initializeLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Vui lòng cấp quyền truy cập vị trí');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(coords);

      // Animate to user location
      mapRef.current?.animateCamera({
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        zoom: 12,
        duration: 1000,
      });

    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg('Không thể lấy vị trí hiện tại');
    }
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

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        initializeLocation(),
        fetchPosts()
      ]);
    };
    initialize();
  }, [initializeLocation, fetchPosts]);

  const handleMarkerPress = useCallback((post) => {
    setSelectedPost(post);
    setModalVisible(true);

    // Animate to marker location
    const markerCoords = post?.currentLocation?.coordinates;
    if (markerCoords && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: markerCoords[1],
          longitude: markerCoords[0],
        },
        zoom: 15,
        duration: 500,
      });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedPost(null);
  }, []);

  const handleMapReady = useCallback(() => {
    if (Platform.OS === 'android') {
      // Fix for Android map not showing markers initially
      mapRef.current?.fitToElements(true);
    }
  }, []);

  const handleDestinationPress = useCallback((coordinates) => {
    if (coordinates && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: coordinates[1],
          longitude: coordinates[0],
        },
        zoom: 15,
        duration: 1000,
      });
      setModalVisible(false);
    }
  }, []);

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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            setErrorMsg(null);
            setLoading(true);
            fetchPosts();
          }}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialCamera={INITIAL_CAMERA}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        loadingEnabled
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#ffffff"
        onMapReady={handleMapReady}
      >
        {posts.map((post) => (
          <MapMarker
            key={post._id}
            post={post}
            onPress={handleMarkerPress}
            isSelected={selectedPost?._id === post._id}
          />
        ))}
      </MapView>

      <PostDetailModal
        post={selectedPost}
        visible={modalVisible}
        onClose={handleCloseModal}
        onDestinationPress={handleDestinationPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  markerContainer: {
    alignItems: 'center',
    width: 100,
    padding: 2,
  },
  selectedMarker: {
    transform: [{ scale: 1.1 }],
  },
  markerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  markerUsername: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.75,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  modalScroll: {
    flex: 1,
  },
  imageSlider: {
    height: height * 0.4,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    lineHeight: 28,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 13,
    color: '#666666',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  destinationButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
  },
  destinationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  destinationTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  destinationLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});

export default memo(MapScreen);