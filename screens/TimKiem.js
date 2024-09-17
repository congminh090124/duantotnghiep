import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';

const data = [
  {
    id: '1',
    title: 'Khám phá hà nội',
    price: '$300',
    duration: '4 ngày',
    image: 'https://i.pinimg.com/236x/98/4d/00/984d005fc7938b1bcf5c25211b2b1966.jpg', // Replace with your image
    rating: '4.5',
  },
  {
    id: '2',
    title: 'Du lịch đà nẵng',
    price: '$450',
    duration: '5 ngày',
    image: 'https://i.pinimg.com/236x/56/9f/43/569f43aa91c4aafb4acc833480fbfcf6.jpg', // Replace with your image
    rating: '4.7',
  },
  {
    id: '3',
    title: 'Tham quan Sapa',
    price: '$400',
    duration: '3 ngày',
    image: 'https://i.pinimg.com/236x/b1/ca/f8/b1caf85ea7e70f44121dc7201c4cee98.jpg', // Replace with your image
    rating: '4.6',
  },
  {
    id: '3',
    title: 'Tham quan Sapa',
    price: '$400',
    duration: '3 ngày',
    image: 'https://i.pinimg.com/236x/d7/3a/7f/d73a7f4225944538b3a7868c7bdc1b81.jpg', // Replace with your image
    rating: '4.6',
  },
  {
    id: '3',
    title: 'Tham quan Sapa',
    price: '$400',
    duration: '3 ngày',
    image: 'https://i.pinimg.com/236x/bf/ac/84/bfac848519ecb6fe2778d99f5ee2ba9f.jpg', // Replace with your image
    rating: '4.6',
  },
];

const App = () => {
  const [filter, setFilter] = useState('Gia đình');
  const [expandedSections, setExpandedSections] = useState({
    departureDate: false,
    destination: false,
    budget: false,
    travelType: false,
    rating: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
   
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>
          {item.price} - {item.duration}
        </Text>
      </View>
      <TouchableOpacity style={styles.starButton}>
        <Text>☆</Text>
      </TouchableOpacity>
      
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm thông báo, điểm đến..."
        />
      </View>

      {/* Filter Sections */}
      <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>

      <TouchableOpacity
        onPress={() => toggleSection('departureDate')}
        style={styles.filterSection}
      >
        <Text style={styles.filterTitle}>Ngày khởi hành</Text>
        <Text>{expandedSections.departureDate ? '-' : '+'}</Text>
      </TouchableOpacity>
      {expandedSections.departureDate && (
        <Text style={styles.filterContent}>
          Vui lòng chọn các tiêu chí du lịch để phù hợp với bạn
        </Text>
      )}

      <TouchableOpacity
        onPress={() => toggleSection('destination')}
        style={styles.filterSection}
      >
        <Text style={styles.filterTitle}>Điểm đến</Text>
        <Text>{expandedSections.destination ? '-' : '+'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toggleSection('budget')}
        style={styles.filterSection}
      >
        <Text style={styles.filterTitle}>Ngân sách</Text>
        <Text>{expandedSections.budget ? '-' : '+'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toggleSection('travelType')}
        style={styles.filterSection}
      >
        <Text style={styles.filterTitle}>Loại hình du lịch</Text>
        <Text>{expandedSections.travelType ? '-' : '+'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => toggleSection('rating')}
        style={styles.filterSection}
      >
        <Text style={styles.filterTitle}>Đánh giá</Text>
        <Text>{expandedSections.rating ? '-' : '+'}</Text>
      </TouchableOpacity>

      {/* Filters */}
      <Text style={styles.sectionTitle}>Bộ lọc</Text>
      <View style={styles.filters}>
        <TouchableOpacity
          style={filter === 'Gia đình' ? styles.filterActive : styles.filterButton}
          onPress={() => setFilter('Gia đình')}
        >
          <Text>Gia đình</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={filter === 'Một mình' ? styles.filterActive : styles.filterButton}
          onPress={() => setFilter('Một mình')}
        >
          <Text>Một mình</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={filter === 'Phiêu lưu' ? styles.filterActive : styles.filterButton}
          onPress={() => setFilter('Phiêu lưu')}
        >
          <Text>Phiêu lưu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={filter === 'Thư giãn' ? styles.filterActive : styles.filterButton}
          onPress={() => setFilter('Thư giãn')}
        >
          <Text>Thư giãn</Text>
        </TouchableOpacity>
      </View>

      {/* List of Items */}
      <ScrollView>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        scrollEnabled={false} // Disable internal scroll of FlatList as ScrollView is wrapping it
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:"10%",
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  searchBar: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
  },
  searchInput: {
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 10,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  filterContent: {
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#666',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filterActive: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#6EB8FF',
  },
  list: {
    paddingVertical: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
   
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  starButton: {
    padding: 10,
  },
});

export default App;
