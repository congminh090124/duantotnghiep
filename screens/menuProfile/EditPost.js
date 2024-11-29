import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { editPost } from '../../apiConfig';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const EditPost = ({ route, navigation }) => {
  const { postId, initialData } = route.params;
  const [title, setTitle] = useState(initialData.title);
  const [images, setImages] = useState(initialData.images || []);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditPost = async () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Tiêu đề không được để trống');
      return;
    }

    setIsLoading(true);
    try {
      await editPost(postId, { 
        title, 
        images,
        newImages
      });
      Alert.alert('Thành công', 'Bài viết đã được cập nhật');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật bài viết. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newSelectedImages = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: `new_image_${newImages.length + index + 1}.jpg`
      }));
      setNewImages(prevImages => [...prevImages, ...newSelectedImages]);
    }
  };
  
  const confirmRemoveImage = (index, isNewImage = false) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa hình ảnh này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: () => removeImage(index, isNewImage)
        }
      ]
    );
  };

  const removeImage = (index, isNewImage = false) => {
    if (isNewImage) {
      setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
    } else {
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sửa bài viết</Text>
        </View>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Tiêu đề"
        />

        <View style={styles.imageContainer}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
              <TouchableOpacity style={styles.removeButton} onPress={() => confirmRemoveImage(index)}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          {newImages.map((img, index) => (
            <View key={`new-${index}`} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.image} />
              <TouchableOpacity style={styles.removeButton} onPress={() => confirmRemoveImage(index, true)}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={pickImages}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={handleEditPost}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.updateButtonText}>Cập nhật bài viết</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    width: '20%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backIcon: {
    color: '#495057',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginRight: '20%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212529',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    marginBottom: 24,
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 4,
    marginBottom: 24,
    marginHorizontal: 4,
  },
  imageWrapper: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  removeButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DEE2E6',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 24,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  updateButton: {
    backgroundColor: '#228BE6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    marginHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButtonLoading: {
    width: 20,
    height: 20,
  },
  disabledButton: {
    backgroundColor: '#ADB5BD',
    opacity: 0.8,
  },
});

export default EditPost;