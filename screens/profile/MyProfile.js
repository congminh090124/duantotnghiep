import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getUserProfile, updateAvatar } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'https://lacewing-evolving-generally.ngrok-free.app';

const MyProfile = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Unable to fetch profile. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profileData });
  };

  const handleUpdateAvatar = async () => {
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
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const updatedProfile = await updateAvatar(imageUri);
        
        setProfileData(prevState => ({
          ...prevState,
          avatar: updatedProfile.avatar
        }));

        Alert.alert('Success', 'Avatar updated successfully', [
          { text: 'OK', onPress: fetchProfile }
        ]);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!profileData) {
    return <Text>No profile data available</Text>;
  }

  const avatarUri = profileData.anh_dai_dien
    ? `${API_BASE_URL}${profileData.anh_dai_dien}`
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={styles.profileImage}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <TouchableOpacity style={styles.updateAvatarIcon} onPress={handleUpdateAvatar}>
              <Ionicons name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profileData.ten}</Text>
            <Text style={styles.profileBio}>{profileData.bio}</Text>
          </View>
          <View style={styles.statsContainer}>
            {renderStatItem('Người theo dõi', profileData.thong_ke.nguoi_theo_doi, () => navigation.navigate('Follower', { initialTab: 1 }))}
            {renderStatItem('Đang theo dõi', profileData.thong_ke.dang_theo_doi, () => navigation.navigate('Follower', { initialTab: 0 }))}
            {renderStatItem('Bài viết', profileData.thong_ke.bai_viet)}
          </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
        <View style={styles.infoContainer}>
          {renderInfoItem('mail-outline', profileData.email)}
          {renderInfoItem('call-outline', profileData.sdt)}
          {renderInfoItem('location-outline', profileData.diachi)}
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

const renderInfoItem = (iconName, text) => (
  <View style={styles.infoItem}>
    <Ionicons name={iconName} size={24} color="gray" />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  updateAvatarIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileBio: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: 'gray',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
  },
});

export default MyProfile;