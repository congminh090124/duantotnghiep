import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-swiper';
import { Heart, MessageCircle, Users, Search } from 'react-native-feather';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { getAllTravelPosts, API_ENDPOINTS } from '../../apiConfig';

const TopTab = createMaterialTopTabNavigator();
const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = height * 0.98;

const UserImages = React.memo(({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const handleLike = useCallback(() => setIsLiked(prev => !prev), []);
  const handleMessage = useCallback(() => console.log('Gửi tin nhắn cho', post.author.username), [post.author.username]);
  const handleTravelTogether = useCallback(() => console.log('Muốn đi du lịch cùng', post.author.username), [post.author.username]);

  const getImageUrl = useCallback((imagePath) => `${API_ENDPOINTS.socketURL}${imagePath}`, []);

  useEffect(() => {
    if (post.images && post.images.length > 0) {
      Promise.all(post.images.map(imagePath => Image.prefetch(getImageUrl(imagePath))))
        .then(() => setImagesLoaded(true))
        .catch(error => console.error('Failed to load images:', error));
    } else {
      setImagesLoaded(true);
    }
  }, [post.images, getImageUrl]);

  if (!imagesLoaded) {
    return (
      <View style={[styles.imageContainer, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      <Swiper loop={false} style={styles.wrapper}>
        {post.images && post.images.length > 0 ? (
          post.images.map((image, index) => (
            <View key={index} style={styles.slide}>
              <Image
                source={{ uri: getImageUrl(image) }}
                style={styles.image}
                resizeMode="cover"
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
      <UserInfo post={post} />
      <ActionButtons
        isLiked={isLiked}
        onLike={handleLike}
        onMessage={handleMessage}
        onTravelTogether={handleTravelTogether}
      />
    </View>
  );
});

const UserInfo = React.memo(({ post }) => (
  <View style={styles.userInfo}>
    <Text style={styles.userName}>{post.author.username}</Text>
    <Text style={styles.userAge}>{post.author.age || 'Age not available'}</Text>
    <Text style={styles.userLocation}>
      {post.currentLocation && post.currentLocation.coordinates 
        ? `${post.currentLocation.coordinates[1].toFixed(2)}, ${post.currentLocation.coordinates[0].toFixed(2)}`
        : 'Location not available'}
    </Text>
    <Text style={styles.userDestination}>
      Muốn đến: {post.destination && post.destination.coordinates 
        ? `${post.destination.coordinates[1].toFixed(2)}, ${post.destination.coordinates[0].toFixed(2)}`
        : 'Destination not set'}
    </Text>
    <Text style={styles.userDescription}>{post.title}</Text>
    <View style={styles.userInterests}>
      {post.interests && post.interests.length > 0 ? post.interests.map((hobby, index) => (
        <Text key={index} style={styles.hobby}>#{hobby}</Text>
      )) : <Text style={styles.hobby}>No interests specified</Text>}
    </View>
  </View>
));

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
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const fetchedPosts = await getAllTravelPosts();
      console.log('Fetched travel posts:', fetchedPosts);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <TopTab.Screen name="Feed" component={AllTravelPosts} />
    </TopTab.Navigator>
    <SearchButton />
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageContainer: {
    width: width,
    height: ITEM_HEIGHT,
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  userInfo: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    right: 10,
  },
  userName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userAge: {
    color: 'white',
    fontSize: 16,
  },
  userLocation: {
    color: 'white',
    fontSize: 16,
    fontStyle: 'italic',
  },
  userDescription: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  userInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  hobby: {
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  userDestination: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  actionButtons: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 10,
    marginBottom: 15,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
  topNav: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'absolute',
    top: '0',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  tabBarIndicator: {
    backgroundColor: 'white',
    height: 3,
  },
  tabBarLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  searchButton: {
    position: 'absolute',
    top: '5%',
    right: 20,
    padding: 10,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  feedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  feedAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  feedDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 5,
  },
  noImageText: {
    color: 'white',
    fontSize: 18,
  },
});

export default TrangTimBanDuLich;