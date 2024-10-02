import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { error,Alert, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { getAllPosts, toggleLikePost, getToken } from '../../apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeStates, setLikeStates] = useState({});
  const [userToken, setUserToken] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserToken = async () => {
      const token = await getToken();
      setUserToken(token);
    };
    fetchUserToken();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
        const initialLikeStates = {};
        fetchedPosts.forEach(post => {
          initialLikeStates[post._id] = {
            isLiked: post.likes.includes(userToken),
            likesCount: post.likesCount,
            isLoading: false
          };
        });
        setLikeStates(initialLikeStates);
      } catch (error) {
        console.error('Error fetching posts:', error);
        Alert.alert('Error', 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userToken]);

  const handlePostPress = useCallback((post) => {
    navigation.navigate('PostDetailScreen', { postId: post._id });
  }, [navigation]);

  const handleLikePress = useCallback(async (postId) => {
    setLikeStates(prev => ({
      ...prev,
      [postId]: { ...prev[postId], isLoading: true }
    }));

    const currentLikeState = likeStates[postId];
    const isCurrentlyLiked = currentLikeState.isLiked;

    // Optimistically update UI
    setLikeStates(prev => ({
      ...prev,
      [postId]: {
        isLiked: !isCurrentlyLiked,
        likesCount: isCurrentlyLiked ? prev[postId].likesCount - 1 : prev[postId].likesCount + 1,
        isLoading: true
      }
    }));

    try {
      const result = await toggleLikePost(postId);

      // Update with server response
      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          isLiked: result.likes.includes(userToken),
          likesCount: result.likesCount,
          isLoading: false
        }
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert to original state
      setLikeStates(prev => ({
        ...prev,
        [postId]: { ...currentLikeState, isLoading: false }
      }));
      Alert.alert('Error', `Failed to update like status: ${error.message}`);
    }
  }, [likeStates, userToken]);

  const renderedPosts = useMemo(() => {
    return posts.map((post) => (
      <TouchableOpacity key={post._id} style={styles.postCard} onPress={() => handlePostPress(post)}>
        <View style={styles.userInfo}>
          {post.user && post.user.avatar ? (
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Ionicons name="person-outline" size={20} color="#fff" />
            </View>
          )}
          <View>
            <Text style={styles.username}>{post.user ? post.user.username : 'Unknown User'}</Text>
            <Text style={styles.postDate}>{new Date(post.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>
          {post.content ? post.content.substring(0, 100) + '...' : 'No description available'}
        </Text>

        {post.images && post.images.length > 0 ? (
          <Image source={{ uri: post.images[0] }} style={styles.postImage} resizeMode="cover" />
        ) : (
          <View style={[styles.postImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={50} color="#888" />
          </View>
        )}

        <View style={styles.interactionInfo}>
          <TouchableOpacity
            style={styles.interactionItem}
            onPress={() => handleLikePress(post._id)}
            disabled={likeStates[post._id]?.isLoading}
          >
            {likeStates[post._id]?.isLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <Ionicons
                name={likeStates[post._id]?.isLiked ? "heart" : "heart-outline"}
                size={24}
                color={likeStates[post._id]?.isLiked ? "red" : "#555"}
              />
            )}
            <Text style={styles.interactionText}>{likeStates[post._id]?.likesCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#555" />
            <Text style={styles.interactionText}>{post.commentsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.interactionItem}>
            <Ionicons name="share-social-outline" size={24} color="#555" />
            <Text style={styles.interactionText}>10</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ));
  }, [posts, likeStates, handlePostPress, handleLikePress]);


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerText}>Social Feed</Text>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {renderedPosts}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  placeholderAvatar: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 14,
    color: '#888',
  },
  postContent: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    marginLeft: 5,
    color: '#555',
  },
});

export default React.memo(BlogPage);