import React, { useState, useCallback, useMemo } from 'react';
import { Dimensions, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserProfile, updateAvatar, getUserPosts, getFollowers, getFollowing } from '../../apiConfig';
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

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileData, postsData, followersData, followingData] = await Promise.all([
        getUserProfile(),
        getUserPosts(),
        getFollowers(),
        getFollowing()
      ]);
      setProfileData(profileData);
      setPosts(postsData);
      setFollowers(followersData);
      setFollowing(followingData);
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
      profileData,
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
    navigation.navigate('PostDetailScreen', { postId: post._id });
  }, [navigation]);

  const renderStatItem = useCallback(({ label, value, onPress }) => (
    <TouchableOpacity style={styles.statItem} onPress={onPress} disabled={!onPress}>
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
         
          <Text style={styles.username}>{profileData.username}</Text>
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
            {renderStatItem({
              label: 'người theo dõi',
              value: profileData.thong_ke?.nguoi_theo_doi || 0,
              onPress: () => navigation.navigate('Follower', { followers })
            })}
            {renderStatItem({
              label: 'đang theo dõi',
              value: profileData.thong_ke?.dang_theo_doi || 0,
              onPress: () => navigation.navigate('Following', { following })
            })}
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

        <View style={styles.personalInfoContainer}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="black" />
            <Text style={styles.infoText}>{profileData.email || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={20} color="black" />
            <Text style={styles.infoText}>{profileData.sex || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="black" />
            <Text style={styles.infoText}>{profileData.sdt || 'Chưa cập nhật'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="heart-outline" size={20} color="black" />
            <Text style={styles.infoText}>{profileData.tinhtranghonnhan || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.postsContainer}>
          <Text style={styles.sectionTitle}>My Posts</Text>
          <View style={styles.postGrid}>
            {posts.map((post, index) => (
              <TouchableOpacity
                key={post._id || index}
                style={styles.postItem}
                onPress={() => handlePostPress(post)}
              >
                {post.images && post.images.length > 0 && (
                  <Image
                    source={{ uri: post.images[0] }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.postInfo}>
                  <Text style={styles.postTitle} numberOfLines={1}>{post.title || 'Untitled'}</Text>
                  <Text style={styles.postLocation} numberOfLines={1}>
                    {typeof post.location === 'string' ? post.location : 'No location'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
  username: {
    fontSize: 18,
    fontWeight: 'bold',
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
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 20, // Tăng khoảng cách giữa các stat
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
  editButtonText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
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
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  postLocation: {
    fontSize: 12,
    color: '#666',
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
});



export default React.memo(MyProfile);