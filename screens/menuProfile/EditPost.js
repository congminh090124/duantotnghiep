import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { editPost, getPostDetails } from '../../apiConfig';
import * as ImagePicker from 'expo-image-picker';

const EditPost = ({ route, navigation }) => {
  const { postId, initialData } = route.params;
  const [title, setTitle] = useState(initialData.title);
  const [images, setImages] = useState(initialData.images || []);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditPost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      await editPost(postId, { 
        title, 
        images,
        newImages
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to edit post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewImages(prevImages => [
        ...prevImages,
        { 
          uri: result.assets[0].uri,
          type: 'image/jpeg', 
          name: `new_image_${prevImages.length + 1}.jpg` 
        },
      ]);
    }
  };
  
  const removeImage = (index, isNewImage = false) => {
    if (isNewImage) {
      setNewImages(prevImages => prevImages.filter((_, i) => i !== index));
    } else {
      setImages(prevImages => prevImages.filter((_, i) => i !== index));
    }
  };

  const renderImageItem = (imageUri, index, isNewImage) => (
    <View key={`${isNewImage ? 'new-' : ''}${index}`} style={styles.imageWrapper}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <TouchableOpacity onPress={() => removeImage(index, isNewImage)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Edit Post</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Images</Text>
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {images.map((imageUrl, index) => renderImageItem(imageUrl, index, false))}
          {newImages.map((image, index) => renderImageItem(image.uri, index, true))}
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]} 
          onPress={handleEditPost}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  disabledButton: {
    opacity: 0.7,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    padding: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default EditPost;
