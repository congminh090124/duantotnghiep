import React, { useState, useEffect } from 'react';
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
  Animated 
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getAllTravelPosts } from '../../apiConfig';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
        await fetchMapPosts();
      } catch (error) {
        console.error('Error in useEffect:', error);
        setErrorMsg('Error initializing map');
      }
    })();
  }, []);

  const fetchMapPosts = async () => {
    try {
      const result = await getAllTravelPosts();
      if (result && Array.isArray(result)) {
        setPosts(result);
      } else {
        console.error('Invalid posts data:', result);
        setErrorMsg('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setErrorMsg('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const PostDetailModal = ({ post, visible, onClose }) => {
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
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            <ScrollView style={styles.modalScroll}>
              <View style={styles.imageSlider}>
                <ScrollView horizontal pagingEnabled>
                  {post.images?.map((image, index) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={styles.postImage}
                      resizeMode="cover"
                     
                    />
                  ))}
                </ScrollView>
              </View>
              <View style={styles.postContent}>
                <Text style={styles.postTitle}>{post.title || 'Untitled'}</Text>
                
                <TouchableOpacity 
                  style={styles.authorSection}
                  onPress={() => {
                    onClose();
                    navigation.navigate('UserProfile', { userId: post.author?.id });
                  }}
                >
                  <Image
                    source={{ 
                      uri: post.author?.avatar || 'https://via.placeholder.com/50'
                    }}
                    style={styles.authorAvatar}
                    defaultSource={require('../../assets/default-avatar.png')}
                  />
                  <View>
                    <Text style={styles.authorName}>
                      {post.author?.username || 'Anonymous'}
                    </Text>
                    <Text style={styles.authorBio} numberOfLines={2}>
                      {post.author?.bio || 'No bio available'}
                    </Text>
                  </View>
                </TouchableOpacity>
                <Text style={styles.postDescription}>
                  {post.description || 'No description available'}
                </Text>
                <Text style={styles.postDate}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Date not available'}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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
      <MapView
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
                <Image
                  source={{ 
                    uri: post.author?.avatar || 'https://via.placeholder.com/44'
                  }}
                  style={styles.markerAvatar}
                  defaultSource={require('../../assets/default-avatar.png')}
                />
                <Text style={styles.markerUsername}>
                  {post.author?.username || 'Anonymous'}
                </Text>
              </Animated.View>
            </Marker>
          );
        })}
      </MapView>
      <PostDetailModal
        post={selectedPost}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPost(null);
        }}
      />
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
});

export default MapScreen;