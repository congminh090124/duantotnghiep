import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { searchTravelPosts } from '../../apiConfig';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const TravelSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [locationNames, setLocationNames] = useState({});

  const handleSearch = useCallback(async (resetPage = true) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      
      const currentPage = resetPage ? 1 : page;
      
      if (resetPage) {
        setResults([]);
        setPage(1);
      }

      const searchParams = {
        query: searchQuery.trim(),
        page: currentPage,
        limit: 10
      };

      const response = await searchTravelPosts(searchParams);
      
      if (response.success) {
        if (resetPage) {
          setResults(response.posts);
        } else {
          const newPosts = response.posts.filter(
            newPost => !results.some(existingPost => existingPost._id === newPost._id)
          );
          setResults(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(response.posts.length === 10);
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Error',
        'Failed to search posts. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, page, results]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(true);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      handleSearch(false);
    }
  }, [loading, hasMore, handleSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    handleSearch(true);
  }, [handleSearch]);

  const getTranslatedLocationName = async (lat, lng, postId, locationType) => {
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
        [postId]: {
          ...prev[postId],
          [locationType]: locationName
        }
      }));
    } catch (error) {
      console.error('Error translating location:', error);
      setLocationNames(prev => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          [locationType]: 'Unknown location'
        }
      }));
    }
  };

  useEffect(() => {
    results.forEach(item => {
      if (item.currentLocation?.coordinates) {
        getTranslatedLocationName(
          item.currentLocation.coordinates[1],
          item.currentLocation.coordinates[0],
          item._id,
          'current'
        );
      }
      
      if (item.destination?.coordinates) {
        getTranslatedLocationName(
          item.destination.coordinates[1],
          item.destination.coordinates[0],
          item._id,
          'destination'
        );
      }
    });
  }, [results]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TravelPostDetail', { postId: item._id })}
      style={styles.postContainer}
    >
      <Image 
        source={{ uri: item.images[0] }} 
        style={styles.postImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.postContent}>
          <View style={styles.headerRow}>
            <View style={styles.authorContainer}>
              <Image 
                source={{ uri: item.author.avatar }} 
                style={styles.authorAvatar}
              />
              <Text style={styles.authorName}>{item.author.username}</Text>
            </View>
            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={16} color="#ff4757" />
              <Text style={styles.likesCount}>{item.likesCount || 0}</Text>
            </View>
          </View>

          <Text style={styles.postTitle}>{item.title}</Text>

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#fff" />
            <Text style={styles.dateText}>
              {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>

          {item.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {item.interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.locationContainer}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#2ecc71" />
              <Text style={styles.locationText}>
                From: {locationNames[item._id]?.current || 'Loading...'}
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="navigate" size={14} color="#e74c3c" />
              <Text style={styles.locationText}>
                To: {locationNames[item._id]?.destination || 'Loading...'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#f5f6fa"
        translucent
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search travel posts..."
              placeholderTextColor="#666"
              returnKeyType="search"
              onSubmitEditing={() => handleSearch(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor="#0000ff"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => loading && (
            <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery.trim() 
                  ? 'No results found' 
                  : 'Start searching for travel posts'}
              </Text>
            </View>
          )}
          contentContainerStyle={[
            styles.listContainer,
            !results.length && styles.emptyList
          ]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingTop: Platform.OS === 'android' ? STATUSBAR_HEIGHT : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#2d3436',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  postContainer: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#f0f0f0', // placeholder color
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    padding: 16,
    justifyContent: 'flex-end',
  },
  postContent: {
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 4,
    borderRadius: 20,
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
    marginRight: 8,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  likesCount: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    color: '#fff',
    fontSize: 12,
  },
  locationContainer: {
    gap: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  loader: {
    marginVertical: 16,
  },
});

export default TravelSearch; 