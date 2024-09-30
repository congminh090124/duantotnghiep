import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'https://lacewing-evolving-generally.ngrok-free.app'; // Thay thế bằng URL API của bạn

export default function TravelloApp() {
  const [region, setRegion] = useState({
    latitude: 15.8700,
    longitude: 100.9925,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [posts, setPosts] = useState([]);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', image: null });
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();

    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };


  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setNewPost({ ...newPost, image: result.uri });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {posts.map((post) => (
          <Marker
            key={post._id}
            coordinate={{
              latitude: post.location.coordinates[1],
              longitude: post.location.coordinates[0],
            }}
          >
            <View style={styles.markerContainer}>
              <Image
                source={{ uri: `${API_URL}${post.image}` }}
                style={styles.markerImage}
              />
              <View style={styles.markerBadge}>
                <Text style={styles.markerBadgeText}>100+</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>
      
      <TouchableOpacity
        style={styles.newPostButton}
        onPress={() => setShowNewPostForm(!showNewPostForm)}
      >
        <Text style={styles.newPostButtonText}>
          {showNewPostForm ? 'Cancel' : 'New Post'}
        </Text>
      </TouchableOpacity>

      {showNewPostForm && (
        <ScrollView style={styles.newPostForm}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newPost.title}
            onChangeText={(text) => setNewPost({ ...newPost, title: text })}
          />
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="Content"
            multiline
            value={newPost.content}
            onChangeText={(text) => setNewPost({ ...newPost, content: text })}
          />
          <Button title="Pick an image" onPress={pickImage} />
          {newPost.image && (
            <Image source={{ uri: newPost.image }} style={styles.previewImage} />
          )}
          <Button title="Create Post" onPress={handleCreatePost} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 60,
    height: 60,
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 2,
  },
  markerBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newPostButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  newPostButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  newPostForm: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    maxHeight: '60%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  previewImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    marginVertical: 10,
  },
});