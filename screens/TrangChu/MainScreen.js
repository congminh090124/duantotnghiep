import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Dimensions, 
  StyleSheet, 
  StatusBar, 
  Platform,
  Text,
  SafeAreaView
} from 'react-native';
import { getAllTravelPosts } from '../../apiConfig';
import UserImages from './UserImages';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;
const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 83 : 60;

const MainScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);

  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await getAllTravelPosts();
    //   console.log('Fetched Posts:', fetchedPosts);
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

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content"
          backgroundColor="#000000"
          translucent={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#000000"
        translucent={true}
      />
      
      {/* Content */}
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={({ item }) => <UserImages post={item} />}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT - STATUSBAR_HEIGHT - BOTTOM_TAB_HEIGHT}
        snapToAlignment="start"
        decelerationRate={Platform.select({ ios: 0.99, android: 0.85 })}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT - STATUSBAR_HEIGHT - BOTTOM_TAB_HEIGHT,
          offset: (SCREEN_HEIGHT - STATUSBAR_HEIGHT - BOTTOM_TAB_HEIGHT) * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={['#ffffff']}
            progressBackgroundColor="#000000"
            progressViewOffset={STATUSBAR_HEIGHT}
          />
        }
        viewabilityConfig={viewabilityConfig}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={100}
        windowSize={5}
        initialNumToRender={2}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có bài viết nào</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: SCREEN_HEIGHT - STATUSBAR_HEIGHT - BOTTOM_TAB_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 99,
  },
});

export default MainScreen;
