import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Button } from 'react-native';
import { getUserPosts } from '../../apiConfig';
import { useNavigation } from '@react-navigation/native';

const BlogPostManager = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const data = await getUserPosts();
      setBlogPosts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    navigation.navigate('EditPost', { 
      postId: post._id, 
      initialData: { 
        title: post.title, 
        content: post.content, 
        images: post.images || [], // Pass existing images
        location: post.location // Include location if needed
      } 
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.images && item.images.length > 0 && (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
        <Button title="Edit" onPress={() => handleEditPost(item)} />
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý bài viết Blog</Text>
      <FlatList
        data={blogPosts}
        renderItem={renderItem}
        keyExtractor={item => item._id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    color: '#666',
  },
});

export default BlogPostManager;
