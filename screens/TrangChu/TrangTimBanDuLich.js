import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, RefreshControl, Alert, PixelRatio } from 'react-native';
import Swiper from 'react-native-swiper';
import { Heart, MessageCircle, Users, Search } from 'react-native-feather';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getAllTravelPosts, API_ENDPOINTS, toggleLikeTravelPost } from '../../apiConfig';
import MapScreen from './MapScreen';
import Blog from '../blog/Blog';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TopTab = createMaterialTopTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Tính toán tỷ lệ scale dựa trên màn hình
const scale = SCREEN_WIDTH / 320; // Sử dụng 320 làm chuẩn
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

// Tính toán vị trí bottom cho actionButtonsContainer
const getBottomPosition = () => {
  if (Platform.OS === 'ios') {
    return SCREEN_HEIGHT > 800 ? '35%' : '30%'; // iPhone Plus vs Regular
  }
  return SCREEN_HEIGHT > 700 ? '40%' : '35%'; // Android Large vs Regular
};

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
      receiverId: post.author._id,
      receiverName: post.author.username,
      receiverAvatar: post.author.avatar
    });
  }, [navigation, post.author]);
  const handleTravelTogether = useCallback(() => console.log('Muốn đi du lịch cùng', post.author.username), [post.author.username]);

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
});

const UserInfo = React.memo(({ post }) => {
  const [currentLocationName, setCurrentLocationName] = useState('Đang tải...');
  const [destinationName, setDestinationName] = useState('Đang tải...');

  useEffect(() => {
    const reverseGeocode = async (latitude, longitude, setter) => {
      try {
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result.length > 0) {
          const { city, region, country } = result[0];
          setter(`${city || ''}, ${region || ''}, ${country || ''}`);
        } else {
          setter('Không tìm thấy địa chỉ');
        }
      } catch (error) {
        console.error('Lỗi khi chuyển đổi tọa độ:', error);
        setter('Lỗi khi tải địa chỉ');
      }
    };

    if (post.currentLocation && post.currentLocation.coordinates) {
      reverseGeocode(
        post.currentLocation.coordinates[1],
        post.currentLocation.coordinates[0],
        setCurrentLocationName
      );
    } else {
      setCurrentLocationName('Vị trí hiện tại không có sẵn');
    }

    if (post.destination && post.destination.coordinates) {
      reverseGeocode(
        post.destination.coordinates[1],
        post.destination.coordinates[0],
        setDestinationName
      );
    } else {
      setDestinationName('Điểm đến chưa được đặt');
    }
  }, [post]);

  return (
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{post.author.username}</Text>
      <Text style={styles.userAge}>{post.author.age || 'Tuổi không có sẵn'}</Text>
      <Text style={styles.userLocation}>
        Vị trí hiện tại: {currentLocationName}
      </Text>
      <Text style={styles.userDestination}>
        Muốn đến: {destinationName}
      </Text>
      <Text style={styles.userDescription}>{post.title}</Text>
      <View style={styles.userInterests}>
        {post.interests && post.interests.length > 0 ? post.interests.map((hobby, index) => (
          <Text key={index} style={styles.hobby}>#{hobby}</Text>
        )) : <Text style={styles.hobby}>Không có sở thích được chỉ định</Text>}
      </View>
    </View>
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
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={({ item }) => <UserImages post={item} />}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="white"
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        windowSize={5}
        initialNumToRender={2}
      />
    </View>
  );
};

const AllTravelPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <View style={styles.feedItem}>
          <Text style={styles.feedTitle}>{item.title}</Text>
          <Text style={styles.feedAuthor}>{item.author.username}</Text>
          <Text style={styles.feedDate}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
      )}
      keyExtractor={(item) => item._id}
    />
  );
};

const SearchButton = React.memo(() => (
  <TouchableOpacity style={styles.searchButton} onPress={() => console.log('Search pressed')}>
    <Search stroke="white" width={24} height={24} />
  </TouchableOpacity>
));

const TrangTimBanDuLich = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Thêm listener cho thay đổi orientation
  useEffect(() => {
    const updateLayout = () => {
      const { width, height } = Dimensions.get('window');
      // Cập nhật lại các giá trị khi xoay màn hình
    };

    const dimensionsHandler = Dimensions.addEventListener('change', updateLayout);

    return () => {
      dimensionsHandler.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TopTab.Navigator
        screenOptions={{
          tabBarStyle: styles.topNav,
          tabBarIndicatorStyle: styles.tabBarIndicator,
          tabBarLabelStyle: styles.tabBarLabel,
          swipeEnabled: false,
        }}
      >
        <TopTab.Screen name="Trang chủ" component={MainScreen} />
        <TopTab.Screen name="Feed" component={Blog} />
        <TopTab.Screen name="Bản đồ" component={MapScreen} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for a TikTok-like feel
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: SCREEN_HEIGHT,
    bottom: Platform.OS === 'ios' 
      ? SCREEN_HEIGHT > 800 ? '18%' : '15%'  // iPhone Plus vs Regular
      : SCREEN_HEIGHT > 700 ? '8%' : '6%',   // Android Large vs Regular
  },
  imageWrapper: {
    width: '100%',
    height: '50%', // Set the height to 50% of the screen
  },
  swiperContainer: {
    height: '100%', // Ensure Swiper takes full height of its container
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Add a background color
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  noImageText: {
    color: '#fff',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '5%',
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
    right: Platform.OS === 'ios' ? '4%' : '3%',
    bottom: getBottomPosition(),
    alignItems: 'center',
    zIndex: 1000,
  },
  actionButton: {
    width: normalize(38),
    height: normalize(38),
    borderRadius: normalize(19),
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(4),
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
  loadingContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Black background during loading
  },
  feedItem: {
    padding: 15,
    backgroundColor: '#000', // Dark feed background
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
  searchButton: {
    position: 'absolute',
    right: 20,
    top: 40,
    backgroundColor: '#222', // Dark button background
    borderRadius: 50,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNav: {
    backgroundColor: '#000', // Black top nav background
  },
  tabBarIndicator: {
    backgroundColor: '#fff', // White underline for active tab
  },
  tabBarLabel: {
    color: '#fff',
    fontSize: 14,
  },
  actionButtonContainer: {
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  likeCount: {
    color: 'white',
    fontSize: normalize(11),
    fontWeight: '600',
    marginTop: normalize(2),
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
  actionButtons: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(6),
  },
  '@media (max-width: 320px)': {
    actionButton: {
      width: normalize(34),
      height: normalize(34),
      borderRadius: normalize(17),
    },
    likeCount: {
      fontSize: normalize(10),
    },
  },
  '@media (min-width: 768px)': {
    actionButton: {
      width: normalize(44),
      height: normalize(44),
      borderRadius: normalize(22),
    },
    likeCount: {
      fontSize: normalize(13),
    },
  },
});

export default TrangTimBanDuLich;