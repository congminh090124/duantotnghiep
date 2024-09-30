import React, { useState, useEffect } from 'react';
import { Button, Alert, TextInput, View, StyleSheet, Image } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePost() {
  const [location, setLocation] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Không có quyền truy cập vị trí!');
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude
      });
    })();
  }, []);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Hãy nhập đầy đủ tiêu đề và nội dung!');
      return;
    }

    if (!location) {
      Alert.alert('Không thể lấy vị trí của bạn. Hãy thử lại.');
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('latitude', location.latitude);
    formData.append('longitude', location.longitude);

    if (image) {
      formData.append('image', {
        uri: image,
        name: image.split('/').pop(),
        type: 'image/jpeg', // You may want to dynamically set the type based on the selected image
      });
    }

    try {
      const response = await fetch('https://lacewing-evolving-generally.ngrok-free.app/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Bài viết đã được đăng thành công!');
      } else {
        Alert.alert('Có lỗi xảy ra khi đăng bài viết.');
      }
    } catch (error) {
      Alert.alert('Lỗi kết nối: ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Tiêu đề"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Nội dung"
        value={content}
        onChangeText={setContent}
        style={styles.input}
        multiline={true}
        numberOfLines={4}
      />
      <Button title="Chọn hình ảnh" onPress={handleImagePick} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title="Đăng bài viết" onPress={handleSubmit} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 12,
    borderRadius: 5,
  },
  button: {
    marginTop: 12,
  },
});
