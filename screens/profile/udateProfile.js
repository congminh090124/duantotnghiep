import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { updateProfile, getUserProfile } from '../../apiConfig';

const ProfileEditScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    sdt: '',
    diachi: '',
    sex: '',
    tinhtranghonnhan: '',
  });
  const [showMaritalStatusModal, setShowMaritalStatusModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const maritalStatusOptions = ['Độc thân', 'Đã kết hôn', 'Ly hôn'];
  const genderOptions = ['Nam', 'Nữ', 'Khác'];
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    fetchUserProfile();
  }, [navigation]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await getUserProfile();
      setProfile({
        username: userData.username || '',
        bio: userData.bio || '',
        sdt: userData.sdt || '',
        diachi: userData.diachi || '',
        sex: userData.sex || '',
        tinhranghonnhan: userData.tinhtranghonnhan || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      await updateProfile(profile);
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={24} color="#007AFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chỉnh sửa trang cá nhân</Text>
      <View style={{ width: 24 }} />
    </View>
  );

  

  const renderTextField = (label, value, placeholder, onChangeText, keyboardType = 'default') => (
    <View style={styles.textFieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderGenderSelection = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.label}>Giới tính</Text>
      <TouchableOpacity
        style={styles.selectionButton}
        onPress={() => setShowGenderModal(true)}
      >
        <Text style={styles.selectionButtonText}>
          {profile.sex || 'Chọn giới tính'}
        </Text>
        <Icon name="chevron-down" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  const renderGenderModal = () => (
    <Modal
      visible={showGenderModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn giới tính</Text>
          <FlatList
            data={genderOptions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setProfile({ ...profile, sex: item });
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowGenderModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderMaritalStatusSelection = () => (
    <View style={styles.selectionContainer}>
      <Text style={styles.label}>Tình trạng hôn nhân</Text>
      <TouchableOpacity
        style={styles.selectionButton}
        onPress={() => setShowMaritalStatusModal(true)}
      >
        <Text style={styles.selectionButtonText}>
          {profile.tinhtranghonnhan || 'Chọn tình trạng hôn nhân'}
        </Text>
        <Icon name="chevron-down" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
  const renderMaritalStatusModal = () => (
    <Modal
      visible={showMaritalStatusModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Chọn tình trạng hôn nhân</Text>
          <FlatList
            data={maritalStatusOptions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setProfile({ ...profile, tinhtranghonnhan: item });
                  setShowMaritalStatusModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowMaritalStatusModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView>
        {renderTextField('Tên người dùng', profile.username, 'Tên người dùng', (text) => setProfile({ ...profile, username: text }))}
        {renderTextField('Tiểu sử', profile.bio, 'Tiểu sử', (text) => setProfile({ ...profile, bio: text }))}
        {renderTextField('Số điện thoại', profile.sdt, 'Số điện thoại', (text) => setProfile({ ...profile, sdt: text }), 'numeric')}
        {renderTextField('Địa chỉ', profile.diachi, 'Địa chỉ', (text) => setProfile({ ...profile, diachi: text }))}
        {renderGenderSelection()}
        {renderMaritalStatusSelection()}
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile}>
          <Text style={styles.updateButtonText}>Cập nhật hồ sơ</Text>
        </TouchableOpacity>
      </ScrollView>
      {renderMaritalStatusModal()}
     {renderGenderModal()}
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
    genderContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
      },
      maritalStatusContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#333',
      },
      radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      radio: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 8,
      },
      radioSelected: {
        backgroundColor: '#007AFF',
      },
      radioLabel: {
        fontSize: 16,
        color: '#fff',
      },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    marginRight: 20,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  textFieldContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#999',
  },
  linkFieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  linkPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkPlaceholderText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: '#0095f6',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  selectionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectionButtonText: {
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileEditScreen;