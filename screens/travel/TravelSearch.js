import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchTravelPosts } from '../../apiConfig';
import DateTimePicker from '@react-native-community/datetimepicker';

const TravelSearch = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [interests, setInterests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState(null);

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        query: searchQuery,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
        ...(interests.length > 0 && { interests: interests.join(',') }),
      };
      
      const searchResults = await searchTravelPosts(params);
      setResults(searchResults);
    } catch (error) {
      Alert.alert('Error', 'Failed to search posts');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, startDate, endDate, interests]);

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => navigation.navigate('TravelPostDetail', { postId: item._id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultLocation}>{item.destinationName}</Text>
        <Text style={styles.resultDate}>
          {new Date(item.startDate).toLocaleDateString()} - 
          {new Date(item.endDate).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search travel posts..."
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={dateType === 'start' ? startDate || new Date() : endDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              if (dateType === 'start') {
                setStartDate(selectedDate);
              } else {
                setEndDate(selectedDate);
              }
            }
          }}
        />
      )}

      {/* Interest Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.interestsContainer}
      >
        {['Beach', 'Mountain', 'City', 'Culture', 'Food'].map((interest) => (
          <TouchableOpacity
            key={interest}
            style={[
              styles.interestTag,
              interests.includes(interest) && styles.interestTagSelected
            ]}
            onPress={() => {
              if (interests.includes(interest)) {
                setInterests(interests.filter(i => i !== interest));
              } else {
                setInterests([...interests, interest]);
              }
            }}
          >
            <Text style={[
              styles.interestText,
              interests.includes(interest) && styles.interestTextSelected
            ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0095f6" />
      ) : (
        <FlatList
          data={results}
          renderItem={renderSearchResult}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.resultsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchHeader: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  filterButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  interestsContainer: {
    padding: 15,
  },
  interestTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  interestTagSelected: {
    backgroundColor: '#0095f6',
  },
  interestText: {
    color: '#666',
  },
  interestTextSelected: {
    color: '#fff',
  },
  resultCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 15,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultLocation: {
    color: '#666',
    marginBottom: 5,
  },
  resultDate: {
    color: '#666',
    fontSize: 12,
  },
});

export default TravelSearch; 