import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator, RefreshControl, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserProfile, updateAvatar, getUserPosts, getFollowers, getFollowing, getMyTravelPosts } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const windowWidth = Dimensions.get('window').width;
const imageSize = (windowWidth - 40) / 2;

const MyProfile = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [travelPosts, setTravelPosts] = useState([]);

  const normalPosts = useMemo(() => 
    posts.filter(post => post.type !== 'travel'), [posts]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileData, postsData, followersData, followingData, travelPostsData] = await Promise.all([
        getUserProfile(),
        getUserPosts(),
        getFollowers(),
        getFollowing(),
        getMyTravelPosts()
      ]);
      setProfileData(profileData);
      setPosts(postsData);
      setFollowers(followersData);
      setFollowing(followingData);
      setTravelPosts(travelPostsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Unable to fetch data. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => { };
    }, [fetchData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('UpdateProfile', {
      profileData
    });
    navigation.setOptions({
      onProfileUpdate: fetchData
    });
  }, [navigation, profileData, fetchData]);

  const handleUpdateAvatar = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to update your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUpdatingAvatar(true);
        const imageUri = result.assets[0].uri;

        const manipulatedImage = await manipulateAsync(
          imageUri,
          [{ resize: { width: 300 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        const updatedProfile = await updateAvatar(manipulatedImage.uri);

        setProfileData(prevState => ({
          ...prevState,
          anh_dai_dien: updatedProfile.avatar
        }));

        Alert.alert('Success', 'Avatar updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  }, []);

  const avatarUri = useMemo(() => profileData?.anh_dai_dien || null, [profileData?.anh_dai_dien]);

  const handlePostPress = useCallback((post) => {
    if (!post?._id) {
      Alert.alert('Lỗi', 'Không thể mở bài viết này');
      return;
    }

    // Kiểm tra loại bài viết và điều hướng đến màn hình tương ứng
    if (activeTab === 'travel') {
      navigation.navigate('TravelPostDetail', { 
        postId: post._id,
        title: post.title || 'Chi tiết bài viết',
      });
    } else {
      navigation.navigate('PostDetailScreen', { 
        postId: post._id,
        title: post.title || 'Chi tiết bài viết',
      });
    }
  }, [navigation, activeTab]);

  const renderStatItem = useCallback(({ label, value, onPress }) => (
    <TouchableOpacity 
      style={styles.statItem} 
      onPress={onPress} 
      disabled={!onPress}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statNumber}>{value}</Text>
    </TouchableOpacity>
  ), []);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  const handleMenuItemPress = useCallback((action) => {
    setIsMenuVisible(false);
    switch (action) {
      case 'settings':
        // Điều hướng đến trang cài đặt
        navigation.navigate('Settings');
        break;
      case 'volunteer':
        // Điều hướng đến trang đăng ký TNV
        navigation.navigate('VolunteerRegistration');
        break;
      case 'logout':
        // Xử lý đăng xuất
        Alert.alert(
          "Đăng xuất",
          "Bạn có chắc chắn muốn đăng xuất?",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng xuất", onPress: () => {
              // Thực hiện đăng xuất ở đây
              // Ví dụ: clearToken() và điều hướng về màn hình đăng nhập
              navigation.reset({
                index: 0,
                routes: [{ name: 'DangNhap' }],
              });
            }}
          ]
        );
        break;
      case 'support':
        // Điều hướng đến trang hỗ trợ
        navigation.navigate('Support');
        break;
    }
  }, [navigation]);

  // Thêm hàm helper để xử lý location
  const getLocationString = (location) => {
    if (!location) return 'No location';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.coordinates) {
      return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return 'No location';
  };

  const renderPostItem = useCallback((post) => {
    return (
      <TouchableOpacity
        key={post._id}
        style={styles.postItem}
        onPress={() => handlePostPress(post)}
      >
        <View style={styles.postImageContainer}>
          {post.images && post.images.length > 0 ? (
            <Image
              source={{ uri: post.images[0] }}
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.postImage, styles.noImageContainer]}>
              <Ionicons name="image-outline" size={24} color="#666" />
            </View>
          )}
          {post.images && post.images.length > 1 && (
            <View style={styles.multipleImagesIndicator}>
              <Ionicons name="copy-outline" size={16} color="#fff" />
            </View>
          )}
        </View>
        
        <View style={styles.postInfo}>
          <Text style={styles.postTitle} numberOfLines={1}>
            {post.title || 'Untitled'}
          </Text>
          <Text style={styles.postLocation} numberOfLines={1}>
            {getLocationString(post.location)}
          </Text>
          {activeTab === 'travel' && post.startDate && post.endDate && (
            <Text style={styles.travelDate}>
              {new Date(post.startDate).toLocaleDateString()} - 
              {new Date(post.endDate).toLocaleDateString()}
            </Text>
          )}
          <View style={styles.postStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color="#666" />
              <Text style={styles.statText}>{post.likes?.length || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color="#666" />
              <Text style={styles.statText}>{post.comments?.length || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [activeTab, handlePostPress]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profileData) {
    return <Text style={styles.errorText}>No profile data available</Text>;
  }

  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{profileData.username}</Text>
            {profileData.xacMinhDanhTinh && (
              <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={styles.verifiedIcon} />
            )}
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
              <Ionicons name="menu-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.updateAvatarIcon}
              onPress={handleUpdateAvatar}
              disabled={isUpdatingAvatar}
            >
              {isUpdatingAvatar ? (
                <ActivityIndicator size="small" color="#0095F6" />
              ) : (
                <Ionicons name="add-circle" size={24} color="#0095F6" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statsLabels}>
              <Text style={styles.statLabel}>Người theo dõi</Text>
              <Text style={styles.statLabel}>Đang theo dõi</Text>
            </View>
            <View style={styles.statsNumbers}>
              <TouchableOpacity onPress={() => navigation.navigate('Follower', { followers })}>
                <Text style={styles.statNumber}>{profileData.thong_ke?.nguoi_theo_doi || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Following', { following })}>
                <Text style={styles.statNumber}>{profileData.thong_ke?.dang_theo_doi || 0}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.bioText}>{profileData.bio || 'No bio available'}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Chia sẻ trang cá nhân</Text>
          </TouchableOpacity>
        </View>

        {profileData && (
          <PersonalInfo 
            profileData={profileData} 
          />
        )}

        <View style={styles.postsContainer}>
          <View style={styles.tabBar}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
              onPress={() => setActiveTab('posts')}
            >
              <Ionicons 
                name="grid-outline" 
                size={24} 
                color={activeTab === 'posts' ? '#0095F6' : '#262626'} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'posts' && styles.activeTabText
              ]}>
                Bài viết
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'travel' && styles.activeTab]}
              onPress={() => setActiveTab('travel')}
            >
              <Ionicons 
                name="airplane-outline" 
                size={24} 
                color={activeTab === 'travel' ? '#0095F6' : '#262626'} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === 'travel' && styles.activeTabText
              ]}>
                Du lịch
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postGrid}>
            {activeTab === 'posts' ? (
              normalPosts.length > 0 ? (
                normalPosts.map(post => renderPostItem(post))
              ) : (
                <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
              )
            ) : (
              travelPosts.length > 0 ? (
                travelPosts.map(post => renderPostItem(post))
              ) : (
                <Text style={styles.emptyText}>Chưa có bài viết du lịch nào</Text>
              )
            )}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={handleMenuClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={handleMenuClose}
        >
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('settings')}>
              <Ionicons name="settings-outline" size={24} color="black" />
              <Text style={styles.menuItemText}>Cài đặt</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('volunteer')}>
              <Ionicons name="person-add-outline" size={24} color="black" />
              <Text style={styles.menuItemText}>Đăng ký TNV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('logout')}>
              <Ionicons name="log-out-outline" size={24} color="black" />
              <Text style={styles.menuItemText}>Đăng xuất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuItemPress('support')}>
              <Ionicons name="help-circle-outline" size={24} color="black" />
              <Text style={styles.menuItemText}>Hỗ trợ</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};
const PersonalInfo = ({ profileData }) => {
  const [expanded, setExpanded] = useState(false);

  const infoItems = [
    { 
      icon: 'mail-outline', 
      label: 'Email', 
      value: profileData?.email,
      priority: 1
    },
    { 
      icon: 'call-outline', 
      label: 'Số điện thoại', 
      value: profileData?.sdt,
      priority: 2
    },
    { 
      icon: 'person-outline', 
      label: 'Giới tính', 
      value: profileData?.sex,
      priority: 3
    },
    { 
      icon: 'heart-outline', 
      label: 'Tình trạng hôn nhân', 
      value: profileData?.tinhtranghonnhan,
      priority: 4
    },
    { 
      icon: 'calendar-outline', 
      label: 'Ngày sinh', 
      value: profileData?.ngaysinh,
      priority: 5
    },
    { 
      icon: 'location-outline', 
      label: 'Địa chỉ', 
      value: profileData?.diachi,
      priority: 6
    },
  ]
  .filter(item => item.value) // Lọc các mục có giá trị
  .sort((a, b) => a.priority - b.priority); // Sắp xếp theo độ ưu tiên

  // Chỉ hiển thị 3 items đầu tiên khi thu gọn
  const displayedItems = expanded ? infoItems : infoItems.slice(0, 3);
  const hasMoreItems = infoItems.length > 3;

  const renderInfoItem = (item, index) => (
    <View 
      key={index} 
      style={[
        styles.infoItem,
        index === displayedItems.length - 1 && styles.lastItem
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={20} color="#666" />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{item.label}</Text>
        <Text 
          style={styles.infoValue}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.value}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.personalInfoContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        {infoItems.length === 0 && (
          <Text style={styles.emptyText}>Chưa có thông tin</Text>
        )}
      </View>

      <View style={styles.infoContent}>
        {displayedItems.map(renderInfoItem)}
      </View>

      {hasMoreItems && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandButtonText}>
            {expanded ? 'Thu gọn' : `Xem thêm (${infoItems.length - 3})`}
          </Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#0095f6"
            style={styles.expandIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
    marginTop: 10,
  },

  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  bioText:{
    marginLeft:"5%"
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 10,
  },

  infoText: {
    color: 'black',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15, // Thêm padding ngang cho toàn bộ container
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15, // Thêm padding dọc cho header
    paddingHorizontal: 10, // Thêm padding ngang cho header
   
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5, // Add some space between the username and the checkmark
  },
  verifiedIcon: {
    marginLeft: 5, // Add some space between the username and the checkmark
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15, // Tăng khoảng cách giữa các icon
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20, // Thêm padding dọc
    marginLeft:"2%"
  },
  avatarContainer: {
    marginRight: 20, // Tăng khoảng cách giữa avatar và stats
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
  updateAvatarIcon: {
    position: 'absolute',
    bottom: 10,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addStoryText: {
    color: 'black',
    fontSize: 15,
    marginTop: 5,
    marginLeft: 10,
  },
  statsContainer: {
    flex: 1,
    marginLeft: 20,
  },

  statsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },

  statsNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statLabel: {
    fontSize: 14,
    color: '#262626',
  },

  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10, // Tăng padding dọc cho button
    paddingHorizontal: 15, // Tăng padding ngang cho button
    borderRadius: 5,
    marginRight: 5,
  },
  personalInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },

  infoContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-out',
  },

  collapsedContent: {
    maxHeight: 180, // Adjust based on your needs
  },

  expandedContent: {
    maxHeight: undefined,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: '#262626',
    fontWeight: '500',
  },

  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  expandButtonText: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10, // Tăng padding dọc cho button
    paddingHorizontal: 15, // Tăng padding ngang cho button
    borderRadius: 5,
    marginLeft: 5,
  },
  shareButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addFriendButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  discoverSection: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  discoverTitle: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  discoverContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
  },
  discoverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  discoverTextContainer: {
    flex: 1,
  },
  discoverText: {
    color: 'black',
    fontSize: 14,
  },
  seeAllText: {
    color: '#0095F6',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 20,
  },


  loadingText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },



  postsContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 15, // Thêm padding dọc
  },
  
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  postItem: {
    width: (windowWidth - 45) / 2, // Điều chỉnh để có khoảng cách giữa các item
    marginBottom: 15, // Tăng khoảng cách giữa các hàng
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
    backgroundColor: '#fff',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 4,
  },
  postLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  travelDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 20,
  },
  tab: {
    paddingVertical: 10,
    flex: 1,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },
  tabContent: {
    padding: 20,
    alignItems: 'center',
  },
  tabContentText: {
    fontSize: 16,
    color: 'black',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: 'black',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
    marginBottom: 15,
  },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 8,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: 'black',
  },

  tabText: {
    fontSize: 16,
    color: '#262626',
  },

  activeTabText: {
    color: '#0095F6',
  },

  emptyText: {
    color: '#262626',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },

  postImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },

  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },

  noImageContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  multipleImagesIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },

  postInfo: {
    padding: 8,
  },

  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
  },

  postLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  travelDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },

  postStats: {
    flexDirection: 'row',
    marginTop: 4,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },

  statText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  expandButtonText: {
    color: '#0095f6',
    marginRight: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  personalInfoContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#262626',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },

  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  infoContent: {
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-out',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: '#262626',
    fontWeight: '500',
  },

  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  expandButtonText: {
    color: '#0095f6',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },

  expandIcon: {
    marginTop: 2,
  },
});



export default React.memo(MyProfile);
