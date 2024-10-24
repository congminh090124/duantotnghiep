import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Image, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { getAllPosts } from '../../apiConfig';

const CustomMarker = ({ user }) => (
  <View style={styles.markerContainer}>
    <Image source={{ uri: user.avatar }} style={styles.avatar} />
    <View style={styles.usernameContainer}>
      <Text style={styles.username}>{user.username}</Text>
    </View>
  </View>
);

const PostCallout = ({ post }) => (
  <ScrollView style={styles.calloutContainer}>
    <Text style={styles.calloutTitle}>{post.title}</Text>
    <Image source={{ uri: post.images[0] }} style={styles.calloutImage} />
    <Text style={styles.calloutUsername}>By: {post.user.username}</Text>
    <Text style={styles.calloutLikes}>Likes: {post.likesCount}</Text>
    <Text style={styles.calloutComments}>Comments: {post.commentsCount}</Text>
    <Text style={styles.calloutDate}>Posted on: {new Date(post.createdAt).toLocaleDateString()}</Text>
  </ScrollView>
);

const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Fetch all posts
        const postsData = await getAllPosts();
        console.log('Posts data:', JSON.stringify(postsData, null, 2));
        setPosts(postsData);
      } catch (error) {
        setErrorMsg('Error getting location or fetching posts');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location ? location.coords.latitude : 0,
    longitude: location ? location.coords.longitude : 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {posts.map((post) => (
          <Marker
            key={post._id}
            coordinate={{
              latitude: post.location.coordinates[1],
              longitude: post.location.coordinates[0],
            }}
          >
            <CustomMarker user={post.user} />
            <Callout>
              <PostCallout post={post} />
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  usernameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  calloutContainer: {
    width: 250,
    maxHeight: 300,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    marginBottom: 5,
  },
  calloutUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  calloutLikes: {
    fontSize: 12,
    marginBottom: 2,
  },
  calloutComments: {
    fontSize: 12,
    marginBottom: 2,
  },
  calloutDate: {
    fontSize: 12,
    color: 'gray',
  },
});

export default MapScreen;
