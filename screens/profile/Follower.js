import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Follower = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const initialTab = route.params?.initialTab || 0;
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    // Update active tab when route params change
    if (route.params?.initialTab !== undefined) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / width);
    setActiveTab(index);
  };

  const renderUserItem = (user) => (
    <View key={user.id} style={styles.userItem}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userBio}>{user.bio}</Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>
          {user.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const followingUsers = [
    { id: 1, name: 'Nguyễn Văn A', bio: 'Yêu du lịch', avatar: 'https://randomuser.me/api/portraits/men/1.jpg', isFollowing: true },
    { id: 2, name: 'Trần Thị B', bio: 'Foodie', avatar: 'https://randomuser.me/api/portraits/women/2.jpg', isFollowing: true },
  ];

  const followers = [
    { id: 3, name: 'Lê Văn C', bio: 'Photographer', avatar: 'https://randomuser.me/api/portraits/men/3.jpg', isFollowing: false },
    { id: 4, name: 'Phạm Thị D', bio: 'Adventure seeker', avatar: 'https://randomuser.me/api/portraits/women/4.jpg', isFollowing: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
            {`Đang theo dõi (${followingUsers.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
            {`Người theo dõi (${followers.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentOffset={{ x: activeTab * width, y: 0 }}
      >
        <View style={styles.page}>
          <ScrollView>
            {followingUsers.map(renderUserItem)}
          </ScrollView>
        </View>
        <View style={styles.page}>
          <ScrollView>
            {followers.map(renderUserItem)}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTabText: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  page: {
    width: width,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userBio: {
    fontSize: 14,
    color: 'gray',
  },
  followButton: {
    backgroundColor: '#0066FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Follower;