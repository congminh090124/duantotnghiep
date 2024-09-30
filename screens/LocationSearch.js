import React, { useState } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const API_KEY = 'AIzaSyAOVYRIgupAurZup5y1PRh8Ismb1A3lLao&libraries'; // Thay thế bằng API key của bạn

const LocationSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Handle search input
  const handleSearch = async () => {
    if (query.length > 2) {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${API_KEY}`
        );
        setSuggestions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Fetch location details when a suggestion is selected
  const selectLocation = async (placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${API_KEY}`
      );
      const location = response.data.result.geometry.location;
      setSelectedLocation({
        latitude: location.lat,
        longitude: location.lng,
      });
      setQuery('');
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching location details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Tìm kiếm địa điểm..."
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          handleSearch();
        }}
        style={styles.input}
      />
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selectLocation(item.place_id)}>
              <Text style={styles.suggestion}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: selectedLocation ? selectedLocation.latitude : 37.78825,
          longitude: selectedLocation ? selectedLocation.longitude : -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Địa điểm đã chọn"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 10,
    paddingHorizontal: 8,
    borderRadius: 5, // Thêm bo tròn
  },
  map: {
    flex: 1,
    marginTop: 10,
  },
  suggestion: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default LocationSearch;
