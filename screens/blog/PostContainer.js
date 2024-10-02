import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const PostContainer = ({ posts }) => {
  return (
    <View style={styles.container}>
      {posts.map((post) => (
        <View key={post.id} style={styles.postItem}>
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          <Text style={styles.postTitle}>{post.title}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.com.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 5,
  },
  postItem: {
    width: '48%',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  postTitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PostContainer;