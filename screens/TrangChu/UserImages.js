import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity, ActivityIndicator, Platform, Alert, PixelRatio, StatusBar } from 'react-native';
import Swiper from 'react-native-swiper';
import { Heart, MessageCircle, Users } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { toggleLikeTravelPost } from '../../apiConfig';

// Constants for layout calculations
const STATUSBAR_HEIGHT = Platform.OS === 'ios' 
  ? 44 
  : StatusBar.currentHeight || 0;

const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' 
  ? 83 
  : 60;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale calculation based on screen size
const scale = SCREEN_WIDTH / 320;
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

const ActionButtons = React.memo(({ 
  isLiked, 
  likeCount, 
  onLike, 
  onMessage, 
  onTravelTogether, 
  isLikeLoading 
}) => (
  <View style={styles.actionButtons}>
    <View style={styles.actionButtonContainer}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={onLike}
        disabled={isLikeLoading}
      >
        {isLikeLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Heart 
            stroke={isLiked ? "red" : "white"} 
            fill={isLiked ? "red" : "none"} 
            width={normalize(22)}
            height={normalize(22)}
          />
        )}
      </TouchableOpacity>
      <Text style={styles.likeCount}>{likeCount}</Text>
    </View>
    <TouchableOpacity style={styles.actionButton} onPress={onMessage}>
      <MessageCircle 
        stroke="white" 
        width={normalize(22)}
        height={normalize(22)}
      />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onTravelTogether}>
      <Users 
        stroke="white" 
        width={normalize(22)}
        height={normalize(22)}
      />
    </TouchableOpacity>
  </View>
));

const UserInfo = React.memo(({ post }) => {
  const navigation = useNavigation();
  const [locationNames, setLocationNames] = useState({
    current: 'Đang tải...',
    destination: 'Đang tải...'
  });

  const handleAuthorPress = useCallback(() => {
    navigation.navigate('UserProfile', {
      userId: post.author._id,
      username: post.author.username,
      avatar: post.author.avatar
    });
  }, [navigation, post.author]);

  useEffect(() => {
    const getTranslatedLocationName = async (lat, lng, locationType) => {
      try {
        const [location] = await Location.reverseGeocodeAsync({ 
          latitude: lat, 
          longitude: lng 
        });
        
        const locationName = location ? 
          `${location.city || ''}, ${location.region || ''}, ${location.country || ''}` : 
          'Unknown location';

        setLocationNames(prev => ({
          ...prev,
          [locationType]: locationName
        }));
      } catch (error) {
        console.error('Error translating location:', error);
        setLocationNames(prev => ({
          ...prev,
          [locationType]: 'Unknown location'
        }));
      }
    };

    if (post.currentLocation?.coordinates) {
      getTranslatedLocationName(
        post.currentLocation.coordinates[1],
        post.currentLocation.coordinates[0],
        'current'
      );
    }
    
    if (post.destination?.coordinates) {
      getTranslatedLocationName(
        post.destination.coordinates[1],
        post.destination.coordinates[0],
        'destination'
      );
    }
  }, [post]);

  return (
    <View style={styles.overlayContainer}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
        pointerEvents="none"
      />
      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.authorContainer}
            onPress={handleAuthorPress}
            activeOpacity={0.7}
          >
            <Image 
              source={{ uri: post.author.avatar }} 
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author.username}</Text>
              {post.author.age && <Text style={styles.authorAge}>{post.author.age} tuổi</Text>}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.postTitle}>{post.title}</Text>
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {new Date(post.startDate).toLocaleDateString()} - {new Date(post.endDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#2ecc71" />
            <Text style={styles.locationText}>
              From: {locationNames.current}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="navigate" size={14} color="#e74c3c" />
            <Text style={styles.locationText}>
              To: {locationNames.destination}
            </Text>
          </View>
        </View>

        {post.interests && post.interests.length > 0 && (
          <View style={styles.interestsContainer}>
            {post.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>#{interest}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

const UserImages = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { id } = JSON.parse(userData);
          setCurrentUserId(id);
          setIsLiked(post.likes?.includes(id));
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    getCurrentUser();
  }, [post.likes]);

  const handleLike = async () => {
    if (isLikeLoading || !currentUserId) return;

    try {
      setIsLikeLoading(true);
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => newIsLiked ? prev + 1 : prev - 1);

      const response = await toggleLikeTravelPost(post._id);
      
      if (response.success) {
        setIsLiked(response.isLiked);
        setLikeCount(response.likesCount);
      } else {
        setIsLiked(!newIsLiked);
        setLikeCount(prev => newIsLiked ? prev - 1 : prev + 1);
        Alert.alert('Thông báo', response.message || 'Không thể thực hiện thao tác này');
      }
    } catch (error) {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleMessage = useCallback(() => {
    navigation.navigate('ChatScreen', {
      receiverId: post.author._id,
      receiverName: post.author.username,
      receiverAvatar: post.author.avatar
    });
  }, [navigation, post.author]);

  const handleTravelTogether = useCallback(() => {
    console.log('Muốn đi du lịch cùng', post.author.username);
  }, [post.author.username]);

  useEffect(() => {
    if (post.images && post.images.length > 0) {
      Promise.all(post.images.map(imagePath => Image.prefetch(imagePath)))
        .then(() => setImagesLoaded(true))
        .catch(error => console.error('Failed to load images:', error));
    } else {
      setImagesLoaded(true);
    }
  }, [post.images]);

  if (!imagesLoaded) {
    return (
      <View style={[styles.imageContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <Swiper
        loop={false}
        style={styles.wrapper}
        containerStyle={styles.swiperContainer}
        loadMinimal={true}
        loadMinimalSize={1}
        showsPagination={true}
        paginationStyle={styles.paginationStyle}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
      >
        {post.images && post.images.length > 0 ? (
          post.images.map((image, index) => (
            <View key={index} style={styles.slide}>
              <Image
                source={{ uri: image }}
                style={styles.image}
                resizeMode="contain"
                onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
              />
            </View>
          ))
        ) : (
          <View style={styles.slide}>
            <Text style={styles.noImageText}>No images available</Text>
          </View>
        )}
      </Swiper>
      <View style={styles.overlay}>
        <UserInfo post={post} />
      </View>
      <View style={styles.actionButtonsContainer}>
        <ActionButtons
          isLiked={isLiked}
          likeCount={likeCount}
          onLike={handleLike}
          onMessage={handleMessage}
          onTravelTogether={handleTravelTogether}
          isLikeLoading={isLikeLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    // Container styles
    imageContainer: {
      height: SCREEN_HEIGHT - STATUSBAR_HEIGHT - BOTTOM_TAB_HEIGHT,
      backgroundColor: '#000',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    // Swiper styles
    wrapper: {},
    swiperContainer: {
      flex: 1,
    },
    slide: {
      flex: 1,
      justifyContent: 'center',
    },
    image: {
      width: SCREEN_WIDTH,
      height: '100%',
    },
    noImageText: {
      color: '#fff',
      fontSize: normalize(16),
      textAlign: 'center',
    },
    
    // Pagination styles
    paginationStyle: {
      bottom: SCREEN_HEIGHT * 0.2,
    },
    dotStyle: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      marginHorizontal: 4,
    },
    activeDotStyle: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#fff',
      marginHorizontal: 4,
    },
    
    // Overlay styles
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    overlayContainer: {
      width: '100%',
      paddingBottom: 60,
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: SCREEN_HEIGHT * 0.6,
      zIndex: 1,
    },
    contentWrapper: {
      padding: 16,
      zIndex: 2,
    },
    
    // User info styles
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    authorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    authorAvatar: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: normalize(20),
      borderWidth: 2,
      borderColor: '#fff',
    },
    authorInfo: {
      marginLeft: 12,
    },
    authorName: {
      color: '#fff',
      fontSize: normalize(16),
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    authorAge: {
      color: '#fff',
      fontSize: normalize(14),
      opacity: 0.8,
      marginTop: 2,
    },
    
    // Post content styles
    postTitle: {
      color: '#fff',
      fontSize: normalize(18),
      fontWeight: '700',
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    dateContainer: {
      marginBottom: 8,
    },
    dateText: {
      color: '#fff',
      fontSize: normalize(14),
      opacity: 0.9,
    },
    
    // Location styles
    locationContainer: {
      marginBottom: 12,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 2,
    },
    locationText: {
      color: '#fff',
      fontSize: normalize(14),
      marginLeft: 6,
      opacity: 0.9,
    },
    
    // Interests styles
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    interestTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
    },
    interestText: {
      color: '#fff',
      fontSize: normalize(12),
    },
    
    // Action buttons styles
    actionButtonsContainer: {
      position: 'absolute',
      right: 16,
      bottom:'30%',
      zIndex: 3,
    },
    actionButtons: {
      alignItems: 'center',
    },
    actionButtonContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    actionButton: {
      width: normalize(44),
      height: normalize(44),
      borderRadius: normalize(22),
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    likeCount: {
      color: '#fff',
      fontSize: normalize(14),
      fontWeight: '600',
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });

export default UserImages;