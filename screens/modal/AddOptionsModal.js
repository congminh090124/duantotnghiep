import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal,Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AddOptionsModal = ({ isVisible, onClose }) => {
  const navigation = useNavigation();

  const options = [
    { title: 'Đăng bài', screen: 'TaoTrangTimBanDuLich' },
    { title: 'Tạo blog', screen: 'CreatePost' },
   
    { title: 'Đăng ký TNV', screen: 'DangKiTinhNguyenVienScreen' },
  ];

  const handleOptionPress = (screen) => {
    onClose();
    if (screen === 'DangKiTinhNguyenVienScreen') {
      Alert.alert(
        "Thông báo",
        "Chức năng này đang được phát triển và sẽ sớm ra mắt!",
        [{ text: "OK" }]
      );
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalContent}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handleOptionPress(option.screen)}
            >
              <Text style={styles.optionText}>{option.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddOptionsModal;