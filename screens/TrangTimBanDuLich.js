import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, SafeAreaView, StatusBar, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const users = [
  {
    id: 1,
    name: 'Bo, 22',
    tagline: 'Bún đậu nước mắm',
    location: 'Đang ở Buôn Ma Thuột',
    height: '190 cm',
    drinking: 'Không bao giờ',
    travel: 'Muốn tìm 2 bạn nam đi Chùa Hương',
    duration: 'Thời gian : 2 ngày 1 đêm',
    images: [
      'https://i.pinimg.com/564x/35/32/a0/3532a09f083ef3e512b3f5c412a369ea.jpg',
      'https://i.pinimg.com/564x/cb/66/54/cb6654c65688ad61a40c132a471b2b2a.jpg',
      'https://i.pinimg.com/564x/35/fa/22/35fa22795204c0748f7e099adb7b6e64.jpg',
    ],
  },
  {
    id: 2,
    name: 'An, 24',
    tagline: 'Cà phê và sách',
    location: 'Đang ở Hà Nội',
    height: '175 cm',
    drinking: 'Thỉnh thoảng',
    travel: 'Muốn tìm 1 bạn đi Hội An',
    duration: 'Thời gian : 3 ngày 2 đêm',
    images: [
      'https://i.pinimg.com/originals/87/bd/b6/87bdb674394ad69ad541b8877a07765a.jpg',
      'https://i.pinimg.com/736x/b7/46/cb/b746cb4d46585e75affbd8458b86f2ac.jpg',
      'https://i.pinimg.com/736x/7e/08/c4/7e08c4fd1cec21f88cdfaef82dff87fa.jpg',
    ],
  },
  {
    id: 3,
    name: 'An, 24',
    tagline: 'Cà phê và sách',
    location: 'Đang ở Hà Nội',
    height: '175 cm',
    drinking: 'Thỉnh thoảng',
    travel: 'Muốn tìm 1 bạn đi Hội An',
    duration: 'Thời gian : 3 ngày 2 đêm',
    images: [
      'https://i.pinimg.com/originals/87/bd/b6/87bdb674394ad69ad541b8877a07765a.jpg',
      'https://i.pinimg.com/736x/b7/46/cb/b746cb4d46585e75affbd8458b86f2ac.jpg',
      'https://i.pinimg.com/736x/7e/08/c4/7e08c4fd1cec21f88cdfaef82dff87fa.jpg',
    ],
  },
];

const ProfileScreen = () => {
  const renderItem = ({ item: user }) => (
    <View style={styles.userContainer}>
      <FlatList
        data={user.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${user.id}-${index}`}
        renderItem={({ item: image }) => (
          <Image source={{ uri: image }} style={styles.profileImage} />
        )}
      />

      <View style={styles.textOverlay}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.tagline}>{user.tagline}</Text>

        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#fff" />
          <Text style={styles.infoText}>{user.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="male" size={20} color="#fff" />
          <Text style={styles.infoText}>{user.height}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="glass" size={20} color="#fff" />
          <Text style={styles.infoText}>{user.drinking}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="plane" size={20} color="#fff" />
          <Text style={styles.infoText}>{user.travel}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="clock-o" size={20} color="#fff" />
          <Text style={styles.infoText}>{user.duration}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButtonx}>
          <Icon name="times" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="heart" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNavBar = () => (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navItem}>
        <Text style={styles.navText}>Ban bè</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem}>
        <Text style={styles.navText}>Đã follow</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
        <Text style={[styles.navText, styles.activeNavText]}>Đề xuất</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchButton}>
        <Icon name="search" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          snapToInterval={height}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        />
        {renderNavBar()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  navItem: {
    paddingHorizontal: 10,
  },
  navText: {
    color: '#fff',
    fontSize: width * 0.04, // Responsive font size
  },
  activeNavItem: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  activeNavText: {
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
  },
  userContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
  },
  profileImage: {
    width,
    height: height * 0.6, // Responsive height
    resizeMode: 'cover',
  },
  textOverlay: {
    position: 'absolute',
    bottom: height * 0.2, // Responsive position
    left: width * 0.05,
    right: width * 0.05,
  },
  userName: {
    fontSize: width * 0.08, // Responsive font size
    fontWeight: 'bold',
    color: '#fff',
  },
  tagline: {
    fontSize: width * 0.045, // Responsive font size
    color: '#fff',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 10,
    fontSize: width * 0.04, // Responsive font size
    color: '#fff',
  },
  actionButtons: {
    position: 'absolute',
    bottom: "50%",
    right: 5,
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    // backgroundColor: '#00CC33',
    width: width * 0.15, // Responsive width
    height: width * 0.15, // Responsive height
    borderRadius: (width * 0.15) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonx: {
    // backgroundColor: '#ff3333',
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: (width * 0.15) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default ProfileScreen;
