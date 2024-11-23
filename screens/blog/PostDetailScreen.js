import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showPostWithID } from '../../apiConfig';

const { width, height } = Dimensions.get('window');

const PostDetailScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchPostDetails();
  }, []);

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const postData = await showPostWithID(postId);
      setPost(postData);
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

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Post not found'}</Text>
      </SafeAreaView>
    );
  }

  const renderImageItem = ({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.postImage}
      resizeMode="cover"
    />
  );

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
          {post.user && post.user.avatar ? (
            <Image
              source={{ uri: post.user.avatar }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <Text style={styles.username}>{post.user ? post.user.username : 'Unknown User'}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Post Image */}
        {post.images && post.images.length > 0 && (
          <FlatList
            data={post.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(newIndex);
            }}
          />
        )}

        {/* Image Indicator */}
        {post.images && post.images.length > 1 && (
          <View style={styles.imageIndicatorContainer}>
            {post.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.imageIndicatorDot,
                  index === currentImageIndex && styles.imageIndicatorDotActive
                ]}
              />
            ))}
          </View>
        )}

        {/* Interaction Buttons */}
       

        {/* Likes Count */}
        <Text style={styles.likesCount}>{post.likes ? post.likes.length : 0} lượt thích</Text>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.username}>{post.user ? post.user.username : 'Unknown User'}</Text>
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
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  postContainer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  username: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  moreButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  postImage: {
    width: width,
    height: height * 0.6,
    resizeMode: 'cover',
  },
  imageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
  },
  imageIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  imageIndicatorDotActive: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    transform: [{scale: 1.2}],
  },
  interactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  likesCount: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 16,
    marginTop: 8,
  },
  captionContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
  },
  caption: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  postDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginLeft: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  placeholderImage: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default PostDetailScreen;