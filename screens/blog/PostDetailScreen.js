import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ActivityIndicator, FlatList, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showPostWithID } from '../../apiConfig';
import ReportForm from '../report/ReportForm';
import { Image as ExpoImage } from 'expo-image';

const { width, height } = Dimensions.get('window');

const ImageRenderer = memo(({ image }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  return (
    <View style={styles.imageWrapper}>
      <ExpoImage
        source={image}
        style={[
          styles.postImage,
          {
            backgroundColor: '#1a1a1a',
            opacity: imageLoaded ? 1 : 0,
          }
        ]}
        contentFit="cover"
        transition={300}
        onLoadEnd={() => setImageLoaded(true)}
        cachePolicy="memory-disk"
      />
      {!imageLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="white" />
        </View>
      )}
    </View>
  );
});

const PostImages = memo(({ images, onImageIndexChange }) => {
  return (
    <FlatList
      data={images}
      renderItem={({ item }) => <ImageRenderer image={item} />}
      keyExtractor={(_, index) => index.toString()}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onMomentumScrollEnd={(event) => {
        const newIndex = Math.floor(event.nativeEvent.contentOffset.x / width);
        onImageIndexChange(newIndex);
      }}
    />
  );
});

const PostDetailScreen = ({ route, navigation }) => {
  const { postId, currentUserId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleReportPress = useCallback(() => {
    setIsMenuVisible(false);
    setTimeout(() => {
      setIsReportVisible(true);
    }, 300);
  }, []);

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
          {post.user && post.user.id !== currentUserId && (
            <TouchableOpacity style={styles.moreButton} onPress={handleMenuPress}>
              <Ionicons name="ellipsis-horizontal" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Post Image */}
        {post.images && post.images.length > 0 && (
          <PostImages 
            images={post.images}
            onImageIndexChange={setCurrentImageIndex}
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
          {/* <Text style={styles.username}>{post.user ? post.user.username : 'Unknown User'}</Text> */}
          <Text style={styles.caption}>{post.title || 'No caption'}</Text>
        </View>

        {/* Post Date */}
        <Text style={styles.postDate}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}</Text>
      </View>

      {/* Thêm Modal cho menu */}
      <Modal
        transparent
        visible={isMenuVisible}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleReportPress}
            >
              <Ionicons name="warning-outline" size={24} color="#FF3B30" />
              <Text style={styles.menuText}>Báo cáo bài viết</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Thêm ReportForm */}
      <ReportForm
        isVisible={isReportVisible}
        onClose={() => setIsReportVisible(false)}
        targetId={postId}
        targetType="Post"
        onSubmit={() => setIsReportVisible(false)}
      />
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
    ...Platform.select({
      ios: {
        backfaceVisibility: 'hidden',
        transform: [{ perspective: 1000 }],
      },
    }),
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
    paddingTop: 12,
    paddingBottom: 8,
  },
  caption: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'left',
    paddingRight: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#FF3B30',
  },
  imageWrapper: {
    width: width,
    height: height * 0.6,
    backgroundColor: '#1a1a1a',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostDetailScreen;