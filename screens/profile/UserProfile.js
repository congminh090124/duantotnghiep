import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserProfileById, getUserPostsWithID, followUser, unfollowUser } from '../../apiConfig';

const windowWidth = Dimensions.get('window').width;
const imageSize = (windowWidth - 45) / 2;

const PersonalInfo = ({ userProfile }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const infoItems = [
    { icon: 'mail-outline', value: userProfile.email },
    { icon: 'person-outline', value: userProfile.sex },
    { icon: 'call-outline', value: userProfile.sdt },
    { icon: 'heart-outline', value: userProfile.tinhtranghonnhan },
    { icon: 'calendar-outline', value: userProfile.ngaysinh },
    { icon: 'location-outline', value: userProfile.diachi },
    { icon: 'globe-outline', value: userProfile.website },
  ].filter(item => item.value); // Chỉ giữ lại các mục có giá trị

  const displayItems = expanded ? infoItems : infoItems.slice(0, 3);

  return (
    <View style={styles.personalInfoContainer}>
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      {displayItems.map((item, index) => (
        <View key={index} style={styles.infoItem}>
          <Ionicons name={item.icon} size={20} color="black" />
          <Text style={styles.infoText}>{item.value || 'Chưa cập nhật'}</Text>
        </View>
      ))}
      {infoItems.length > 3 && (
        <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
          <Text style={styles.expandButtonText}>
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Text>
          <Ionicons 
            name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
            size={20} 
            color="#0095f6"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [profile, userPosts] = await Promise.all([
          getUserProfileById(userId),
          getUserPostsWithID(userId)
        ]);

        setUserProfile(profile);
        setPosts(userPosts);
        setIsFollowing(profile.isFollowing);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message || 'Failed to fetch user data');
        Alert.alert('Error', 'Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);
  const handleFollowToggle = async () => {
    if (isFollowing) {
      // Show confirmation dialog for unfollowing
      Alert.alert(
        "Xác nhận hủy theo dõi",
        "Bạn có chắc chắn muốn hủy theo dõi người dùng này?",
        [
          {
            text: "Hủy",
            style: "cancel"
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              try {
                const result = await unfollowUser(userId);
                setIsFollowing(false);
                setUserProfile(prevProfile => ({
                  ...prevProfile,
                  thong_ke: {
                    ...prevProfile.thong_ke,
                    nguoi_theo_doi: prevProfile.thong_ke.nguoi_theo_doi - 1
                  }
                }));
                Alert.alert('Thành công', result.message);
              } catch (error) {
                console.error('Error unfollowing user:', error);
                Alert.alert('Lỗi', 'Không thể hủy theo dõi người dùng này');
              }
            }
          }
        ]
      );
    } else {
      // Follow user without confirmation
      try {
        const result = await followUser(userId);
        setIsFollowing(true);
        setUserProfile(prevProfile => ({
          ...prevProfile,
          thong_ke: {
            ...prevProfile.thong_ke,
            nguoi_theo_doi: prevProfile.thong_ke.nguoi_theo_doi + 1
          }
        }));
        Alert.alert('Thành công', result.message);
      } catch (error) {
        console.error('Error following user:', error);
        Alert.alert('Lỗi', 'Không thể theo dõi người dùng này');
      }
    }
  };
  const avatarUri = useMemo(() => userProfile?.anh_dai_dien || null, [userProfile?.anh_dai_dien]);

  const handlePostPress = useCallback((post) => {
    navigation.navigate('PostDetailScreen', { postId: post._id });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!userProfile) {
    return <Text style={styles.errorText}>No profile data available</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{userProfile.username}</Text>
            {userProfile.xacMinhDanhTinh && (
              <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={styles.verifiedIcon} />
            )}
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>bài viết</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.thong_ke.nguoi_theo_doi}</Text>
              <Text style={styles.statLabel}>người theo dõi</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.thong_ke.dang_theo_doi}</Text>
              <Text style={styles.statLabel}>đang theo dõi</Text>
            </View>
          </View>
        </View>

        <Text style={styles.bioText}>{userProfile.bio || 'No bio available'}</Text>

        {/* Follow/Message Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowToggle}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Text style={styles.messageButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <PersonalInfo userProfile={userProfile} />

        {/* Posts */}
        <View style={styles.postsContainer}>
          <Text style={styles.sectionTitle}>Bài viết</Text>
          {posts.length > 0 ? (
            <View style={styles.postGrid}>
              {posts.map((post) => (
                <TouchableOpacity 
                  key={post._id} 
                  style={styles.postItem}
                  onPress={() => handlePostPress(post)}
                >
                  {post.images && post.images.length > 0 ? (
                    <Image
                      source={{ uri: post.images[0] }}
                      style={styles.postImage}
                    />
                  ) : (
                    <View style={[styles.postImage, styles.placeholderImage]}>
                      <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                  )}
                  <View style={styles.postInfo}>
                    <Text style={styles.postTitle} numberOfLines={1}>{post.title || 'Untitled'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noPostsText}>Không có bài viết nào.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginTop:"5%"
  },
  username: {
    color: 'black',
    fontSize: 23,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  followingButton: {
    backgroundColor: '#E0E0E0',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'black',
    fontSize: 14,
  },
  bioText: {
    color: 'black',
    fontSize: 15,
    marginTop: 5,
    marginLeft: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  followButton: {
    flex: 1,
    backgroundColor: '#0095F6',
    paddingVertical: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  followingButton: {
    backgroundColor: '#E0E0E0',
  },
  followButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  messageButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postItem: {
    width: (windowWidth - 45) / 2,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: imageSize,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  postInfo: {
    padding: 10,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  personalInfoContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  expandButtonText: {
    color: '#0095f6',
    fontSize: 16,
    marginRight: 5,
    fontWeight: 'bold',
  },
});

export default React.memo(UserProfile);
