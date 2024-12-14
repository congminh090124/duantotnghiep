import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';

const Support = () => {
  const navigation = useNavigation();

  const handlePhonePress = () => {
    Linking.openURL('tel:0935993453');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:kien36652@gmail.com');
  };

  const handleFacebookPress = () => {
    Linking.openURL('https://www.facebook.com/profile.php?id=100035922318878');
  };

  const admin = {
    id: '675c20e676fd189d3df2698f',
    username: 'Admin',
    avatar: require('../assets/vvv.png'),
    role: 'admin',
  };

  const handleChatSupportPress = () => {
    navigation.navigate('ChatScreen', {
      userId: admin.id,
      userName: admin.username,
      userAvatar: admin.avatar,
      blockStatus: {
        isBlocked: false,
        isBlockedBy: false,
        canMessage: true,
      },
      role: admin.role,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Hỗ Trợ</Text>
      <Text style={styles.subtitle}>Thông tin liên hệ</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
          <Ionicons name="call" size={24} color="#007bff" style={styles.icon} />
          <Text style={styles.contactText}>0935993453</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
          <Ionicons name="mail" size={24} color="#28a745" style={styles.icon} />
          <Text style={styles.contactText}>kien36652@gmail.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleFacebookPress}>
          <Ionicons name="logo-facebook" size={24} color="#4267B2" style={styles.icon} />
          <Text style={styles.contactText}>Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleChatSupportPress}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#ff6347" style={styles.icon} />
          <Text style={styles.contactText}>Liên hệ Admin Chat Hỗ Trợ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f6fc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 15,
  },
  icon: {
    marginRight: 15,
  },
  contactText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
  },
});

export default Support;
