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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { editTravelPost } from '../../apiConfig';
import MapView, { Marker } from 'react-native-maps';

const { width } = Dimensions.get('window');
const inputWidth = width - 40; // 20px padding on each side

const EditTravelPost = ({ route, navigation }) => {
  const { post } = route.params;
  const [title, setTitle] = useState(post.title);
  const [startDate, setStartDate] = useState(new Date(post.startDate));
  const [endDate, setEndDate] = useState(new Date(post.endDate));
  const [destination, setDestination] = useState(post.destination);
  const [destinationName, setDestinationName] = useState(post.destinationName);
  const [images, setImages] = useState(post.images);
  const [isLoading, setIsLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const handleUpdatePost = async () => {
    setIsLoading(true);
    try {
      const updatedPost = await editTravelPost(post._id, {
        title,
        startDate,
        endDate,
        destinationLat: destination.coordinates[1],
        destinationLng: destination.coordinates[0],
        destinationName,
        images
      });
      setIsLoading(false);
      Alert.alert('Thành công', 'Bài viết đã được cập nhật');
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Lỗi', 'Không thể cập nhật bài viết');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map(asset => asset.uri)]);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onChangeDate = (event, selectedDate, setDate, setShowPicker) => {
    const currentDate = selectedDate || (setDate === setStartDate ? startDate : endDate);
    setShowPicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nhập tiêu đề bài viết"
        />

        <View style={styles.dateContainer}>
          <View style={styles.dateWrapper}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text>{startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => 
                  onChangeDate(event, selectedDate, setStartDate, setShowStartDatePicker)
                }
              />
            )}
          </View>
          <View style={styles.dateWrapper}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text>{endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => 
                  onChangeDate(event, selectedDate, setEndDate, setShowEndDatePicker)
                }
              />
            )}
          </View>
        </View>

        <Text style={styles.label}>Địa điểm</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: destination.coordinates[1],
            longitude: destination.coordinates[0],
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          onPress={(e) => setDestination({
            type: 'Point',
            coordinates: [e.nativeEvent.coordinate.longitude, e.nativeEvent.coordinate.latitude]
          })}
        >
          <Marker
            coordinate={{
              latitude: destination.coordinates[1],
              longitude: destination.coordinates[0],
            }}
          />
        </MapView>

        <Text style={styles.label}>Tên địa điểm</Text>
        <TextInput
          style={styles.input}
          value={destinationName}
          onChangeText={setDestinationName}
          placeholder="Nhập tên địa điểm"
        />

        <Text style={styles.label}>Hình ảnh</Text>
        <View style={styles.imageContainer}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: img }} style={styles.image} />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                <Text style={styles.removeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={pickImage}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.updateButton} 
          onPress={handleUpdatePost}
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
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: inputWidth,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateWrapper: {
    width: inputWidth / 2 - 10,
  },
  datePicker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  map: {
    width: inputWidth,
    height: 200,
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  imageWrapper: {
    width: (inputWidth - 30) / 3,
    height: (inputWidth - 30) / 3,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    width: (inputWidth - 30) / 3,
    height: (inputWidth - 30) / 3,
    margin: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 30,
    color: '#888',
  },
  updateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  updateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    alignItems: 'center',
  },
});

export default EditTravelPost;
