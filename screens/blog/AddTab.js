import React, { useState } from 'react';
import { View } from 'react-native';
import AddOptionsModal from '../modal/AddOptionsModal';

const AddTab = () => {
  const [isModalVisible, setModalVisible] = useState(true);

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <AddOptionsModal isVisible={isModalVisible} onClose={closeModal} />
    </View>
  );
};

export default AddTab;