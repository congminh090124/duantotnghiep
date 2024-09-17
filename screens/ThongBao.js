import React from 'react';
import { View, Text, Image, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const notifications = [
  {
    id: '1',
    title: 'Yêu cầu du lịch mới',
    time: '2 giờ trước',
    image: 'https://i.pinimg.com/474x/14/6b/bc/146bbc2c54bd796bfe0fa1da8579a9e7.jpg', // Replace with actual image URL
  },
  {
    id: '2',
    title: 'Bạn có một đề cập',
    time: '1 giờ trước',
    image: 'https://i.pinimg.com/236x/bd/9f/74/bd9f74fa83ac10165950f9859544122b.jpg', // Replace with actual image URL
  },
  {
    id: '3',
    title: 'Cập nhật kế hoạch',
    time: '30 phút trước',
    image: 'https://i.pinimg.com/236x/8c/dc/ea/8cdcea1b1c137fe4892a66f597522179.jpg', // Replace with actual image URL
  },
  {
    id: '4',
    title: 'Tin nhắn mới',
    time: '15 phút trước',
    image: 'https://i.pinimg.com/474x/4d/15/3e/4d153eb0471a222f66cf6dd114af5da6.jpg', // Replace with actual image URL
  },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      <TouchableOpacity>
       
<Image source={require('../assets/delete.png')} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Thông báo</Text>

    
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
      
<Image source={require('../assets/search.png')} style={{ width: 24, height: 24 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm thông báo"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity>
          <Text style={styles.tab}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.tab}>Chưa đọc</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.tab}>Đề cập</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.tab}>Yêu cầu</Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: "10%",
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  tab: {
    fontSize: 16,
    color: 'gray',
  },
  list: {
    marginTop: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 14,
    color: 'gray',
  },
});
