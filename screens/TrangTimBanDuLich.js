import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = () => {
  // Array of image URIs (you can replace these with real image URLs)
  const images = [
    'https://i.pinimg.com/564x/35/32/a0/3532a09f083ef3e512b3f5c412a369ea.jpg',
    'https://i.pinimg.com/564x/cb/66/54/cb6654c65688ad61a40c132a471b2b2a.jpg',
    'https://i.pinimg.com/564x/35/fa/22/35fa22795204c0748f7e099adb7b6e64.jpg',
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Image */}
      <Image
        source={{ uri: 'https://i.pinimg.com/564x/f1/ad/59/f1ad590ef809b3292f130d8d71556e65.jpg' }}
        style={styles.profileImage}
      />

      {/* User Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.userName}>Bo, 22</Text>
        <Text style={styles.tagline}>Bún đậu nước mắm</Text>

        {/* Icon and Text Info (Location, Height, etc.) */}
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={20} color="#555" />
          <Text style={styles.infoText}>Đang ở Buôn Ma Thuột</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="male" size={20} color="#555" />
          <Text style={styles.infoText}>190 cm</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="glass" size={20} color="#555" />
          <Text style={styles.infoText}>Không bao giờ</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="home" size={20} color="#555" />
          <Text style={styles.infoText}>Quê quán Buôn Ma Thuột, Đắk Lắk, Vietnam</Text>
        </View>
         {/* Icon and Text Info (Location, Height, etc.) */}
         <View style={styles.orderDulich}>
         <Icon name="plane" size={20} color="#555" />



          <Text style={styles.orderDulichText}>Muốn tìm 2 người bạn nam đi du lịch tại Động Phong Nha</Text>
        
        </View>
         {/* Icon and Text Info (Location, Height, etc.) */}
         <View style={styles.orderDulich}>
         <Icon name="clock-o" size={20} color="#555" />
          <Text style={styles.orderDulichText}>Thời gian : 2 ngày 1 đêm</Text>
        
        </View>


        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButtonx}>
            <Icon name="times" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="heart" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Image Scroll Section */}
      <View style={styles.imageScrollContainer}>
        <Text style={styles.sectionTitle}>Hình ảnh của họ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map((image, index) => (
            <Image key={index} source={{ uri: image }} style={styles.scrollImage} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  profileImage: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    padding: 20,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
  },
  actionButtons: {
   
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  actionButton: {
    backgroundColor: '#00CC33',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonx: {
    backgroundColor: '#CC0000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageScrollContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  orderDulich: {
    marginLeft:"-2%",
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    marginVertical: 10,
  },
  orderDulichText: {
    fontSize: 16, // Increase the font size
    color: '#333',
    fontWeight: 'bold', // Make the text bold
    marginLeft: 10, // Add space between the icon and the text
  },
});

export default ProfileScreen;
