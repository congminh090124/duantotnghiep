import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, Dimensions } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import API_ENDPOINTS, { getToken, getAllPostsMap } from '../../apiConfig';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const ProfileMapScreen = () => {
  const [posts, setPosts] = useState([]);
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchPosts();
    getCurrentLocation();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getAllPostsMap();
      console.log('Fetched posts for map:', data);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts for map:', error);
    }
  };

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log('Current location:', location);
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    };
    setRegion(newRegion);
    setUserLocation(location.coords);
  };

  if (!region) {
    return <View style={styles.container}><Text>Loading map...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="blue"
          />
        )}
        {posts.map((post) => (
          <Marker
            key={post.id}
            coordinate={{
              latitude: post.location.coordinates[1],
              longitude: post.location.coordinates[0],
            }}
            title={post.title}
            description={post.username}
          >
            <Image
              source={{ uri: `${API_ENDPOINTS.socketURL}${post.thumbnail}` }}
              style={styles.markerImage}
            />
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{post.title}</Text>
                <Text>{post.username}</Text>
              </View>
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  calloutContainer: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default ProfileMapScreen;