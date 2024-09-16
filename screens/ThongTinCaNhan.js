import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header with Search and Icons */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="gray" />
        </TouchableOpacity>
        <Text style={styles.searchText}>Tìm kiếm địa điểm, bạn du lịch...</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      {/* User Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Hà An Duyệt</Text>
          <Text style={styles.profileBio}>Du lịch khắp thế giới</Text>
          <Text style={styles.profileDescription}>
            "Tôi là một người đam mê du lịch và khám phá những vùng đất mới. Tôi đã đi qua hơn 30 quốc gia và luôn sẵn sàng chia sẻ kinh nghiệm của mình với mọi người."
          </Text>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.2K</Text>
              <Text style={styles.statLabel}>Người theo dõi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>300</Text>
              <Text style={styles.statLabel}>Đang theo dõi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>150</Text>
              <Text style={styles.statLabel}>Bài viết</Text>
            </View>
          </View>

          {/* Follow and Message Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>+ Theo dõi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageButtonText}>Nhắn tin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Post */}
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={styles.postProfileImage}
          />
          <View>
            <Text style={styles.postName}>Nguyen Van A</Text>
            <Text style={styles.postDate}>2023-10-01 | 14:30</Text>
          </View>
        </View>
        <Text style={styles.postText}>
          Chuyến đi đến Đà Lạt thật tuyệt vời! Khí hậu mát mẻ và cảnh quan đẹp như tranh vẽ. Mọi người nên thử ít nhất một lần đến đây.
        </Text>
        <Image
          source={{ uri: 'https://www.w3schools.com/w3images/lights.jpg' }}
          style={styles.postImage}
        />
        {/* Post Interactions */}
        <View style={styles.postInteraction}>
          <TouchableOpacity>
            <Ionicons name="heart-outline" size={24} color="gray" />
            <Text>250</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="chatbubble-outline" size={24} color="gray" />
            <Text>45</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="share-outline" size={24} color="gray" />
            <Text>30</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Tags */}
      <View style={styles.locationContainer}>
        <View style={styles.locationTag}>
          <Image
            source={{ uri: 'https://www.w3schools.com/w3images/fjords.jpg' }}
            style={styles.locationImage}
          />
          <Text style={styles.locationName}>Hà Nội</Text>
          <Text style={styles.locationSubtitle}>Thủ đô ngàn năm văn hiến</Text>
        </View>
        <View style={styles.locationTag}>
          <Image
            source={{ uri: 'https://www.w3schools.com/w3images/nature.jpg' }}
            style={styles.locationImage}
          />
          <Text style={styles.locationName}>Hội An</Text>
          <Text style={styles.locationSubtitle}>Phố cổ Hội An</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:"10%",
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchText: {
    fontSize: 16,
    color: 'gray',
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileBio: {
    fontSize: 14,
    color: 'gray',
  },
  profileDescription: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'gray',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  followButton: {
    backgroundColor: '#0066FF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0066FF',
    alignItems: 'center',
  },
  messageButtonText: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
  },
  postText: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postInteraction: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationTag: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  locationImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationSubtitle: {
    fontSize: 12,
    color: 'gray',
  },
});

export default UserProfileScreen;
