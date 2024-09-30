import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserProfile, updateAvatar } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const API_BASE_URL = 'https://lacewing-evolving-generally.ngrok-free.app';

const MyProfile = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchProfile();
  }, [fetchProfile]));

  const handleEditProfile = () => {
    navigation.navigate('UpdateProfile', { 
      profileData,
      onProfileUpdate: fetchProfile
    });
  };

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

        // Resize and compress the image
        const manipulatedImage = await manipulateAsync(
          imageUri,
          [{ resize: { width: 300 } }],
          { compress: 0.7, format: SaveFormat.JPEG }
        );

        const updatedProfile = await updateAvatar(manipulatedImage.uri);
        
        setProfileData(prevState => ({
          ...prevState,
          avatar: updatedProfile.avatar
        }));

        Alert.alert('Success', 'Avatar updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  }, []);

  const avatarUri = useMemo(() => {
    return profileData?.anh_dai_dien
      ? `${API_BASE_URL}${profileData.anh_dai_dien}`
      : null;
  }, [profileData?.anh_dai_dien]);

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
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="lock-closed-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.username}>{profileData.username}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="timer-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="add-outline" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
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
            {/* {renderStatItem('bài viết', profileData.thong_ke.bai_viet)} */}
            {renderStatItem('người theo dõi', profileData.thong_ke.nguoi_theo_doi, () => navigation.navigate('Follower', { initialTab: 1 }))}
            {renderStatItem('đang theo dõi', profileData.thong_ke.dang_theo_doi, () => navigation.navigate('Follower', { initialTab: 0 }))}
          </View>
        </View>
        <Text style={styles.addStoryText}>{profileData.bio}</Text>
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
            <Ionicons name="call-outline" size={20} color="black" />
            <Text style={styles.infoText}>{profileData.tinhtranghonnhan || 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="grid-outline" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="play-outline" size={28} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="person-outline" size={28} color="gray" />
          </TouchableOpacity>
        </View>

        <View style={styles.postsContainer}>
          {/* Add your posts here */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const renderStatItem = (label, value, onPress) => (
  <TouchableOpacity style={styles.statItem} onPress={onPress} disabled={!onPress}>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({
  sectionTitle: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 10,
    marginTop: 10,
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
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  username: {
    color: 'black',
    fontSize: 23,
    fontWeight: 'bold',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
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
    paddingVertical: 8,
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
  tab: {
    paddingVertical: 10,
  },
  postsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
});



export default React.memo(MyProfile);