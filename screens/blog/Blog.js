import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { error, Alert, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import { getAllPosts, toggleLikePost, addComment, getComments, getToken } from '../../apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeStates, setLikeStates] = useState({});
  const [userToken, setUserToken] = useState(null);
  const navigation = useNavigation();
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);

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
  const handleCommentPress = useCallback((postId) => {
    setSelectedPostId(prevId => prevId === postId ? null : postId);
    if (selectedPostId !== postId) {
      getComments(postId).then(data => {
        console.log('Fetched comments:', data);
        setPosts(prevPosts => prevPosts.map(post =>
          post._id === postId ? { ...post, comments: data.comments, commentsCount: data.commentsCount } : post
        ));
      }).catch(error => {
        console.error('Error fetching comments:', error);
        Alert.alert('Error', 'Failed to fetch comments');
      });
    }
  }, [selectedPostId]);
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !selectedPostId) return;

    try {
      const result = await addComment(selectedPostId, commentText);
      console.log('Add comment result:', result);
      setPosts(prevPosts => prevPosts.map(post =>
        post._id === selectedPostId
          ? {
            ...post,
            comments: [result.comment, ...(post.comments || [])],
            commentsCount: (post.commentsCount || 0) + 1
          }
          : post
      ));
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  }, [selectedPostId, commentText]);
  const renderedPosts = useMemo(() => {
    return posts.map((post) => (
      <View key={post._id} style={styles.postCard}>
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

        <Text style={styles.postContent}>{post.content}</Text>

        {post.images && post.images.length > 0 ? (
          <TouchableOpacity onPress={() => handlePostPress(post)}>
            <Image source={{ uri: post.images[0] }} style={styles.postImage} resizeMode="cover" />
          </TouchableOpacity>
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
          <TouchableOpacity
            style={styles.interactionItem}
            onPress={() => handleCommentPress(post._id)}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#555" />
            <Text style={styles.interactionText}>{post.commentsCount || 0}</Text>
          </TouchableOpacity>
        </View>

        {selectedPostId === post._id && (
          <View style={styles.commentSection}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.addCommentButton}>
              <Text style={styles.addCommentButtonText}>Post</Text>
            </TouchableOpacity>

            <ScrollView style={styles.commentList}>
              {post.comments && post.comments.map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{comment.user?.username || 'Unknown User'}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    ));
  }, [posts, likeStates, handlePostPress, handleLikePress, selectedPostId, commentText, handleCommentPress, handleAddComment]);


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
  postContent: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    lineHeight: 24, // Add this for better readability
  },
  commentSection: {
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addCommentButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentList: {
    maxHeight: 200, // Limit the height of the comment list
  },
  commentItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  commentContent: {
    fontSize: 14,
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
  commentSection: {
    marginTop: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addCommentButton: {
    backgroundColor: '#0066cc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  commentList: {
    maxHeight: 200, // Limit the height of the comment list
  },
  commentItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  commentContent: {
    fontSize: 14,
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