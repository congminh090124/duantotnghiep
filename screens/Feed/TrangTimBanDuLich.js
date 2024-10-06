import React, { useRef, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Blog from '../blog/Blog';

const TopTab = createMaterialTopTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Dữ liệu mẫu cho nhiều người dùng
const usersData = [
  {
    id: '1',
    username: 'Dinhtkitt Shop',
    age: 20,
    diadiemdulich: 'Cần Thơ Hôm Nay Có Biến Căng Quá',
    images: [
      'https://sb.tinhte.vn/2020/01/4875839_united_arab_emirates_skyscrapers_dubai_megapolis-wallpaper-1920x1080.jpg',
      'https://d1hjkbq40fs2x4.cloudfront.net/2016-01-31/files/1045.jpg',
    ],
    sothich: ['Nhảy dây', 'Đá bóng', 'Bơi lội'], // changed to array
    vitrihientai: 'Hà Huy Tập, Buôn Ma Thuột',
    description: 'Yêu thích khám phá, du lịch và ẩm thực.',
    likes: 120,
    comments: 45,
  },
  {
    id: '2', // Changed to unique ID
    username: 'MinhTravel',
    age: 22,
    diadiemdulich: 'Đà Nẵng - Thành phố đáng sống',
    images: [
      'https://example.com/danang1.jpg',
      'https://example.com/danang2.jpg',
    ],
    sothich: ['Leo núi', 'Phượt', 'Đọc sách'],
    vitrihientai: 'Hải Châu, Đà Nẵng',
    description: 'Đam mê phượt và khám phá vùng đất mới.',
    likes: 210,
    comments: 60,
  },
];

const PlaceholderScreen = ({ navigation }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const flatListRef = useRef(null);

  const renderItem = useCallback(({ item: user }) => (
    <View style={styles.userContainer}>
      <FlatList
        data={user.images}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      <RightSidebar likes={user.likes} comments={user.comments} />
      <BottomInfo
        username={user.username}
        description={user.description}
        age={user.age}
        vitrihientai={user.vitrihientai}
        sothich={user.sothich}
      />
    </View>
  ), []);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentUserIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current;

  const getItemLayout = useCallback((_, index) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  }), []);

  return (
    <FlatList
      ref={flatListRef}
      data={usersData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      getItemLayout={getItemLayout}
      removeClippedSubviews={Platform.OS === 'android'}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      windowSize={3}
      decelerationRate="fast"
      snapToInterval={SCREEN_HEIGHT}
      snapToAlignment="start"
    />
  );
};

const RightSidebar = ({ likes, comments }) => (
  <View style={styles.rightSidebar}>
    <Image
      source={{ uri: 'https://via.placeholder.com/40' }} // Placeholder image
      style={styles.avatar}
    />
    <TouchableOpacity style={styles.iconContainer}>
      <Ionicons name="heart" size={30} color="white" />
      <Text style={styles.iconText}>{likes}</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.iconContainer}>
      <Ionicons name="chatbubble" size={30} color="white" />
      <Text style={styles.iconText}>{comments}</Text>
    </TouchableOpacity>
  </View>
);

const BottomInfo = ({ username, description, age, vitrihientai, sothich }) => (
  <View style={styles.bottomInfo}>
    <Text style={styles.username}>{username} ({age})</Text>
    <Text style={styles.description}>{description}</Text>
    <Text style={styles.vitrihientai}>Vị trí: {vitrihientai}</Text>
    <Text style={styles.sothich}>Sở thích: {sothich.join(', ')}</Text>
  </View>
);

const SearchButton = () => (
  <TouchableOpacity style={styles.searchButton}>
    <Ionicons name="search" size={24} color="white" />
  </TouchableOpacity>
);

const TrangTimBanDuLich = () => {
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
        <TopTab.Screen name="Trang chủ" component={PlaceholderScreen} />
        <TopTab.Screen name="Blogs" component={Blog} />
      </TopTab.Navigator>
      <SearchButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  userContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  mainImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topNav: {
    backgroundColor: 'rgba(0, 0, 0, 0)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  tabBarIndicator: {
    backgroundColor: 'white',
  },
  tabBarLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rightSidebar: {
    position: 'absolute',
    right: '3%',
    bottom: '15%',
    alignItems: 'center',
  },
  avatar: {
    width: SCREEN_WIDTH * 0.1,
    height: SCREEN_WIDTH * 0.1,
    borderRadius: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  iconText: {
    color: 'white',
    marginTop: SCREEN_HEIGHT * 0.005,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: '12%',
    left: '3%',
    right: '3%',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  description: {
    color: 'white',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  searchButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.03,
    zIndex: 2,
    padding: SCREEN_WIDTH * 0.025,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: SCREEN_WIDTH * 0.05,
  },
  vitrihientai: {
    color: 'white',
    fontSize: SCREEN_WIDTH * 0.035,
    marginTop: SCREEN_HEIGHT * 0.005,
  },
  sothich: {
    color: 'white',
    fontSize: SCREEN_WIDTH * 0.035,
    marginTop: SCREEN_HEIGHT * 0.005,
  },
});

export default TrangTimBanDuLich;