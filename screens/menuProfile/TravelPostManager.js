import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { getAllTravelPosts, deleteTravelPost } from '../../apiConfig';
import * as Location from 'expo-location';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import Icon from 'react-native-vector-icons/Entypo'; // Hoặc bất kỳ thư viện icon nào bạn đang sử dụng

const TravelPostManager = ({ navigation }) => {
  const [travelPosts, setTravelPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTravelPosts();
  }, []);

  const fetchTravelPosts = async () => {
    try {
      const data = await getAllTravelPosts();
     
      const postsWithLocationNames = await Promise.all(
        data.map(async (post) => ({
          ...post,
          currentLocationName: await getLocationName(post.currentLocation),
          destinationName: await getLocationName(post.destination),
        }))
      );
      setTravelPosts(postsWithLocationNames);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching travel posts:', error);
      setLoading(false);
    }
  };

  const getLocationName = async (location) => {
    if (!location || !location.coordinates) {
      return 'Vị trí không xác định';
    }

    try {
      const [longitude, latitude] = location.coordinates;
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result.length > 0) {
        const { city, region, country } = result[0];
        return `${city || ''}, ${region || ''}, ${country || ''}`.trim();
      } else {
        return 'Không tìm thấy địa chỉ';
      }
    } catch (error) {
      console.error('Lỗi khi chuyển đổi tọa độ:', error);
      return 'Lỗi khi tải địa chỉ';
    }
  };

  const formatDate = (dateString) => {
   
    if (!dateString) return 'Chưa xác định';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'Ngày không hợp lệ';
      }
      const result = date.toLocaleDateString('vi-VN');
     
      return result;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Lỗi định dạng ngày';
    }
  };

  const handleEdit = (post) => {
    navigation.navigate('EditTravelPost', { post });
  };

  const handleDelete = async (postId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bài viết này?",
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          onPress: async () => {
            try {
              await deleteTravelPost(postId);
              setTravelPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
            } catch (error) {
              console.error('Lỗi khi xóa bài viết:', error);
              Alert.alert("Lỗi", "Không thể xóa bài viết. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {item.images && item.images.length > 0 && (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>Từ: {formatDate(item.startDate)} - Đến: {formatDate(item.endDate)}</Text>
        <Text style={styles.location}>Vị trí hiện tại: {item.currentLocationName}</Text>
        <Text style={styles.location}>Muốn đến: {item.destinationName}</Text>
        <View style={styles.menuContainer}>
          <Menu>
            <MenuTrigger style={styles.menuTrigger}>
              <Icon name="dots-three-vertical" size={20} style={styles.menuTriggerIcon} />
            </MenuTrigger>
            <MenuOptions customStyles={{
              optionsContainer: styles.menuOptions,
            }}>
              <MenuOption onSelect={() => handleEdit(item)} customStyles={{
                optionWrapper: styles.menuOption,
                optionText: styles.menuOptionText,
              }}>
                <Text>Sửa</Text>
              </MenuOption>
              <MenuOption onSelect={() => handleDelete(item._id)} customStyles={{
                optionWrapper: [styles.menuOption, styles.lastMenuOption],
                optionText: styles.menuOptionText,
              }}>
                <Text>Xóa</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <MenuProvider>
      <View style={styles.container}>
        <Text style={styles.header}>Quản lý bài viết Travel</Text>
        <FlatList
          data={travelPosts}
          renderItem={renderItem}
          keyExtractor={item => item._id.toString()}
        />
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  menuContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  menuTrigger: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  menuTriggerIcon: {
    color: '#333',
  },
  menuOptions: {
    marginTop: 30,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#333',
  },
  lastMenuOption: {
    borderBottomWidth: 0,
  },
  image: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  menuTrigger: {
    padding: 4,
  },
  menuOptions: {
    marginTop: 20,
  },
  menuOption: {
    padding: 10,
  },
});

export default TravelPostManager;
