import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator, Modal, Animated, Platform, KeyboardAvoidingView, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import * as Location from 'expo-location';
import { getUserProfileById, getUserPostsWithID, followUser, unfollowUser, getUserTravelPosts, blockUser, unblockUser, getBlockStatus, getToken, API_ENDPOINTS } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BlockedProfileView from '../report/BlockedProfileView';
import ReportForm from '../report/ReportForm';
const windowWidth = Dimensions.get('window').width;
const imageSize = (windowWidth - 45) / 2;

const PersonalInfo = ({ userProfile }) => {
  const [expanded, setExpanded] = useState(false);

  const infoItems = [
    { 
      icon: 'mail-outline', 
      label: 'Email', 
      value: userProfile?.email,
      priority: 1
    },
    { 
      icon: 'call-outline', 
      label: 'Số điện thoại', 
      value: userProfile?.sdt,
      priority: 2
    },
    { 
      icon: 'person-outline', 
      label: 'Giới tính', 
      value: userProfile?.sex,
      priority: 3
    },
    { 
      icon: 'heart-outline', 
      label: 'Tình trạng hôn nhân', 
      value: userProfile?.tinhtranghonnhan,
      priority: 4
    },
    { 
      icon: 'calendar-outline', 
      label: 'Ngày sinh', 
      value: userProfile?.ngaysinh,
      priority: 5
    },
    { 
      icon: 'location-outline', 
      label: 'Địa chỉ', 
      value: userProfile?.diachi,
      priority: 6
    },
  ]
  .filter(item => item.value)
  .sort((a, b) => a.priority - b.priority);

  const displayedItems = expanded ? infoItems : infoItems.slice(0, 3);
  const hasMoreItems = infoItems.length > 3;

  return (
    <View style={styles.personalInfoContainer}>
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      <View style={styles.infoContent}>
        {displayedItems.map((item, index) => (
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
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          </View>
        ))}
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
            name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
            size={20} 
            color="#0095f6"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const PostItem = React.memo(({ post, activeTab, onPress }) => {
  const [locationName, setLocationName] = useState('No location');

  useEffect(() => {
    const getLocationName = async () => {
      // Log dữ liệu location từ post
      console.log('Post Location Data:', {
        postId: post._id,
        location: post.location,
        title: post.title
      });

      // Kiểm tra nếu location là GeoJSON format
      if (post.location?.coordinates) {
        try {
          // GeoJSON coordinates là [longitude, latitude]
          const result = await Location.reverseGeocodeAsync({
            longitude: post.location.coordinates[0],
            latitude: post.location.coordinates[1]
          });

          console.log('Geocoding Result:', result);

          if (result[0]) {
            const address = [
              result[0].street,
              result[0].district,
              result[0].city,
              result[0].region,
            ].filter(Boolean).join(', ');
            console.log('Formatted Address:', address);
            setLocationName(address || 'No location');
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          setLocationName('No location');
        }
      } else if (activeTab === 'travel') {
        // Đối với travel posts, thử lấy địa điểm từ destination hoặc currentLocation
        try {
          const location = post.destination || post.currentLocation;
          if (location?.coordinates) {
            const result = await Location.reverseGeocodeAsync({
              longitude: location.coordinates[0],
              latitude: location.coordinates[1]
            });

            if (result[0]) {
              const address = [
                result[0].street,
                result[0].district,
                result[0].city,
                result[0].region,
              ].filter(Boolean).join(', ');
              setLocationName(address || 'No location');
            }
          }
        } catch (error) {
          console.error('Travel post location error:', error);
          setLocationName('No location');
        }
      }
    };

    getLocationName();
  }, [post.location, post.destination, post.currentLocation, activeTab]);

  // Log render của PostItem
  console.log('Rendering PostItem:', {
    postId: post._id,
    title: post.title,
    locationName,
    activeTab,
    hasLocation: post.location?.coordinates ? 'yes' : 'no',
    hasDestination: post.destination?.coordinates ? 'yes' : 'no',
    hasCurrentLocation: post.currentLocation?.coordinates ? 'yes' : 'no'
  });

  return (
    <TouchableOpacity 
      style={styles.postItem}
      onPress={() => onPress(post)}
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
        
        {activeTab === 'travel' && (
          <>
            <Text style={styles.postLocation} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} color="#666" />
              {locationName}
            </Text>
            {post.startDate && (
              <Text style={styles.travelDate}>
                <Ionicons name="calendar-outline" size={12} color="#666" />
                {new Date(post.startDate).toLocaleDateString()}
              </Text>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
});

const UserProfile = ({ route }) => {
  const { userId } = route.params;
  const [userProfile, setUserProfile] = useState(null);
  const [normalPosts, setNormalPosts] = useState([]);
  const [travelPosts, setTravelPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingMe, setIsFollowingMe] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedBy, setIsBlockedBy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { id } = JSON.parse(userData);
          setCurrentUserId(id);
        }
      } catch (error) {
        console.error('Error fetching current user ID:', error);
      }
    };
    getCurrentUserId();
  }, []);

  const checkBlockStatus = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.checkBlockStatus}/${userId}`, {
        headers: { 'Authorization': `Bearer ${await getToken()}` }
      });
      const data = await response.json();
      setIsBlocked(data.isBlocked);
      setIsBlockedBy(data.isBlockedBy);
      return data;
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Kiểm tra block status trước
        const blockStatus = await checkBlockStatus();
        
        if (!blockStatus?.isBlocked && !blockStatus?.isBlockedBy) {
          const data = await getUserProfileById(userId);
          setUserProfile(data);
          setIsFollowing(data.isFollowing);
          setIsFollowingMe(data.isFollowingMe);
          setIsFriend(data.isFollowing && data.isFollowingMe);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileData, postsData, travelPostsData] = await Promise.all([
          getUserProfileById(userId),
          getUserPostsWithID(userId),
          getUserTravelPosts(userId)
        ]);
        
        // Log dữ liệu fetch được
        console.log('Fetched User Data:', {
          profile: profileData,
          normalPosts: postsData,
          travelPosts: travelPostsData
        });

        setUserProfile(profileData);
        setNormalPosts(postsData);
        setTravelPosts(travelPostsData);
        setIsFollowing(profileData.isFollowing || false);
        setIsFollowingMe(profileData.isFollowingMe || false);
        setIsFriend(profileData.isFollowing && profileData.isFollowingMe);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (isFollowing) {
      Alert.alert(
        "Xác nhận hủy theo dõi",
        isFriend ? 
          "Bạn có chắc chắn muốn hủy kết bạn với người dùng này?" :
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
                setIsFriend(false);
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
      try {
        const result = await followUser(userId);
        setIsFollowing(true);
        const newIsFriend = isFollowingMe;
        setIsFriend(newIsFriend);
        setUserProfile(prevProfile => ({
          ...prevProfile,
          thong_ke: {
            ...prevProfile.thong_ke,
            nguoi_theo_doi: prevProfile.thong_ke.nguoi_theo_doi + 1
          }
        }));
        Alert.alert('Thành công', 
          newIsFriend ? 'Các bạn đã trở thành bạn bè!' : 'Đã theo dõi thành công!'
        );
      } catch (error) {
        console.error('Error following user:', error);
        Alert.alert('Lỗi', 'Không thể theo dõi người dùng này');
      }
    }
  };

  const avatarUri = useMemo(() => userProfile?.anh_dai_dien || null, [userProfile?.anh_dai_dien]);

  const handlePostPress = useCallback((post) => {
    // Log khi user nhấn vào post
    console.log('Post Pressed:', {
      postId: post._id,
      title: post.title,
      activeTab
    });

    if (!post?._id) {
      Alert.alert('Lỗi', 'Không thể mở bài viết này');
      return;
    }

    if (activeTab === 'travel') {
      navigation.navigate('TravelPostDetail', { 
        postId: post._id,
        title: post.title || 'Chi tiết bài viết du lịch'
      });
    } else {
      navigation.navigate('PostDetailScreen', { 
        postId: post._id,
        title: post.title || 'Chi tiết bài viết',
        currentUserId: currentUserId
      });
    }
  }, [navigation, activeTab,currentUserId]);

  const renderFollowButton = useCallback(() => {
    if (isFollowingMe && !isFollowing) {
      return (
        <TouchableOpacity
          style={[styles.followButton, styles.followBackButton]}
          onPress={handleFollowToggle}
        >
          <Text style={styles.followBackButtonText}>Theo dõi lại</Text>
        </TouchableOpacity>
      );
    }

    if (isFriend) {
      return (
        <TouchableOpacity
          style={[styles.followButton, styles.friendButton]}
          onPress={handleFollowToggle}
        >
          <Text style={styles.friendButtonText}>Bạn bè</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.followButton,
          isFollowing ? styles.followingButton : styles.notFollowingButton
        ]}
        onPress={handleFollowToggle}
      >
        <Text style={[
          styles.followButtonText,
          isFollowing ? styles.followingButtonText : styles.notFollowingButtonText
        ]}>
          {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
        </Text>
      </TouchableOpacity>
    );
  }, [isFriend, isFollowingMe, isFollowing]);

  const renderPostItem = useCallback((post) => {
    return (
      <PostItem 
        key={post._id} 
        post={post} 
        activeTab={activeTab} 
        onPress={handlePostPress}
      />
    );
  }, [activeTab, handlePostPress]);

  const handleMessagePress = useCallback(() => {
    if (!userId || !userProfile) {
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện vào lúc này');
      return;
    }

    navigation.navigate('ChatScreen', {
      userId: userId, // ID của người nhận tin nhắn
      userName: userProfile.username || 'Người dùng', // Tên người nhận
      userAvatar: userProfile.anh_dai_dien || null // Avatar của người nhận
    });
  }, [navigation, userId, userProfile]);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 20,
      stiffness: 90
    }).start();
  }, [slideAnim]);

  const handleMenuClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setIsMenuVisible(false);
    });
  }, [slideAnim]);

  const handleReportPress = useCallback(() => {
    handleMenuClose();
    setTimeout(() => {
      setIsReportVisible(true);
    }, 300);
  }, [handleMenuClose]);

  const handleCloseReport = useCallback(() => {
    setIsReportVisible(false);
  }, []);

  const handleReportSubmit = useCallback(async (reportData) => {
    setIsReportVisible(false);
  }, []);

  const handleBlockUser = useCallback(async () => {
    try {
      if (isBlocked) {
        await unblockUser(userId);
        setIsBlocked(false);
        const data = await getUserProfileById(userId);
        setUserProfile(data);
      } else {
        await blockUser(userId);
        setIsBlocked(true);
        setIsFollowing(false);
        setIsFriend(false);
        setUserProfile(prev => ({
          ...prev,
          thong_ke: {
            ...prev.thong_ke,
            nguoi_theo_doi: Math.max(0, prev.thong_ke.nguoi_theo_doi - 1)
          }
        }));
      }
      handleMenuClose();
      Alert.alert('Thành công', 
        isBlocked ? 'Đã bỏ chặn người dùng này' : 'Đã chặn người dùng này'
      );
    } catch (error) {
      console.error('Block/unblock error:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
    }
  }, [isBlocked, userId, handleMenuClose]);

  // Thêm function xác nhận block
  const confirmBlock = () => {
    Alert.alert(
      'Xác nhận chặn người dùng',
      `Khi chặn ${userProfile?.username}:\n\n` +
      '• Họ sẽ không thể xem trang cá nhân của bạn\n' +
      '• Họ sẽ không thể nhắn tin cho bạn\n' +
      '• Các lượt theo dõi giữa hai bên sẽ bị hủy\n' +
      '• Họ sẽ không thấy bài viết và bình luận của bạn\n\n' +
      'Bạn có chắc chắn muốn chặn không?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Chặn',
          style: 'destructive',
          onPress: handleBlockUser
        }
      ],
      { cancelable: true }
    );
  };

  // Log mỗi khi activeTab thay đổi
  useEffect(() => {
    console.log('Active Tab Changed:', {
      activeTab,
      normalPostsCount: normalPosts.length,
      travelPostsCount: travelPosts.length
    });
  }, [activeTab, normalPosts.length, travelPosts.length]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.usernameContainer}>
        <Text style={styles.username}>{userProfile?.username}</Text>
        {userProfile?.xacMinhDanhTinh && (
          <Ionicons name="checkmark-circle" size={20} color="#1DA1F2" style={styles.verifiedIcon} />
        )}
      </View>
      {currentUserId !== userId && (
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="ellipsis-vertical" size={24} color="black" />
        </TouchableOpacity>
      )}
      {currentUserId === userId && <View style={{ width: 24 }} />}
    </View>
  ), [navigation, userProfile, userId, currentUserId, handleMenuPress]);

  const renderMenuOptions = useCallback(() => {
    if (!isMenuVisible) return null;

    const slideAnimation = {
      transform: [{
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0]
        })
      }]
    };

    return (
      <Modal
        transparent
        visible={isMenuVisible}
        onRequestClose={handleMenuClose}
        animationType="none"
      >
        <TouchableWithoutFeedback onPress={handleMenuClose}>
          <View style={styles.menuModalContainer}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.menuContent, slideAnimation]}>
                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={handleReportPress}
                >
                  <Ionicons name="warning-outline" size={24} color="#FF3B30" />
                  <Text style={[styles.menuOptionText, styles.reportText]}>
                    Báo cáo người dùng
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuOption}
                  onPress={confirmBlock}
                >
                  <Ionicons 
                    name={isBlocked ? "person-add-outline" : "person-remove-outline"} 
                    size={24} 
                    color="#FF3B30" 
                  />
                  <Text style={[styles.menuOptionText, styles.blockText]}>
                    {isBlocked ? 'Bỏ chặn người dùng' : 'Chặn người dùng'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.menuOption, styles.cancelOption]}
                  onPress={handleMenuClose}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }, [isMenuVisible, isBlocked, handleMenuClose, handleReportPress, confirmBlock, slideAnim]);

  // Thêm hàm handleUnblock
  const handleUnblock = useCallback(async () => {
    try {
      Alert.alert(
        'Xác nhận bỏ chặn',
        `Bạn có chắc chắn muốn bỏ chặn ${userProfile?.username || 'người dùng này'}?`,
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'Bỏ chặn',
            onPress: async () => {
              try {
                await unblockUser(userId);
                setIsBlocked(false);
                
                // Cập nhật lại thông tin profile
                const data = await getUserProfileById(userId);
                setUserProfile(data);
                
                Alert.alert('Thành công', 'Đã bỏ chặn người dùng');
              } catch (error) {
                console.error('Error unblocking user:', error);
                Alert.alert('Lỗi', 'Không thể bỏ chặn người dùng này');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleUnblock:', error);
      Alert.alert('Lỗi', 'Không thể thực hiện thao tác này');
    }
  }, [userId, userProfile?.username]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  if (isBlocked || isBlockedBy) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <BlockedProfileView 
          isBlocked={isBlocked}
          isBlockedBy={isBlockedBy}
          onUnblock={handleUnblock}
          username={userProfile?.username}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {renderHeader()}
        
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
              <Text style={styles.statNumber}>{normalPosts.length + travelPosts.length}</Text>
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
          {renderFollowButton()}
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={handleMessagePress}
          >
            <Text style={styles.messageButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <PersonalInfo userProfile={userProfile} />

        {/* Posts Section with Tabs */}
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

      {/* Report Form */}
      {isReportVisible && (
        <ReportForm
          isVisible={isReportVisible}
          onClose={handleCloseReport}
          targetId={userId}
          targetType="User"
          onSubmit={handleReportSubmit}
        />
      )}

      {/* Menu Options */}
      {renderMenuOptions()}
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
    paddingBottom: 20,
  },
  followButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  notFollowingButton: {
    backgroundColor: '#0095f6',
  },
  followingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  followBackButton: {
    backgroundColor: '#0095f6',
    borderWidth: 0,
  },
  friendButton: {
    backgroundColor: '#e8f0fe',
    borderWidth: 1,
    borderColor: '#0095f6',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notFollowingButtonText: {
    color: '#fff',
  },
  followingButtonText: {
    color: '#262626',
  },
  followBackButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  friendButtonText: {
    color: '#0095f6',
    fontWeight: '600',
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
  friendButton: {
    backgroundColor: '#34B7F1',
  },
  followBackButton: {
    backgroundColor: '#FF6B6B',
  },
  defaultButton: {
    backgroundColor: '#0095f6',
  },
  followingButton: {
    backgroundColor: '#ddd',
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
    paddingHorizontal: 15,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#0095F6',
  },
  tabText: {
    fontSize: 14,
    color: '#262626',
  },
  activeTabText: {
    color: '#0095F6',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20,
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
  },
  multipleImagesIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  postLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  travelDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noImageContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    overflow: 'hidden',
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
  lastItem: {
    borderBottomWidth: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  reportText: {
    color: '#FF3B30',
  },
  blockText: {
    color: '#FF3B30',
  },
  unblockText: {
    color: '#007AFF',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 8,
  },
  menuHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },
  reportText: {
    color: '#FF3B30',
  },
  blockText: {
    color: '#FF3B30',
  },
  unblockText: {
    color: '#007AFF',
  },
  menuModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  menuOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  cancelOption: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  cancelText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default React.memo(UserProfile);

