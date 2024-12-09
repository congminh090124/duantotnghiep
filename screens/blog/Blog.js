import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView, TextInput, Alert, RefreshControl, Platform } from 'react-native';
import { toggleLikePost, addComment, getComments, getToken, getFeedPosts } from '../../apiConfig';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';
const LIKE_COLOR = '#FF6B6B';
const UNLIKE_COLOR = '#757575';

const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  } else {
    return new Date(date).toLocaleDateString('vi-VN');
  }
};

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likeStates, setLikeStates] = useState({});
  const [userToken, setUserToken] = useState(null);
  const navigation = useNavigation();
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState(null);
  const [loadingLikes, setLoadingLikes] = useState({});

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const feedPosts = await getFeedPosts();
      setPosts(feedPosts);

      const initialLikeStates = {};
      feedPosts.forEach(post => {
        initialLikeStates[post._id] = {
          isLiked: post.likes.includes(currentUserId),
          likesCount: post.likesCount
        };
      });
      setLikeStates(initialLikeStates);
    } catch (error) {
      console.error('Lỗi khi lấy bài viết từ feed:', error);
      setError('Không thể lấy bài viết từ feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);
  useEffect(() => {
   
  }, [posts]);


  useEffect(() => {
    const fetchUserToken = async () => {
      const token = await getToken();
      setUserToken(token);
    };
    fetchUserToken();
  }, []);

  useEffect(() => {
    getCurrentUserId();
    fetchPosts();
  }, [userToken, fetchPosts]);

  const getCurrentUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const { id } = JSON.parse(userData);
        setCurrentUserId(id);
      }
    } catch (error) {
      console.error('Error fetching current user ID:', error);
    }
  };

  const handleUserPress = useCallback((userId) => {
    if (userId === currentUserId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('UserProfile', { userId });
    }
  }, [navigation, currentUserId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  const handlePostPress = useCallback((post) => {
    navigation.navigate('PostDetailScreen', { 
      postId: post._id,
      currentUserId: currentUserId
    });
  }, [navigation, currentUserId]);

  const handleLikePress = useCallback(async (postId) => {
    if (loadingLikes[postId]) return;

    setLoadingLikes(prev => ({
      ...prev,
      [postId]: true
    }));

    setLikeStates(prevStates => {
      const currentState = prevStates[postId];
      return {
        ...prevStates,
        [postId]: {
          isLiked: !currentState.isLiked,
          likesCount: currentState.isLiked ? currentState.likesCount - 1 : currentState.likesCount + 1
        }
      };
    });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await toggleLikePost(postId);
      
      setLikeStates(prevStates => ({
        ...prevStates,
        [postId]: {
          isLiked: result.likes.includes(currentUserId),
          likesCount: result.likesCount
        }
      }));
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái like:', error);
      setLikeStates(prevStates => {
        const currentState = prevStates[postId];
        return {
          ...prevStates,
          [postId]: {
            isLiked: !currentState.isLiked,
            likesCount: currentState.isLiked ? currentState.likesCount + 1 : currentState.likesCount - 1
          }
        };
      });
      Alert.alert('Thông báo', 'Có lỗi xảy ra khi thực hiện thao tác này');
    } finally {
      setLoadingLikes(prev => ({
        ...prev,
        [postId]: false
      }));
    }
  }, [currentUserId]);

  const handleCommentPress = useCallback((postId) => {
    setSelectedPostId(prevId => prevId === postId ? null : postId);
    if (selectedPostId !== postId) {
      getComments(postId).then(data => {
        setPosts(prevPosts => prevPosts.map(post =>
          post._id === postId ? { ...post, comments: data.comments } : post
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

  const renderPost = useCallback(({ item: post }) => (
    <View key={post._id} style={styles.postCard}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => handleUserPress(post.user._id)}
        
      >
        {post.user && post.user.avatar ? (
          <Image
            source={{ uri: post.user.avatar }}
            style={styles.avatar}
            onError={(error) => console.log('Avatar load error:', error)}
          />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Ionicons name="person-outline" size={20} color="#fff" />
          </View>
        )}
        <View>
          <Text style={styles.username}>{post.user ? post.user.username : 'Unknown User'}</Text>
          <Text style={styles.postDate}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handlePostPress(post)}>
      <Text style={styles.postContent}>{post.title}</Text>

      {post.images && post.images.length > 0 && (
        <Image
          source={{ uri: post.images[0] }}
          style={styles.postImage}
          onError={(error) => console.log('Post image load error:', error)}
        />
      )}
    </TouchableOpacity>
      <View style={styles.interactionInfo}>
        <TouchableOpacity
          style={[styles.interactionItem, loadingLikes[post._id] && styles.interactionItemDisabled]}
          onPress={() => handleLikePress(post._id)}
          disabled={loadingLikes[post._id]}
        >
          {loadingLikes[post._id] ? (
            <ActivityIndicator size="small" color="#FF6B6B" style={styles.likeLoading} />
          ) : (
            <Ionicons
              name={likeStates[post._id]?.isLiked ? "heart" : "heart-outline"}
              size={24}
              color={likeStates[post._id]?.isLiked ? LIKE_COLOR : UNLIKE_COLOR}
            />
          )}
          <Text style={styles.interactionText}>
            {likeStates[post._id]?.likesCount || 0} Thích
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionItem}
          onPress={() => handleCommentPress(post._id)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#555" />
          <Text style={styles.interactionText}>{post.commentsCount || 0} Bình luận</Text>
        </TouchableOpacity>
      </View>

      {selectedPostId === post._id && (
        <View style={styles.commentSection}>
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Viết bình luận của bạn..."
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[
                styles.addCommentButton,
                !commentText.trim() && styles.addCommentButtonDisabled
              ]} 
              onPress={handleAddComment}
              disabled={!commentText.trim()}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={post.comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <TouchableOpacity 
                    style={styles.commentUserInfo}
                    onPress={() => handleUserPress(item.user?._id)}
                  >
                    {item.userAvatar ? (
                      <Image
                        source={{ uri: item.userAvatar }}
                        style={styles.commentAvatar}
                        onError={(error) => console.log('Comment avatar load error:', error)}
                      />
                    ) : (
                      <View style={[styles.commentAvatar, styles.placeholderAvatar]}>
                        <Ionicons name="person-outline" size={16} color="#fff" />
                      </View>
                    )}
                    <View style={styles.commentUserDetails}>
                      <Text style={styles.commentUser}>
                        {item.username || item.user?.username || 'Người dùng ẩn danh'}
                      </Text>
                      <Text style={styles.commentDate}>
                        {formatTimeAgo(item.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentContent}>{item.content}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
          />
        </View>
      )}
    </View>
  ), [handleUserPress, handleLikePress, handleCommentPress, likeStates, selectedPostId, commentText, handleAddComment]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        contentContainerStyle={{
          paddingBottom: Platform.OS === 'ios' ? 90 : 70,
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 0,
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    contentFit: 'cover',
  },
  placeholderAvatar: {
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'transparent',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    paddingHorizontal: 15,
    paddingBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 8,
    contentFit: 'cover',
  },
  interactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    opacity: 1,
  },
  interactionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  commentSection: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  commentInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  addCommentButton: {
    backgroundColor: '#0066CC',
    padding: 10,
    borderRadius: 20,
    marginLeft: 5,
  },
  addCommentButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  commentItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  commentUserDetails: {
    flex: 1,
    marginLeft: 8,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    contentFit: 'cover',
    backgroundColor: '#F5F5F5',
  },
  commentUser: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1A1A1A',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 44,
  },
  commentSeparator: {
    height: 1,
    backgroundColor: '#EAEAEA',
    marginVertical: 8,
  },
  likeLoading: {
    width: 24,
    height: 24,
    marginRight: 0,
  },
  interactionItemDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default React.memo(BlogPage);