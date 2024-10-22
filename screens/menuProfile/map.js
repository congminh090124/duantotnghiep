import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import debounce from 'lodash.debounce';

const MapSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchSuggestions = async (input) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    const url = `https://google-map-places.p.rapidapi.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&language=vi`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
        'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (result.predictions) {
        setSuggestions(result.predictions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  useEffect(() => {
    debouncedFetchSuggestions(searchQuery);
    return () => debouncedFetchSuggestions.cancel();
  }, [searchQuery]);

  const handleSelectLocation = async (place_id) => {
    const url = `https://google-map-places.p.rapidapi.com/maps/api/place/details/json?place_id=${place_id}&language=vi`;
    const options = {
      method: 'GET',    
      headers: {
        'x-rapidapi-key': '4d2ba14f7fmsh66b9c485a5f657bp141873jsn13ce867e117f',
        'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (result.result && result.result.geometry) {
        setSelectedLocation({
          latitude: result.result.geometry.location.lat,
          longitude: result.result.geometry.location.lng,
          text: result.result.name,
        });
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={setSearchQuery}
        value={searchQuery}
        placeholder="Nhập địa chỉ để tìm kiếm"
      />
      
      {suggestions.length > 0 && (
        <FlatList
          style={styles.suggestionList}
          data={suggestions}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectLocation(item.place_id)}>
              <Text style={styles.suggestionItem}>{item.description}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.place_id}
        />
      )}
      
      <MapView 
        style={styles.map} 
        region={selectedLocation ? {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : {
          latitude: 14.0583,
          longitude: 108.2772,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.text}
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
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 30,
    marginHorizontal: 10,
    paddingLeft: 10,
  },
  suggestionList: {
    maxHeight: 200,
    backgroundColor: 'white',
    marginHorizontal: 10,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  map: {
    flex: 1,
  },
});

export default MapSearch;