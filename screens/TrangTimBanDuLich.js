import React, { useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import BlogPage from './Blog';

const TopTab = createMaterialTopTabNavigator();
const { width } = Dimensions.get('window');
const imageUrls = [
  'https://sb.tinhte.vn/2020/01/4875839_united_arab_emirates_skyscrapers_dubai_megapolis-wallpaper-1920x1080.jpg',
  'https://d1hjkbq40fs2x4.cloudfront.net/2016-01-31/files/1045.jpg' 
];
const PlaceholderScreen = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    const roundIndex = Math.round(index);
    setCurrentIndex(roundIndex);
  };

  const scrollToIndex = (index) => {
    if (index >= 0 && index < imageUrls.length) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  };

  return (
    <View style={styles.mainContent}>
      <FlatList
        ref={flatListRef}
        data={imageUrls}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={styles.mainVideo}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollEndDrag={() => {
          if (currentIndex === 0) {
            scrollToIndex(0);
          } else if (currentIndex === imageUrls.length - 1) {
            scrollToIndex(imageUrls.length - 1);
          }
        }}
      />
      <RightSidebar />
      <BottomInfo />
    </View>
  );
};

const RightSidebar = () => (
  <View style={styles.rightSidebar}>
    <Image
      source={{ uri: '/api/placeholder/40/40' }}
      style={styles.avatar}
    />
    <TouchableOpacity style={styles.iconContainer}>
      <Text style={styles.icon}>♥</Text>
      <Text style={styles.iconText}>4,379</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.iconContainer}>
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.iconText}>85</Text>
    </TouchableOpacity>
  </View>
);

const BottomInfo = () => (
  <View style={styles.bottomInfo}>
    <Text style={styles.username}>Dinhtkitt Shop</Text>
    <Text style={styles.description}>Cần Thơ Hôm Nay Có Biến Căng Quá </Text>
  </View>
);


const TrangTimBanDuLich = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopTab.Navigator
        screenOptions={{
          tabBarStyle: styles.topNav,
          tabBarIndicatorStyle: styles.tabBarIndicator,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <TopTab.Screen name="Trang chủ" component={PlaceholderScreen} />
        <TopTab.Screen name="Blogs" component={BlogPage} />
      </TopTab.Navigator>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  mainVideo: {
    width: width,
    height: '100%',
  },
  topNav: {
    backgroundColor: 'white',
  },
  tabBarIndicator: {
    backgroundColor: 'white',
  },
  tabBarLabel: {
    color: 'black',
    fontSize: 14,
  },
  rightSidebar: {
    position: 'absolute',
    right: 10,
    bottom: 100,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    color: 'black',
    fontSize: 24,
  },
  iconText: {
    color: 'black',
    marginTop: 5,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 10,
  },
  username: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    color: 'black',
    fontSize: 14,
  },
});

export default TrangTimBanDuLich;