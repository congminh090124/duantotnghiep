import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

const BlogPage = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Travel Blog</Text>
        <TouchableOpacity>
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/search.png' }} 
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

    
     

      {/* Blog Card */}
      <View style={styles.blogCard}>
        <Image
          source={{ uri: 'https://your-image-url.com/image.jpg' }} // Replace with actual image URL
          style={styles.blogImage}
        />
        <Text style={styles.blogTitle}>Hành trình khám phá vịnh Hạ Long</Text>

        <View style={styles.blogInfo}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} // Avatar
            style={styles.avatar}
          />
          <View>
            <Text style={styles.blogAuthor}>Nguyễn Văn A</Text>
            <Text style={styles.blogDate}>Ngày đăng: 2023-10-01</Text>
          </View>
        </View>

        <Text style={styles.blogDescription}>
          Vịnh Hạ Long là một trong những điểm đến nổi tiếng nhất của Việt Nam, được UNESCO công nhận là Di sản Thiên nhiên Thế giới...
        </Text>
      </View>

      {/* Another Blog Card */}
      <View style={styles.blogCard}>
        <Image
          source={{ uri: 'https://your-image-url.com/another-image.jpg' }} // Replace with another image URL
          style={styles.blogImage}
        />
        <Text style={styles.blogTitle}>Hành trình khám phá vịnh Hạ Long</Text>

        <View style={styles.blogInfo}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} // Avatar
            style={styles.avatar}
          />
          <View>
            <Text style={styles.blogAuthor}>Nguyễn Văn A</Text>
            <Text style={styles.blogDate}>2023-10-01</Text>
          </View>
        </View>

        <Text style={styles.blogDescription}>
          Vịnh Hạ Long là một trong những điểm đến nổi tiếng nhất của Việt Nam...
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // Light background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  icon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  microphoneIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  blogCard: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  blogImage: {
    width: '100%',
    height: 200,
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  blogInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  blogAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  blogDate: {
    color: '#888',
    fontSize: 14,
  },
  blogDescription: {
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#555',
  },
});

export default BlogPage;
