import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import Swiper from 'react-native-swiper';
import { Heart, MessageCircle, Users, Search } from 'react-native-feather';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getAllTravelPosts, API_ENDPOINTS } from '../../apiConfig';
import MapScreen from './MapScreen';
import Blog from '../blog/Blog';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

const TopTab = createMaterialTopTabNavigator();
const { width, height } = Dimensions.get('window');

const UserImages = React.memo(({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const navigation = useNavigation();

  const handleLike = useCallback(() => setIsLiked(prev => !prev), []);
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
          onLike={handleLike}
          onMessage={handleMessage}
          onTravelTogether={handleTravelTogether}
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

const ActionButtons = React.memo(({ isLiked, onLike, onMessage, onTravelTogether }) => (
  <View style={styles.actionButtons}>
    <TouchableOpacity style={styles.actionButton} onPress={onLike}>
      <Heart stroke={isLiked ? "red" : "white"} fill={isLiked ? "red" : "none"} width={30} height={30} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onMessage}>
      <MessageCircle stroke="white" width={30} height={30} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={onTravelTogether}>
      <Users stroke="white" width={30} height={30} />
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
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
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

const TrangTimBanDuLich = () => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background for a TikTok-like feel
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    height: height,
    bottom: Platform.OS === 'ios' ? '18%' : '8%',
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
    right: '5%',
    bottom: Platform.OS === 'ios' ? '30%' : '35%',
    alignItems: 'center',
  },
  actionButton: {
    marginVertical: 10,
  },
  loadingContainer: {
    height: height,
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
});


export default TrangTimBanDuLich;