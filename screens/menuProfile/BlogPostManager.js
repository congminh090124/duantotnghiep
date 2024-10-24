import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { getUserPosts, deletePost } from '../../apiConfig';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';

const BlogPostManager = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchBlogPosts = useCallback(async () => {
    try {
      const data = await getUserPosts();
      setBlogPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      Alert.alert('Error', 'Failed to fetch blog posts. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBlogPosts();
    }, [fetchBlogPosts])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Lỗi định dạng ngày';
    }
  }, []);

  const handleEdit = useCallback((post) => {
    navigation.navigate('EditPost', { 
      postId: post._id, 
      initialData: { 
        title: post.title, 
        content: post.content, 
        images: post.images || [],
      } 
    });
  }, [navigation]);

  const handleDelete = useCallback(async (postId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(postId);
              setBlogPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
              Alert.alert("Thành công", "Bài viết đã được xóa thành công.");
            } catch (error) {
              console.error('Lỗi khi xóa bài viết:', error);
              Alert.alert("Lỗi", "Không thể xóa bài viết. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  }, []);

  const renderItem = useCallback(({ item }) => (
    <SharedElement id={`post.${item._id}.card`}>
      <View style={styles.item}>
        {item.images && item.images.length > 0 && (
          <SharedElement id={`post.${item._id}.image`}>
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.image} 
              resizeMode="cover"
            />
          </SharedElement>
        )}
        <View style={styles.textContainer}>
          <SharedElement id={`post.${item._id}.title`}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          </SharedElement>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.content} numberOfLines={3}>{item.content}</Text>
          <View style={styles.menuContainer}>
            <Menu>
              <MenuTrigger style={styles.menuTrigger}>
                <Ionicons name="ellipsis-vertical" size={20} color="#333" />
              </MenuTrigger>
              <MenuOptions customStyles={{
                optionsContainer: styles.menuOptions,
              }}>
                <MenuOption onSelect={() => handleEdit(item)} customStyles={{
                  optionWrapper: styles.menuOption,
                  optionText: styles.menuOptionText,
                }}>
                  <Text style={styles.menuOptionText}>Sửa</Text>
                </MenuOption>
                <MenuOption onSelect={() => handleDelete(item._id)} customStyles={{
                  optionWrapper: [styles.menuOption, styles.lastMenuOption],
                  optionText: styles.menuOptionText,
                }}>
                  <Text style={[styles.menuOptionText, { color: '#FF3B30' }]}>Xóa</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </View>
      </View>
    </SharedElement>
  ), [formatDate, handleEdit, handleDelete]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <MenuProvider>
      <View style={styles.container}>
        <FlatList
          data={blogPosts}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <Text style={styles.header}>Quản lý bài viết Blog</Text>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có bài viết nào</Text>
          }
        />
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1C1C1E',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  textContainer: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#3A3A3C',
  },
  menuContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  menuTrigger: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  menuOptions: {
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
  },
  lastMenuOption: {
    borderBottomWidth: 0,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 20,
  },
});

export default BlogPostManager;
