import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showPostWithID } from '../../apiConfig';

const API_BASE_URL = 'https://lacewing-evolving-generally.ngrok-free.app';
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
    height: height - 200, // Adjust this value as needed
    resizeMode: 'cover',
  },
  imageIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
  imageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  imageIndicatorDotActive: {
    backgroundColor: 'white',
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
  placeholderImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 10,
  },
});

export default PostDetailScreen;