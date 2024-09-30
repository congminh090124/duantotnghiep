import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const BlogPage = () => {
  const [likes, setLikes] = useState(27600);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} // Placeholder avatar
            style={styles.avatar}
          />
          <Text style={styles.username}>sushichefmiller</Text>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followText}>Theo dõi</Text>
        </TouchableOpacity>
      </View>

      {/* Image Content */}
      <Image
        source={{ uri: 'https://your-image-url.com/image.jpg' }} // Replace with actual image URL
        style={styles.postImage}
      />

      {/* Actions: Like, Comment, Share */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          <Text style={[styles.actionText, isLiked && styles.liked]}>{isLiked ? '❤️' : '🤍'} {likes} Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>💬 132 Comments</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>📤 Share</Text>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.caption}>
        <Text style={styles.username}>sushichefmiller</Text>
        <Text style={styles.captionText}>
          Tiradito Maguro Zuke 👌😋... xem thêm
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background similar to Instagram dark mode
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  followText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 400,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
  },
  liked: {
    color: '#FF0000',
  },
  caption: {
    flexDirection: 'row',
    padding: 10,
  },
  captionText: {
    color: '#fff',
    marginLeft: 10,
  },
});

export default BlogPage;
