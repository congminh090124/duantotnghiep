import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showPostWithID, getUserProfile } from '../../apiConfig';

const { width } = Dimensions.get('window');

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPostDetails();
  }, []);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const [postData, userData] = await Promise.all([
        showPostWithID(postId),
        getUserProfile()
      ]);
      setPost(postData);
      setUser(userData);
    } catch (err) {
      setError('Failed to fetch details: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  if (error || !post || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Post or user not found'}</Text>
      </SafeAreaView>
    );
  }
 
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Post Content */}
      <View style={styles.postContainer}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image
            source={{ uri: user.anh_dai_dien || 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{user.username || 'Unknown User'}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        {post.images && post.images.length > 0 && (
          <Image
            source={{ uri: post.images[0] }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Interaction Buttons */}
        <View style={styles.interactionButtons}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="paper-plane-outline" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.spacer} />
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Likes Count */}
        <Text style={styles.likesCount}>{post.likes ? post.likes.length : 0} lượt thích</Text>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.username}>{user.username || 'Unknown User'}</Text>
          <Text style={styles.caption}>{post.title || 'No caption'}</Text>
        </View>

        {/* Post Date */}
        <Text style={styles.postDate}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 24,
  },
  postContainer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
  },
  moreButton: {
    marginLeft: 'auto',
  },
  postImage: {
    width: width,
    height: width,
  },
  interactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  spacer: {
    flex: 1,
  },
  likesCount: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  captionContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  caption: {
    color: 'white',
    marginLeft: 5,
  },
  postDate: {
    color: 'gray',
    fontSize: 12,
    marginLeft: 10,
    marginTop: 5,
  },
});

export default PostDetailScreen;