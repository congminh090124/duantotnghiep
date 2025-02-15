import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { View, Image, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, RefreshControl, Alert, PixelRatio, TextInput, Animated } from 'react-native';
import Swiper from 'react-native-swiper';
import { Heart, MessageCircle, Users, Search } from 'react-native-feather';
import { getAllTravelPosts, API_ENDPOINTS, toggleLikeTravelPost } from '../../apiConfig';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getLocationNameFromCoords } from '../service/geocoding';
import { memo } from 'react';
import { Image as ExpoImage } from 'expo-image';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 115 : -60;
const ITEM_HEIGHT = SCREEN_HEIGHT - BOTTOM_TAB_HEIGHT;


const scale = SCREEN_WIDTH / 320; 
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Thêm component ImageRenderer được tối ưu hóa
const ImageRenderer = memo(({ image }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageStyle = useMemo(() => ({
    ...styles.image,
    backgroundColor: '#1a1a1a',
    opacity: imageLoaded ? 1 : 0,
  }), [imageLoaded]);

  return (
    <View style={styles.imageWrapper}>
      <ExpoImage
        source={image}
        style={imageStyle}
        contentFit="cover"
        transition={300}
        onLoadEnd={() => setImageLoaded(true)}
        cachePolicy="memory-disk"
      />
      {!imageLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
    </View>
  );
});

const UserImages = React.memo(({ post }) => {
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
      userId: post.author._id,
      userName: post.author.username,
      userAvatar: post.author.avatar,
      blockStatus: {
        isBlocked: false,
        isBlockedBy: false,
        canMessage: true
      }
    });
  }, [navigation, post.author]);
  const handleTravelTogether = useCallback(() => {
    Alert.alert(
      "Thông báo",
      "Chức năng này đang được phát triển và sẽ sớm ra mắt!",
      [
        { text: "OK", onPress: () => console.log("OK Pressed") }
      ]
    );
  }, []);

  useEffect(() => {
    if (post.images && post.images.length > 0) {
      Promise.all(post.images.map(imagePath => Image.prefetch(imagePath)))
        .then(() => setImagesLoaded(true))
        .catch(error => console.error('Failed to load images:', error));
    } else {
      setImagesLoaded(true);
    }
  }, [post.images]);

  const renderImages = useMemo(() => {
    if (!post.images || post.images.length === 0) {
      return (
        <View style={styles.slide}>
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      );
    }

    return post.images.map((image, index) => (
      <View key={index} style={styles.slide}>
        <ImageRenderer image={image} />
      </View>
    ));
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
        showsButtons={false}
        containerStyle={styles.swiperContainer}
        loadMinimal={true}
        loadMinimalSize={2}
        showsPagination={true}
        paginationStyle={styles.paginationStyle}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
        horizontal={true}
        removeClippedSubviews={true}
      >
        {renderImages}
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
});

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
    const loadLocations = async () => {
      try {
        // Xử lý vị trí hiện tại
        if (post.currentLocation?.coordinates) {
          const currentLocationName = await getLocationNameFromCoords(post.currentLocation.coordinates);
          setLocationNames(prev => ({
            ...prev,
            current: currentLocationName
          }));
        } else {
          setLocationNames(prev => ({
            ...prev,
            current: 'Chưa cập nhật'
          }));
        }

        // Xử lý điểm đến
        if (post.destination?.coordinates) {
          const destinationName = await getLocationNameFromCoords(post.destination.coordinates);
          setLocationNames(prev => ({
            ...prev,
            destination: destinationName
          }));
        } else {
          setLocationNames(prev => ({
            ...prev,
            destination: 'Chưa cập nhật'
          }));
        }
      } catch (error) {
        console.error('Error loading locations:', error);
        setLocationNames({
          current: 'Không thể tải vị trí',
          destination: 'Không thể tải vị trí'
        });
      }
    };

    loadLocations();
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
              source={{ 
                uri: post.author.avatar || 'https://via.placeholder.com/50'
              }} 
              style={styles.authorAvatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author.username}</Text>
              {post.author.age && (
                <Text style={styles.authorAge}>{post.author.age} tuổi</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ExpandableTitle title={post.title} />
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {new Date(post.startDate).toLocaleDateString('vi-VN')} - {new Date(post.endDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>

        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#2ecc71" />
            <Text style={styles.locationText} numberOfLines={1}>
              Từ: {locationNames.current}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Ionicons name="navigate" size={14} color="#e74c3c" />
            <Text style={styles.locationText} numberOfLines={1}>
              Đến: {locationNames.destination}
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

const ExpandableTitle = React.memo(({ title }) => {
  const [expanded, setExpanded] = useState(false);
  const maxLines = 2;

  return (
    <TouchableOpacity 
      style={styles.titleContainer}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.postTitle,
          expanded && styles.expandedTitle
        ]}
        numberOfLines={expanded ? undefined : maxLines}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
});

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

const MainScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();
  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await getAllTravelPosts();
      // console.log('Fetched travel posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('TravelSearch')}
        >
          <Search stroke="white" width={20} height={20} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm...</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={({ item }) => <UserImages post={item} />}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
        contentContainerStyle={[
          styles.flatListContent,
          { paddingBottom: 0 }
        ]}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        windowSize={5}
        initialNumToRender={2}
      />
    </View>
  );
};

const TrangTimBanDuLich = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getAllTravelPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
    };

    const dimensionsHandler = Dimensions.addEventListener('change', updateLayout);

    return () => {
      dimensionsHandler.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => navigation.navigate('TravelSearch')}
        >
          <Search stroke="white" width={20} height={20} />
          <Text style={styles.searchPlaceholder}>Tìm kiếm...</Text>
        </TouchableOpacity>
      </View>
      <MainScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: '#000',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  swiperContainer: {
    width: SCREEN_WIDTH,
    height: ITEM_HEIGHT,
  },
  wrapper: {},
  slide: {
    width: SCREEN_WIDTH,
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    ...Platform.select({
      ios: {
        backfaceVisibility: 'hidden',
        transform: [{ perspective: 1000 }],
      },
    }),
  },
  noImageText: {
    color: '#fff',
    fontSize: 16,
  },

  userInfo: {
    // Styles for user info container
  },
  userName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: '2%',
  },
  userAge: {
    color: '#fff',
    fontSize: 14,
  },
  userLocation: {
    color: '#fff',
    fontSize: 14,
  },
  userDestination: {
    color: '#fff',
    fontSize: 14,
  },
  userDescription: {
    color: '#fff',
    fontSize: 16,
    marginTop: '3%',
  },
  userInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: '3%',
  },
  hobby: {
    color: '#fff',
    fontSize: 14,
    marginRight: '3%',
    marginBottom: '2%',
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: Platform.OS === 'ios' ? 12 : 10,
    bottom: Platform.OS === 'ios' ? '40%' : '35%',
    alignItems: 'center',
    padding: 0,
    zIndex: 1000,
  },
 
  loadingContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', 
  },
  feedItem: {
    padding: 15,
    backgroundColor: '#000', 
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  feedTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedAuthor: {
    color: '#fff',
    fontSize: 14,
  },
  feedDate: {
    color: '#888',
    fontSize: 12,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 20 : 120,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchPlaceholder: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  postContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
 
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  authorName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  postTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    lineHeight: 28,
  },
  dateContainer: {
   
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 12,
  },
  locationContainer: {
    marginBottom: 12,
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  interestTag: {
   
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
  },
  
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
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
  likeCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    left: 23,
  },

  postContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    zIndex: 2, 
  },
  overlayContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 55 :50, // Reduced from 100/60 to 20/10
    
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.7, // 70% of screen height for gradient
    width: SCREEN_WIDTH,
  },
  contentWrapper: {
    width: SCREEN_WIDTH,
    padding: 15,
  
    paddingBottom: 25,
    marginBottom: -10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 5,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  authorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  postTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  locationContainer: {
    marginBottom: 10,
    gap: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  interestTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  interestText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  overlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
  },
  paginationStyle: {
    bottom: '15%',
    right: 0,
    flexDirection: 'row',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
    paddingLeft: 10,
    zIndex: 999,
    width: '100%',
  },
  
  dotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 255, 255, 0.5)',
    marginLeft: 4,
    marginRight: 4,
  },
  
  activeDotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FFFF',
    marginLeft: 4,
    marginRight: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  authorInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  
  authorAge: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  flatListContent: {
    flexGrow: 1,
  },
  postTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    lineHeight: 28,
  },
  
  
  titleContainer: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  
  postTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700', 
    lineHeight: 28, 
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  expandedTitle: {
    marginBottom: 4,
  },
});

export default TrangTimBanDuLich;