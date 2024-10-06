import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { createPost, getUserProfile } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'https://lacewing-evolving-generally.ngrok-free.app';
const PostCreationScreen = () => {
  const [title, setTitle] = useState('');

  const [image, setImages] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const navigation = useNavigation();

  const getLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
  
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
  
      const isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationServicesEnabled) {
        setLocationError('Location services are disabled');
        return;
      }
  
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      });
  
      setLocation(location.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Error getting location. Please try again.');
    } finally {
      setIsLoadingLocation(false);
    }
  };
  
  useEffect(() => {
    const fetchUserProfileAndLocation = async () => {
      try {
        const [profileData] = await Promise.all([
          getUserProfile(),
          getLocation(),
        ]);
        setProfileData(profileData);
      } catch (error) {
        console.error('Error fetching user profile or location:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserProfileAndLocation();
  }, []);
  
  
  const avatarUri = useMemo(() => {
    return profileData?.anh_dai_dien
      ? `${API_BASE_URL}${profileData.anh_dai_dien}`
      : null;
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

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề bài viết.');
      return;
    }
  
    if (!location) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí. Vui lòng thử lại.');
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
  
      const postData = {
        title: title.trim(),
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude]
        },
        image: optimizedImages,
      };
  
      console.log('Sending post data:', postData);
  
      const result = await createPost(postData);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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

            <TextInput
              style={styles.titleInput}
              placeholder="Tiêu đề bài viết"
              value={title}
              onChangeText={setTitle}
            />



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
});

export default PostCreationScreen;