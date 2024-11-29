import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
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
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  item: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  textContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    lineHeight: 24,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
    lineHeight: 20,
  },
  menuContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  menuTrigger: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuOptions: {
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
    backgroundColor: '#FFFFFF',
    width: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuOption: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#495057',
  },
  deleteOption: {
    color: '#dc3545',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
    lineHeight: 24,
  },
  noImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  noImageIcon: {
    color: '#CED4DA',
  },
  noImageText: {
    color: '#ADB5BD',
    marginTop: 8,
    fontSize: 14,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default BlogPostManager;
