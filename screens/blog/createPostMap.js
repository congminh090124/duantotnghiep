import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { createPost, getUserProfile } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';

const PostCreationScreen = () => {
  const [title, setTitle] = useState('');
  const [image, setImages] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationDisplay, setLocationDisplay] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    location: '',
    images: ''
  });
  
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getUserProfile();
        //console.log('User profile data:', data);
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

  const getCurrentLocation = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access location was denied');
      return;
    }
  
    try {
      let location = await Location.getCurrentPositionAsync({});
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
  }, []);

  const avatarUri = useMemo(() => profileData?.anh_dai_dien || null, [profileData?.anh_dai_dien]);

  const optimizeImage = useCallback(async (uri) => {
    try {
      const manipulatedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return uri;
    }
  }, []);

  const handleAddImages = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],  // Sử dụng MediaType thay vì MediaTypeOptions
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (!result.canceled && result.assets) {
      const optimizedImages = await Promise.all(
        result.assets.map(asset => optimizeImage(asset.uri))
      );
      setImages(prevImages => [...prevImages, ...optimizedImages]);
    }
  }, [optimizeImage]);

  const handleRemoveImage = useCallback((index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      location: '',
      images: ''
    };

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề bài viết';
      isValid = false;
    } else if (title.length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
      isValid = false;
    }

    if (!location) {
      newErrors.location = 'Vui lòng chọn vị trí';
      isValid = false;
    }

    if (image.length === 0) {
      newErrors.images = 'Vui lòng thêm ít nhất 1 hình ảnh';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handlePost = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
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

      const [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));

      const postData = {
        title: title.trim(),
        location: {
          coordinates: [longitude, latitude]
        },
        image: optimizedImages
      };

      await createPost(postData);
      Alert.alert('Thành công', 'Bài viết đã được đăng thành công');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Lỗi', 'Không thể đăng bài viết. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [title, location, image, optimizeImage, navigation]);

  const renderImageItem = useCallback(({ item, index }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item }} style={styles.postImage} />
      <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
        <Ionicons name="close-circle" size={24} color="white" />
      </TouchableOpacity>
    </View>
  ), [handleRemoveImage]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => {
                if (title || image.length > 0) {
                  Alert.alert(
                    'Xác nhận',
                    'Bạn có chắc muốn hủy tạo bài viết?',
                    [
                      { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
                      { text: 'Hủy bài viết', style: 'destructive', onPress: () => navigation.goBack() }
                    ]
                  );
                } else {
                  navigation.goBack();
                }
              }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tạo bài viết</Text>
            <TouchableOpacity 
              style={[styles.postButton, isLoading && styles.postButtonDisabled]} 
              onPress={handlePost}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Đăng</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profilePic} />
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

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.titleInput, errors.title && styles.inputError]}
              placeholder="Tiêu đề bài viết"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors({...errors, title: ''});
              }}
              multiline
            />
            {errors.title ? (
              <Text style={styles.errorText}>{errors.title}</Text>
            ) : null}
          </View>

          <FlatList
            data={image}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            style={styles.imageList}
            ListFooterComponent={
              <View>
                <TouchableOpacity style={styles.addImageButton} onPress={handleAddImages}>
                  <Ionicons name="image-outline" size={24} color="#1877f2" />
                  <Text style={styles.addImageText}>Thêm hình ảnh</Text>
                </TouchableOpacity>
                {errors.images ? (
                  <Text style={[styles.errorText, styles.imageErrorText]}>{errors.images}</Text>
                ) : null}
              </View>
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  titleInput: {
    minHeight: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#1877f2',
    opacity: 0.8,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
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
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    marginHorizontal: 10,
    marginTop: 10,
  },
  addImageText: {
    color: '#1877f2',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
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
  inputContainer: {
    marginHorizontal: 10,
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  imageErrorText: {
    textAlign: 'center',
    marginTop: 10,
  },
});

export default React.memo(PostCreationScreen);