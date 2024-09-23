import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Use vector icons

const posts = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    time: '2023-10-01 08:30',
    caption: 'Một ngày tuyệt vời tại Hồ Gươm!',
    image: 'https://i.pinimg.com/564x/7b/fa/fe/7bfafeb0691956f095075a693e85ffed.jpg', // Replace with actual image URL
    likes: 120,
    comments: 45,
    shares: 10,
    profileImage: 'https://i.pinimg.com/474x/27/35/9f/27359fe4c8aedb10f63fa4d4773c9fdd.jpg',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    time: '2023-10-02 09:15',
    caption: 'Thưởng thức cà phê tại quán Cộng Cà Phê.',
    image: 'https://i.pinimg.com/736x/68/1c/89/681c89bd89e9e9bdf01a2b072d2c0297.jpg', // Replace with actual image URL
    likes: 85,
    comments: 30,
    shares: 5,
    profileImage: 'https://i.pinimg.com/236x/b6/55/ab/b655abbe60f3b1582089b65f463862a0.jpg',
  },
  {
    id: '3',
    name: 'Lê Minh C',
    time: '2023-10-03 10:00',
    caption: 'Chuyến đi Đà Nẵng thật tuyệt vời!',
    image: 'https://i.pinimg.com/564x/78/96/88/78968844d2e7cb0e5d57779791d19d88.jpg', // Replace with actual image URL
    likes: 150,
    comments: 60,
    shares: 20,
    profileImage: 'https://i.pinimg.com/236x/b6/55/ab/b655abbe60f3b1582089b65f463862a0.jpg',
  },
];

const PostItem = ({ item }) => {
  return (
    <View style={styles.postContainer}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>

      {/* Caption */}
      <Text style={styles.caption}>{item.caption}</Text>

      {/* Post Image */}
      <Image source={{ uri: item.image }} style={styles.postImage} />

      {/* Interaction Section */}
      <View style={styles.interactionRow}>
        <View style={styles.interactionItem}>
          <Icon name="heart" size={20} color="#ff0000" />
          <Text>{item.likes}</Text>
        </View>
        <View style={styles.interactionItem}>
          <Icon name="comment" size={20} color="#000" />
          <Text>{item.comments}</Text>
        </View>
        <View style={styles.interactionItem}>
          <Icon name="share" size={20} color="#000" />
          <Text>{item.shares}</Text>
        </View>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const [searchText, setSearchText] = useState('');

  const filteredPosts = posts.filter((post) =>
    post.caption.toLowerCase().includes(searchText.toLowerCase()) ||
    post.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bài viết..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    marginTop:"10%",
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: 'bold',
  },
  postTime: {
    color: '#555',
  },
  caption: {
    marginTop: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
