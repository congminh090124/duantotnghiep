import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image, TouchableOpacity, Modal, ScrollView, Platform, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, getAllTravelPosts } from '../../apiConfig';
import { MaterialIcons } from '@expo/vector-icons';

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();

    fetchMapPosts();
  }, []);

  const fetchMapPosts = async () => {
    try {
      const result = await getAllTravelPosts();
      setPosts(result);
    } catch (error) {
      setErrorMsg('Không thể tải bài viết');
      console.error(error);
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
                  {post.images.map((image, index) => (
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
                <Text style={styles.postTitle}>{post.title}</Text>
                
                <TouchableOpacity 
                  style={styles.authorSection}
                  onPress={() => {
                    onClose();
                    navigation.navigate('UserProfile', { userId: post.author.id });
                  }}
                >
                  <Image
                    source={{ uri: post.author.avatar }}
                    style={styles.authorAvatar}
                  />
                  <View>
                    <Text style={styles.authorName}>{post.author.username}</Text>
                    <Text style={styles.authorBio} numberOfLines={2}>{post.author.bio}</Text>
                  </View>
                </TouchableOpacity>

                <Text style={styles.postDescription}>{post.description}</Text>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
          latitude: location?.coords.latitude || 21.0285,
          longitude: location?.coords.longitude || 105.8542,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {posts.map((post, index) => (
          <Marker
            key={post._id || post.id || `post-${index}`}
            coordinate={{
              latitude: post.currentLocation?.coordinates[1] || 0,
              longitude: post.currentLocation?.coordinates[0] || 0
            }}
            onPress={() => {
              setSelectedPost(post);
              setModalVisible(true);
            }}
          >
            <View style={styles.markerContainer}>
              <Image
                source={{ uri: post.author?.avatar }}
                style={styles.markerAvatar}
              />
              <Text style={styles.markerUsername}>{post.author?.username}</Text>
            </View>
          </Marker>
        ))}
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

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#2B6CB0',
  secondary: '#F0F7FF',
  text: {
    primary: '#1A202C',
    secondary: '#4A5568',
    light: '#718096'
  },
  background: {
    main: '#FFFFFF',
    secondary: '#F7FAFC',
    overlay: 'rgba(0,0,0,0.6)'
  },
  border: '#E2E8F0',
  shadow: '#000000'
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.main,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 24,
  },
  
  // Marker Styles
  markerContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background.main,
    padding: 4,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  markerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  markerUsername: {
    backgroundColor: COLORS.background.overlay,
    color: COLORS.background.main,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    overflow: 'hidden',
    maxWidth: 100,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.main,
    minHeight: height * 0.7,
    maxHeight: height * 0.9,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    padding: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modalScroll: {
    flex: 1,
  },

  // Image Slider Styles
  imageSlider: {
    height: height * 0.35,
    backgroundColor: COLORS.background.secondary,
  },
  postImage: {
    width: width,
    height: height * 0.35,
  },
  
  // Post Content Styles
  postContent: {
    padding: 20,
  },
  postTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
    lineHeight: 34,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  authorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  authorName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  authorBio: {
    fontSize: 14,
    color: COLORS.text.secondary,
    maxWidth: width - 140,
    lineHeight: 20,
  },
  postDescription: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text.secondary,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  postDate: {
    fontSize: 14,
    color: COLORS.text.light,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
export default MapScreen;