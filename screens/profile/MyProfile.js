import React, { useState, useCallback, useMemo, useRef, useEffect, state } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator, RefreshControl, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserProfile, updateAvatar, getUserPosts, getFollowers, getFollowing, getMyTravelPosts } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../../context/SocketContext';
import * as Location from 'expo-location';

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
  const { socket } = useSocket();
  const [locationNames, setLocationNames] = useState({});

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
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
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
        Alert.alert('Quyền truy cập bị từ chối', 'Xin lỗi, chúng tôi cần quyền truy cập thư viện ảnh để cập nhật ảnh đại diện.');
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

        Alert.alert('', 'Cập Nhật Ảnh Đại Diện Thành Công');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Failed to update avatar. Please try again.');
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
        navigation.navigate('Settings');
        break;
      case 'volunteer':
        navigation.navigate('VolunteerRegistration');
        break;
      case 'logout':
        Alert.alert(
          "Đăng xuất",
          "Bạn có chắc chắn muốn đăng xuất?",
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Đăng xuất",
              onPress: async () => {
                try {
                  // Ngắt kết nối socket trước
                  if (socket) {
                    socket.disconnect();
                  }
                  
                  // Xóa toàn bộ AsyncStorage
                  await AsyncStorage.clear();
                  
                  // Reset navigation và chuyển đến màn hình đăng nhập
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'DangNhap' }],
                  });
                } catch (error) {
                  console.error('Lỗi khi đăng xuất:', error);
                  Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
                }
              }
            }
          ]
        );
        break;
      case 'support':
        navigation.navigate('Support');
        break;
    }
  }, [navigation, socket]);

  // Thêm hàm helper để xử lý location
  const getLocationString = (location) => {
    if (!location) return 'No location';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && location.coordinates) {
      return `${location.coordinates[1]}, ${location.coordinates[0]}`;
    }
    return 'No location';
  };

  const getLocationName = async (coordinates) => {
    try {
      if (!coordinates || coordinates.length < 2) {
        return 'Không xác định';
      }

      // Đảm bảo thứ tự latitude, longitude đúng
      const [longitude, latitude] = coordinates;
      
      //console.log('Getting location for:', { latitude, longitude });

      const result = await Location.reverseGeocodeAsync(
        { latitude, longitude },
        { useGoogleMaps: false }
      );

      //console.log('Geocoding result:', result);

      if (result && result.length > 0) {
        const address = result[0];
        // Ưu tiên district -> city -> region để hiển thị địa chỉ ngắn gọn nhất
        return address.district || address.city || address.region || 'Không xác định';
      }
      
      return 'Không xác định';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Không xác định';
    }
  };

  const renderPostItem = useCallback((post) => {
    const postLocations = locationNames[post._id] || {};
    
    // Xử lý hiển thị location tùy theo loại bài viết
    const renderLocation = () => {
      if (activeTab === 'posts') {
        // Bài viết thường
        return (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {postLocations.location || 'Đang tải...'}
            </Text>
          </View>
        );
      } else {
        // Bài viết du lịch
        return (
          <>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                Từ: {postLocations.current || 'Đang tải...'}
              </Text>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons name="navigate-outline" size={12} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                Đến: {postLocations.destination || 'Đang tải...'}
              </Text>
            </View>
          </>
        );
      }
    };

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
            {post.title || 'Chưa có tiêu đề'}
          </Text>
          
          {renderLocation()}

          {activeTab === 'travel' && post.startDate && post.endDate && (
            <Text style={styles.travelDate}>
              {new Date(post.startDate).toLocaleDateString('vi-VN')} -
              {new Date(post.endDate).toLocaleDateString('vi-VN')}
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
  }, [activeTab, handlePostPress, locationNames]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          //console.log('Permission to access location was denied');
          return;
        }

        const names = {};
        const postsToProcess = activeTab === 'posts' ? normalPosts : travelPosts;
        
        await Promise.all(
          postsToProcess.map(async (post) => {
            if (post._id) {
              if (activeTab === 'posts') {
                // Xử lý bài viết thường
                if (post.location?.coordinates) {
                  names[post._id] = {
                    location: await getLocationName(post.location.coordinates)
                  };
                }
              } else {
                // Xử lý bài viết du lịch
                names[post._id] = {
                  current: post.currentLocation?.coordinates ? 
                    await getLocationName(post.currentLocation.coordinates) : 'Không xác định',
                  destination: post.destination?.coordinates ? 
                    await getLocationName(post.destination.coordinates) : 'Không xác định'
                };
              }
            }
          })
        );
        
        //console.log('Processed location names:', names);
        setLocationNames(names);
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    
    loadLocations();
  }, [normalPosts, travelPosts, activeTab]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095F6" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return <Text style={styles.errorText}>Không có dữ liệu người dùng</Text>;
  }



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0095F6']} // Android
            tintColor="#0095F6" // iOS
          />
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
                <Text style={styles.placeholderText}>Chưa có ảnh</Text>
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
            <View style={styles.statsNumbers}>
              <View style={styles.statNumberContainer}>
                <Text style={styles.statNumber}>
                  {(normalPosts?.length || 0) + (travelPosts?.length || 0)}
                </Text>
              </View>
              <TouchableOpacity style={styles.statNumberContainer}
               onPress={() => navigation.navigate('Follower', { userId: profileData._id })}>
                <Text style={styles.statNumber}>
                  {profileData.thong_ke?.nguoi_theo_doi || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statNumberContainer}
                 onPress={() => navigation.navigate('Following', { userId: profileData._id })}>
                <Text style={styles.statNumber}>
                  {profileData.thong_ke?.dang_theo_doi || 0}
                  
                </Text>
                
              </TouchableOpacity>
            </View>

            <View style={styles.statsLabels}>
              <Text style={styles.statLabel}>bài viết</Text>
              <Text style={styles.statLabel}>người theo dõi</Text>
              <Text style={styles.statLabel}>đang theo dõi</Text>
            </View>
          </View>
        </View>

        <Text style={styles.bioText}>{profileData.bio || 'Chưa có tiểu sử'}</Text>

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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
  verifiedIcon: {
    marginLeft: 6,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 24,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    color: '#666',
  },
  updateAvatarIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statsContainer: {
    flex: 1,
  },
  statsNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statNumberContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
  },
  statsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  bioText: {
    paddingHorizontal: 16,
    marginTop: 12,
    color: '#262626',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#0095F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  shareButtonText: {
    color: '#262626',
    fontWeight: '600',
  },
  postsContainer: {
    marginTop: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0095F6',
  },
  tabText: {
    color: '#262626',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#0095F6',
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  postItem: {
    width: (windowWidth - 32) / 2,
    marginHorizontal: 4,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  postImageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  locationText: {
    marginLeft: 2,
    fontSize: 11,
    color: '#666',
  },
  postStats: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  travelDate: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  personalInfoContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: 'white',
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
  infoContent: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  lastItem: {
    marginBottom: 0,
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    marginRight: 12,
    width: 32,
    alignItems: 'center',
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
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  expandButtonText: {
    color: '#0095F6',
    fontWeight: '500',
    marginRight: 4,
  },
  expandIcon: {
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#262626',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
});



export default React.memo(MyProfile);
