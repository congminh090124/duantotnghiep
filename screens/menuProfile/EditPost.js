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
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { editPost } from '../../apiConfig';

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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    margin: 5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: 30,
    color: '#888',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default EditPost;