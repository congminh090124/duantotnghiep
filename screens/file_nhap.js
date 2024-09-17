import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Tạo Bottom Tab Navigator
const Tab = createBottomTabNavigator();

const DangKiDulichScreen = ({ navigation }) => {
  const [find] = useState('');

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Row container for Back button and Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../assets/buttonback.png')} // Đường dẫn tới hình ảnh trong assets
              style={styles.backIcon}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.inputSearch}
            placeholder="Tìm kiếm địa điểm, bạn đồng hành..."
            keyboardType="email-address"
            value={find}
            numberOfLines={1}
          />

          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/622/622669.png" }}
            style={styles.image}
          />
          <Image
            source={{ uri: "https://cdn-icons-png.flaticon.com/128/2529/2529521.png" }}
            style={styles.image2}
          />
        </View>

        <Image
          source={require('../assets/coupleTravel.jpg')}
          style={styles.image3}
        />
        <Text style={styles.ttal}>Du lịch cùng bạn.</Text>
        <Text style={{ color: '#fff', marginTop: '2%', marginRight: '55%' }}>Khám phá thế giới</Text>
        <Text style={styles.td}>
          Du lịch cùng bạn bè không chỉ giúp bạn khám phá những địa điểm mới
          mà còn tạo ra những kỷ niệm đáng nhớ. Hãy cùng nhau lên kế hoạch cho chuyến đi tiếp theo,
          từ việc chọn địa điểm, đặt vé...
        </Text>

        <TouchableOpacity style={styles.dkn} onPress={handleBack}>
          <Text style={{ color: "#fff" }}>Đăng kí ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tht} onPress={handleBack}>
          <Text style={{ color: "#000" }}>Tìm hiểu thêm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Tạo thành phần chính chứa các Tab
const MainTabScreen = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Du Lịch" component={DangKiDulichScreen} />
      <Tab.Screen name="Nhắn Tin" component={NhanTinScreen} />
      <Tab.Screen name="Đăng Bài" component={DangBaiScreen} />
    </Tab.Navigator>
  );
};

// Đặt MainTabScreen vào NavigationContainer để sử dụng Navigation
const App = () => {
  return (
    <NavigationContainer>
      <MainTabScreen />
    </NavigationContainer>
  );
};

// Các style cho các thành phần
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inner: {
    padding: 16,
    flex: 1,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    height: '8%',
    marginTop: '4%',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {},
  inputSearch: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 19,
    backgroundColor: '#EBEDED',
    paddingHorizontal: 10,
    marginTop: '5%',
    paddingLeft: '11%',
  },
  image: {
    width: 18,
    height: 18,
    marginLeft: "-76%",
  },
  image2: {
    width: 25,
    height: 25,
    marginLeft: "77%",
  },
  image3: {
    width: '105%',
    marginTop: '-4%',
    height: '30%',
    borderRadius: 20,
  },
  ttal: {
    marginTop: '-25%',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: '-40%',
  },
  td: {
    marginTop: '15%',
  },
  dkn: {
    backgroundColor: '#17C6ED',
    marginTop: '5%',
    width: '100%',
    borderRadius: 10,
    alignItems: 'center',
    paddingTop: '3%',
    paddingBottom: '3%',
  },
  tht: {
    marginTop: '5%',
    width: '100%',
    height: '4%',
    alignItems: 'center',
  },
});

export default App;
