import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { getAllTravelPosts } from '../../apiConfig';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MapScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 16.047079,  // Vị trí mặc định (có thể đặt ở trung tâm Việt Nam)
    longitude: 108.206230,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  const fetchPosts = useCallback(async () => {
    try {
      const fetchedPosts = await getAllTravelPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="#ffffff"
          translucent={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={true}
      />
      <MapView
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
      >
        {posts.map((post) => (
          post.location && post.location.coordinates ? (
            <Marker
              key={post._id}
              coordinate={{
                latitude: post.location.coordinates[1],
                longitude: post.location.coordinates[0]
              }}
              title={post.title || 'Travel Post'}
              description={post.description || ''}
            >
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{post.title || 'Travel Post'}</Text>
                  <Text style={styles.calloutDescription}>
                    {post.description || ''}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ) : null
        ))}
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - STATUSBAR_HEIGHT,
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 14,
  }
});

export default MapScreen;